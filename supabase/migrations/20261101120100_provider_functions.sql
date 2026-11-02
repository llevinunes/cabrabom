-- Functions called through RPC by the server (service_role only, ADR 0030).

-- Search (spec section 8): providers of a category within a radius,
-- free first, then by distance, recommendations as tie-breaker.
create function public.search_providers(
  p_lat double precision,
  p_lng double precision,
  p_radius_km int,
  p_category_id int
)
returns table (
  id uuid,
  name text,
  neighborhood text,
  busy boolean,
  distance_km numeric,
  categories text[],
  recommendation_count bigint
)
language sql
stable
set search_path = public, extensions
as $$
  with origin as (
    select st_makepoint(p_lng, p_lat)::geography as point,
           least(greatest(p_radius_km, 1), 100) * 1000 as radius_m
  )
  select p.id,
         p.name,
         p.neighborhood,
         p.busy,
         round((st_distance(p.location, o.point) / 1000)::numeric, 1) as distance_km,
         array_agg(distinct c.name order by c.name) as categories,
         (select count(*) from recommendations r
           where r.provider_id = p.id and r.visible) as recommendation_count
    from providers p
    cross join origin o
    join provider_categories pc on pc.provider_id = p.id
    join categories c on c.id = pc.category_id and c.active
   where not p.hidden
     and st_dwithin(p.location, o.point, o.radius_m)
     and exists (select 1 from provider_categories x
                  where x.provider_id = p.id and x.category_id = p_category_id)
   group by p.id, o.point
   order by p.busy asc, distance_km asc, recommendation_count desc;
$$;

create function public.distance_to_provider(
  p_provider_id uuid,
  p_lat double precision,
  p_lng double precision
)
returns numeric
language sql
stable
set search_path = public, extensions
as $$
  select round((st_distance(location, st_makepoint(p_lng, p_lat)::geography) / 1000)::numeric, 1)
    from providers
   where id = p_provider_id;
$$;

-- Creates a provider and its categories in one transaction. If the WhatsApp
-- number is already registered, returns the existing id without changes.
create function public.create_provider(
  p_name text,
  p_whatsapp text,
  p_lat double precision,
  p_lng double precision,
  p_neighborhood text,
  p_city text,
  p_category_ids int[]
)
returns uuid
language plpgsql
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  insert into providers (name, whatsapp, location, neighborhood, city, whatsapp_consent_at)
  values (p_name, p_whatsapp, st_makepoint(p_lng, p_lat)::geography, p_neighborhood, p_city, now())
  on conflict (whatsapp) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from providers where whatsapp = p_whatsapp;
    return v_id;
  end if;

  insert into provider_categories (provider_id, category_id)
  select v_id, unnest(p_category_ids);

  return v_id;
end;
$$;

create function public.set_provider_location(
  p_provider_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_neighborhood text,
  p_city text
)
returns void
language sql
set search_path = public, extensions
as $$
  update providers
     set location = st_makepoint(p_lng, p_lat)::geography,
         neighborhood = p_neighborhood,
         city = p_city
   where id = p_provider_id;
$$;

-- Only the server (service_role) may call these functions.
revoke execute on function public.search_providers(double precision, double precision, int, int) from public, anon, authenticated;
revoke execute on function public.distance_to_provider(uuid, double precision, double precision) from public, anon, authenticated;
revoke execute on function public.create_provider(text, text, double precision, double precision, text, text, int[]) from public, anon, authenticated;
revoke execute on function public.set_provider_location(uuid, double precision, double precision, text, text) from public, anon, authenticated;
grant execute on function public.search_providers(double precision, double precision, int, int) to service_role;
grant execute on function public.distance_to_provider(uuid, double precision, double precision) to service_role;
grant execute on function public.create_provider(text, text, double precision, double precision, text, text, int[]) to service_role;
grant execute on function public.set_provider_location(uuid, double precision, double precision, text, text) to service_role;

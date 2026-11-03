-- 0005 · v0.8.0 · PR #14
-- State (UF) of the provider, so a place without a neighborhood can be shown as
-- "City - UF". Functions gain p_state and search returns city and state.

alter table public.providers
  add column state text check (state ~ '^[A-Z]{2}$');

-- New parameter → new signature: drop the old functions first.
drop function public.create_provider(text, text, double precision, double precision, text, text, int[]);
drop function public.set_provider_location(uuid, double precision, double precision, text, text);
drop function public.search_providers(double precision, double precision, int, int);

create function public.create_provider(
  p_name text,
  p_whatsapp text,
  p_lat double precision,
  p_lng double precision,
  p_neighborhood text default null,
  p_city text default null,
  p_category_ids int[] default null,
  p_state text default null
)
returns uuid
language plpgsql
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  perform assert_valid_coordinates(p_lat, p_lng);
  if coalesce(cardinality(p_category_ids), 0) = 0 then
    raise exception 'a provider needs at least one category' using errcode = '22023';
  end if;

  insert into providers (name, whatsapp, location, neighborhood, city, state, whatsapp_consent_at)
  values (p_name, p_whatsapp, coarse_point(p_lat, p_lng), p_neighborhood, p_city, p_state, now())
  on conflict (whatsapp) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from providers where whatsapp = p_whatsapp;
    return v_id;
  end if;

  insert into provider_categories (provider_id, category_id)
  select distinct v_id, unnest(p_category_ids);

  return v_id;
end;
$$;

create function public.set_provider_location(
  p_provider_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_neighborhood text default null,
  p_city text default null,
  p_state text default null
)
returns void
language plpgsql
set search_path = public, extensions
as $$
begin
  perform assert_valid_coordinates(p_lat, p_lng);
  update providers
     set location = coarse_point(p_lat, p_lng),
         neighborhood = p_neighborhood,
         city = p_city,
         state = p_state
   where id = p_provider_id;
end;
$$;

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
  city text,
  state text,
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
         p.city,
         p.state,
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
                  join categories xc on xc.id = x.category_id and xc.active
                  where x.provider_id = p.id and x.category_id = p_category_id)
   group by p.id, o.point
   order by p.busy asc, distance_km asc, recommendation_count desc;
$$;

-- Default privileges (0001) already keep anon/authenticated out; be explicit for service_role.
revoke execute on function public.create_provider(text, text, double precision, double precision, text, text, int[], text) from public, anon, authenticated;
revoke execute on function public.set_provider_location(uuid, double precision, double precision, text, text, text) from public, anon, authenticated;
revoke execute on function public.search_providers(double precision, double precision, int, int) from public, anon, authenticated;
grant execute on function public.create_provider(text, text, double precision, double precision, text, text, int[], text) to service_role;
grant execute on function public.set_provider_location(uuid, double precision, double precision, text, text, text) to service_role;
grant execute on function public.search_providers(double precision, double precision, int, int) to service_role;

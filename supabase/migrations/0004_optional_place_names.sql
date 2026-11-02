-- 0004 · v0.4.0 · PR #5
-- 1. Neighborhood and city are optional: GPS or CEP lookups do not always return them.
--    Default null lets the server omit them; the signatures stay the same.
-- 2. Provider locations are stored rounded to 2 decimal places (~1.1 km), so distances
--    from different search points cannot triangulate a provider's home (ADR 0034).

create function public.coarse_point(p_lat double precision, p_lng double precision)
returns extensions.geography
language sql
immutable
set search_path = public, extensions
as $$
  select st_makepoint(round(p_lng::numeric, 2)::double precision, round(p_lat::numeric, 2)::double precision)::geography;
$$;
revoke execute on function public.coarse_point(double precision, double precision) from public, anon, authenticated;

create or replace function public.create_provider(
  p_name text,
  p_whatsapp text,
  p_lat double precision,
  p_lng double precision,
  p_neighborhood text default null,
  p_city text default null,
  p_category_ids int[] default null
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

  insert into providers (name, whatsapp, location, neighborhood, city, whatsapp_consent_at)
  values (p_name, p_whatsapp, coarse_point(p_lat, p_lng), p_neighborhood, p_city, now())
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

create or replace function public.set_provider_location(
  p_provider_id uuid,
  p_lat double precision,
  p_lng double precision,
  p_neighborhood text default null,
  p_city text default null
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
         city = p_city
   where id = p_provider_id;
end;
$$;

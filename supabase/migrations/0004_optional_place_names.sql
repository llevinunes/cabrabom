-- 0004 · v0.4.0 · PR #5
-- Neighborhood and city are optional: GPS or CEP lookups do not always return them.
-- Default null lets the server omit them; the signatures stay the same.

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
  values (p_name, p_whatsapp, st_makepoint(p_lng, p_lat)::geography, p_neighborhood, p_city, now())
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
     set location = st_makepoint(p_lng, p_lat)::geography,
         neighborhood = p_neighborhood,
         city = p_city
   where id = p_provider_id;
end;
$$;

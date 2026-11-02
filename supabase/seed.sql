-- Development seed. The sample providers match the reference screens and live in
-- Campina Grande (PB), around the city centre (-7.2307, -35.8811). Locations go through
-- coarse_point like any other provider (~1 km precision, ADR 0034).

insert into public.categories (name, slug) values
  ('Eletricista', 'eletricista'),
  ('Encanador', 'encanador'),
  ('Pedreiro', 'pedreiro'),
  ('Pintor', 'pintor'),
  ('Diarista', 'diarista'),
  ('Jardineiro', 'jardineiro'),
  ('Montador de móveis', 'montador-de-moveis');

insert into public.providers
  (id, name, whatsapp, location, neighborhood, city, busy, years_experience, whatsapp_consent_at)
values
  -- ~1.2 km north of the centre
  ('00000000-0000-4000-8000-000000000001', 'João Silva', '5583900000001',
   public.coarse_point(-7.2199, -35.8811), 'Centro', 'Campina Grande', false, 8, now()),
  -- ~3.4 km east
  ('00000000-0000-4000-8000-000000000002', 'Antônio Ferreira', '5583900000002',
   public.coarse_point(-7.2307, -35.8503), 'Alto da Serra', 'Campina Grande', false, null, now()),
  -- ~6.8 km south, busy
  ('00000000-0000-4000-8000-000000000003', 'Raimundo Costa', '5583900000003',
   public.coarse_point(-7.2922, -35.8811), 'Pedra Branca', 'Campina Grande', true, null, now());

insert into public.provider_categories (provider_id, category_id)
select p.id, c.id
  from (values
    ('00000000-0000-4000-8000-000000000001'::uuid, 'eletricista'),
    ('00000000-0000-4000-8000-000000000001'::uuid, 'encanador'),
    ('00000000-0000-4000-8000-000000000002'::uuid, 'eletricista'),
    ('00000000-0000-4000-8000-000000000003'::uuid, 'eletricista'),
    ('00000000-0000-4000-8000-000000000003'::uuid, 'pedreiro')
  ) as p (id, slug)
  join public.categories c on c.slug = p.slug;

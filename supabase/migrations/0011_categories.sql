-- 0011 · v1.0.0 · PR #21
-- The category list is product data, not test data (ADR 0042): it lives in a migration so
-- production gets it with `supabase db push`. The seed keeps only development providers.

insert into public.categories (name, slug) values
  ('Eletricista', 'eletricista'),
  ('Encanador', 'encanador'),
  ('Pedreiro', 'pedreiro'),
  ('Pintor', 'pintor'),
  ('Diarista', 'diarista'),
  ('Jardineiro', 'jardineiro'),
  ('Montador de móveis', 'montador-de-moveis')
on conflict (slug) do nothing;

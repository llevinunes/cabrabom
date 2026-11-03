-- 0010 · v0.13.0 · PR #20
-- "Relatar problema" (spec 3.5, ADR 0041): private reports, read and handled by the
-- admin straight in the Supabase dashboard. Never shown on any public screen.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.providers (id) on delete cascade,
  service_request_id uuid references public.service_requests (id) on delete set null,
  description text not null check (char_length(description) between 1 and 1000),
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);
create index reports_open_idx on public.reports (created_at) where not resolved;
alter table public.reports enable row level security;

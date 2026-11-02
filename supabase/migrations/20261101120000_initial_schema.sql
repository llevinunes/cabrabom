-- Initial schema (spec section 8, names in English per ADR 0028).
-- Phase 1 tables only: media, push subscriptions and reports come in later phases.

create extension if not exists postgis with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- Categories -------------------------------------------------------------
-- Fixed list maintained by admins; providers only select from it.
create table public.categories (
  id serial primary key,
  name text not null unique,
  slug text not null unique,
  active boolean not null default true          -- deactivate instead of deleting
);

-- Providers --------------------------------------------------------------
create table public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null unique,                 -- 55DDNNNNNNNNN, verified at login
  location extensions.geography(Point, 4326) not null,
  neighborhood text,
  city text,
  busy boolean not null default false,
  busy_updated_at timestamptz not null default now(),
  busy_reminder_sent_at timestamptz,
  years_experience int,
  bio text,
  hidden boolean not null default false,         -- moderation
  whatsapp_consent_at timestamptz not null,      -- LGPD
  created_at timestamptz not null default now()
);
create index providers_location_idx on public.providers using gist (location);

create table public.provider_categories (
  provider_id uuid not null references public.providers (id) on delete cascade,
  category_id int not null references public.categories (id),
  primary key (provider_id, category_id)
);

-- Service requests (service lifecycle) -----------------------------------
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id),
  category_id int not null references public.categories (id),
  client_name text not null,
  details text not null,
  status text not null default 'open' check (status in
    ('open', 'accepted', 'in_progress', 'completed', 'recommended', 'cancelled', 'expired')),
  provider_token text not null unique,
  client_token text unique,                      -- generated on accept
  client_phone text,                             -- comes from the client's session
  distance_km numeric(5, 1),                     -- rounded; the client's location is never stored
  anonymous_client text,                         -- browser cookie, used to avoid duplicate requests
  accepted_at timestamptz,
  client_confirmed_at timestamptz,
  completed_at timestamptz,
  completed_by text check (completed_by in ('provider', 'client')),
  cancelled_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now()
);
create index service_requests_provider_status_idx on public.service_requests (provider_id, status);
create index service_requests_open_by_client_idx on public.service_requests (provider_id, anonymous_client)
  where status = 'open';

-- Recommendations (no ratings) -------------------------------------------
create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  service_request_id uuid not null unique references public.service_requests (id),
  client_name text not null,
  client_phone text not null,                    -- never displayed
  comment text,
  highlights text[] not null default '{}',
  visible boolean not null default true,         -- moderation
  created_at timestamptz not null default now()
);
create unique index recommendations_provider_phone_idx on public.recommendations (provider_id, client_phone);

-- WhatsApp login (reverse OTP) -------------------------------------------
create table public.verifications (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                     -- e.g. K7F2Q
  phone text,                                    -- filled by the webhook
  confirmed_at timestamptz,
  used_at timestamptz,                           -- when a session was created from it
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index sessions_phone_idx on public.sessions (phone);

-- Rate limiting -----------------------------------------------------------
create table public.rate_limit_hits (
  id bigserial primary key,
  key text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_hits_key_idx on public.rate_limit_hits (key, created_at);

-- The browser never talks to the database (ADR 0030).
-- RLS on, no policies: only the service_role key (server side) can read or write.
alter table public.categories enable row level security;
alter table public.providers enable row level security;
alter table public.provider_categories enable row level security;
alter table public.service_requests enable row level security;
alter table public.recommendations enable row level security;
alter table public.verifications enable row level security;
alter table public.sessions enable row level security;
alter table public.rate_limit_hits enable row level security;

-- Expire open requests after 2 days without an answer (spec 3.6).
select cron.schedule('expire-service-requests', '0 * * * *', $$
  update public.service_requests
     set status = 'expired', expired_at = now()
   where status = 'open'
     and created_at < now() - interval '2 days'
$$);

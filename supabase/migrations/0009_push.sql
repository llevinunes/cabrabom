-- 0009 · v0.12.0 · PR #19
-- Web push (spec 5, ADR 0039): subscriptions belong to a session, so signing out removes
-- them. Reminders (ADR 0040) remember when they were sent so each goes out once.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  endpoint text not null unique check (char_length(endpoint) <= 1000),
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_session_idx on public.push_subscriptions (session_id);
alter table public.push_subscriptions enable row level security;

alter table public.service_requests add column finish_reminder_sent_at timestamptz;

-- Reminders (ADR 0040). Each function marks what it returns as sent, in the same
-- statement, so two cron runs never remind twice.

-- 3 days after the client confirmed, once per service.
create function public.claim_finish_reminders()
returns table (provider_whatsapp text, client_name text)
language sql
set search_path = public
as $$
  with due as (
    update service_requests
       set finish_reminder_sent_at = now()
     where status = 'in_progress'
       and client_confirmed_at < now() - interval '3 days'
       and finish_reminder_sent_at is null
    returning provider_id, client_name
  )
  select p.whatsapp, due.client_name from due join providers p on p.id = due.provider_id;
$$;

-- 3 days busy by hand (no service in progress), once per busy period (spec 3.6).
create function public.claim_busy_reminders()
returns table (provider_whatsapp text)
language sql
set search_path = public
as $$
  update providers p
     set busy_reminder_sent_at = now()
   where p.busy
     and p.busy_updated_at < now() - interval '3 days'
     and (p.busy_reminder_sent_at is null or p.busy_reminder_sent_at < p.busy_updated_at)
     and not exists (
       select 1 from service_requests r where r.provider_id = p.id and r.status = 'in_progress'
     )
  returning p.whatsapp;
$$;

revoke execute on function public.claim_finish_reminders() from public, anon, authenticated;
revoke execute on function public.claim_busy_reminders() from public, anon, authenticated;
grant execute on function public.claim_finish_reminders() to service_role;
grant execute on function public.claim_busy_reminders() to service_role;

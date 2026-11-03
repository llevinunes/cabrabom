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

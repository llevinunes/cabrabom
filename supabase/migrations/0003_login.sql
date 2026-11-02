-- 0003 · v0.3.0 · PR #4
-- WhatsApp login: phone format and cleanup of short-lived rows.

-- Phones are always 55 + area code + number, digits only, exactly as lib/phone.ts
-- normalizes them: mobiles with the leading 9, landlines with 8 digits starting 2–5.
-- A mismatch here would make the session phone differ from providers.whatsapp.
create domain public.br_phone as text
  check (value ~ '^55[1-9][1-9](9[0-9]{8}|[2-5][0-9]{7})$');

alter table public.providers alter column whatsapp type public.br_phone;
alter table public.sessions alter column phone type public.br_phone;
alter table public.verifications alter column phone type public.br_phone;
alter table public.service_requests alter column client_phone type public.br_phone;
alter table public.recommendations alter column client_phone type public.br_phone;

-- Daily cleanup: login codes, expired sessions and old rate-limit hits.
select cron.schedule('clean-login-data', '30 3 * * *', $$
  delete from public.verifications where expires_at < now() - interval '1 day';
  delete from public.sessions where expires_at < now();
  delete from public.rate_limit_hits where created_at < now() - interval '1 day';
$$);

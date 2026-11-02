-- 0003 · v0.3.0 · PR #4
-- WhatsApp login: phone format and cleanup of short-lived rows.

-- Phones are always 55 + area code + number, digits only (lib/phone.ts normalizes them).
alter table public.providers add constraint providers_whatsapp_format check (whatsapp ~ '^55\d{10,11}$');
alter table public.sessions add constraint sessions_phone_format check (phone ~ '^55\d{10,11}$');
alter table public.verifications add constraint verifications_phone_format check (phone ~ '^55\d{10,11}$');
alter table public.service_requests add constraint service_requests_client_phone_format
  check (client_phone ~ '^55\d{10,11}$');
alter table public.recommendations add constraint recommendations_client_phone_format
  check (client_phone ~ '^55\d{10,11}$');

-- Daily cleanup: login codes, expired sessions and old rate-limit hits.
select cron.schedule('clean-login-data', '30 3 * * *', $$
  delete from public.verifications where expires_at < now() - interval '1 day';
  delete from public.sessions where expires_at < now();
  delete from public.rate_limit_hits where created_at < now() - interval '1 day';
$$);

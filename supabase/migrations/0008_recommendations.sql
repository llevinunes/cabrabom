-- 0008 · v0.11.0 · PR #18
-- Recommendations (spec 3.4 and 6). Published only by the phone that confirmed a
-- completed service, at least 1 hour after confirming (ADR 0038). Phones that recommend
-- many providers in a short time are flagged for manual review, not blocked.

alter table public.recommendations
  add column flagged boolean not null default false,
  add constraint recommendations_highlights_limit check (cardinality(highlights) <= 6),
  add constraint recommendations_comment_limit check (char_length(comment) <= 500);

create function public.create_recommendation(
  p_client_token text,
  p_phone text,
  p_highlights text[],
  p_comment text default null
)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_request service_requests%rowtype;
  v_provider_phone text;
  v_recent_providers int;
begin
  -- One recommendation decision at a time per phone: two requests of the same client
  -- (or many providers at once, dodging the flag) are decided one after the other.
  perform pg_advisory_xact_lock(hashtext('recommendation:' || p_phone));
  select r.* into v_request from service_requests r where r.client_token = p_client_token for update;
  if not found or v_request.client_phone is distinct from p_phone then
    return 'not_yours';
  end if;
  select whatsapp into v_provider_phone from providers where id = v_request.provider_id;
  if p_phone = v_provider_phone then
    return 'own_provider';
  end if;
  if v_request.status = 'recommended'
     or exists (select 1 from recommendations where provider_id = v_request.provider_id and client_phone = p_phone) then
    return 'already_recommended';
  end if;
  if v_request.status <> 'completed' then
    return 'not_completed';
  end if;
  if v_request.client_confirmed_at > now() - interval '1 hour' then
    return 'too_soon';
  end if;

  select count(distinct provider_id) into v_recent_providers
    from recommendations
   where client_phone = p_phone
     and created_at > now() - interval '7 days';

  insert into recommendations (provider_id, service_request_id, client_name, client_phone, comment, highlights, flagged)
  values (v_request.provider_id, v_request.id, v_request.client_name, p_phone, p_comment,
          coalesce(p_highlights, '{}'), v_recent_providers >= 3);
  update service_requests set status = 'recommended' where id = v_request.id;
  return 'published';
end;
$$;

revoke execute on function public.create_recommendation(text, text, text[], text) from public, anon, authenticated;
grant execute on function public.create_recommendation(text, text, text[], text) to service_role;

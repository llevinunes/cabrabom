-- 0007 · v0.10.0 · PR #17
-- Service lifecycle after the accept (spec 3.3 and 3.6): the client confirms, either side
-- completes, and the request can be cancelled. Each function checks who is calling (the
-- session phone) and changes the request and the provider's busy flag in one transaction.

-- Free again after a service ends, unless another one is still in progress (spec 3.6).
create function public.release_provider_if_idle(p_provider_id uuid, p_request_id uuid)
returns void
language sql
set search_path = public
as $$
  update providers
     set busy = false, busy_updated_at = now()
   where id = p_provider_id
     and not exists (
       select 1 from service_requests
        where provider_id = p_provider_id
          and status = 'in_progress'
          and id <> p_request_id
     );
$$;

-- The request behind a token, locked, if the phone is the right party:
-- 'provider' → provider_token and the provider's WhatsApp; 'client' → client_token and client_phone.
create function public.lock_request_for_party(p_token text, p_phone text, p_by text)
returns service_requests
language plpgsql
set search_path = public
as $$
declare
  v_request service_requests%rowtype;
begin
  if p_by = 'provider' then
    select r.* into v_request
      from service_requests r
      join providers p on p.id = r.provider_id
     where r.provider_token = p_token and p.whatsapp = p_phone
       for update of r;
  elsif p_by = 'client' then
    select r.* into v_request
      from service_requests r
     where r.client_token = p_token and r.client_phone = p_phone
       for update;
  else
    raise exception 'unknown party %', p_by using errcode = '22023';
  end if;
  return v_request;
end;
$$;

create function public.confirm_service_request(p_client_token text, p_phone text)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_request service_requests%rowtype;
  v_provider_phone text;
begin
  select r.* into v_request from service_requests r where r.client_token = p_client_token for update;
  if not found then
    return 'unavailable';
  end if;
  select whatsapp into v_provider_phone from providers where id = v_request.provider_id;

  if v_request.status in ('in_progress', 'completed', 'recommended') then
    return case when v_request.client_phone = p_phone then 'already_confirmed' else 'other_phone' end;
  end if;
  if v_request.status <> 'accepted' then
    return 'unavailable';
  end if;
  -- Anti-fraud (spec 6): the provider never confirms (and later recommends) their own service.
  if p_phone = v_provider_phone then
    return 'provider_phone';
  end if;

  update service_requests
     set status = 'in_progress', client_confirmed_at = now(), client_phone = p_phone
   where id = v_request.id;
  update providers
     set busy = true, busy_updated_at = now()
   where id = v_request.provider_id;
  return 'confirmed';
end;
$$;

create function public.complete_service_request(p_token text, p_phone text, p_by text)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_request service_requests%rowtype;
begin
  v_request := lock_request_for_party(p_token, p_phone, p_by);
  if v_request.id is null then
    return 'unavailable';
  end if;
  if v_request.status in ('completed', 'recommended') then
    return 'already_completed';
  end if;
  if v_request.status <> 'in_progress' then
    return 'unavailable';
  end if;

  update service_requests
     set status = 'completed', completed_at = now(), completed_by = p_by
   where id = v_request.id;
  perform release_provider_if_idle(v_request.provider_id, v_request.id);
  return 'completed';
end;
$$;

create function public.cancel_service_request(p_token text, p_phone text, p_by text)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_request service_requests%rowtype;
begin
  v_request := lock_request_for_party(p_token, p_phone, p_by);
  if v_request.id is null then
    return 'unavailable';
  end if;
  if v_request.status = 'cancelled' then
    return 'already_cancelled';
  end if;
  -- The provider cancels before or during the service; the client only after confirming
  -- (before that, the /c link travels without login).
  if not (
    (p_by = 'provider' and v_request.status in ('open', 'accepted', 'in_progress'))
    or (p_by = 'client' and v_request.status = 'in_progress')
  ) then
    return 'unavailable';
  end if;

  update service_requests
     set status = 'cancelled', cancelled_at = now()
   where id = v_request.id;
  if v_request.status = 'in_progress' then
    perform release_provider_if_idle(v_request.provider_id, v_request.id);
  end if;
  return 'cancelled';
end;
$$;

revoke execute on function public.release_provider_if_idle(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.lock_request_for_party(text, text, text) from public, anon, authenticated;
revoke execute on function public.confirm_service_request(text, text) from public, anon, authenticated;
revoke execute on function public.complete_service_request(text, text, text) from public, anon, authenticated;
revoke execute on function public.cancel_service_request(text, text, text) from public, anon, authenticated;
grant execute on function public.confirm_service_request(text, text) to service_role;
grant execute on function public.complete_service_request(text, text, text) to service_role;
grant execute on function public.cancel_service_request(text, text, text) to service_role;

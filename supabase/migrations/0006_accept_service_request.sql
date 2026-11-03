-- 0006 · v0.9.0 · PR #16
-- Accepting a request (spec 3.3, step 1): only the provider of the request, only while
-- it is open and not expired. Accepting again returns the client token it already has.

create function public.accept_service_request(
  p_provider_token text,
  p_phone text,
  p_client_token text
)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_request service_requests%rowtype;
begin
  select r.* into v_request
    from service_requests r
    join providers p on p.id = r.provider_id
   where r.provider_token = p_provider_token
     and p.whatsapp = p_phone
     for update of r;

  if not found then
    return null;
  end if;

  if v_request.status = 'accepted' then
    return v_request.client_token;
  end if;

  if v_request.status <> 'open' or v_request.created_at <= now() - interval '2 days' then
    return null;
  end if;

  update service_requests
     set status = 'accepted', accepted_at = now(), client_token = p_client_token
   where id = v_request.id;
  return p_client_token;
end;
$$;

revoke execute on function public.accept_service_request(text, text, text) from public, anon, authenticated;
grant execute on function public.accept_service_request(text, text, text) to service_role;

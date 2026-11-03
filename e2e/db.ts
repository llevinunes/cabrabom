import { createClient } from "@supabase/supabase-js";

export function testDb() {
  process.loadEnvFile(".env.local");
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export const JOAO = { id: "00000000-0000-4000-8000-000000000001", phone: "83 90000-0001" };

/** An open request for João, as if a client had tapped "Conversar". */
export async function createRequestForJoao(clientName: string, token: string, details = "Trocar a fiação da cozinha") {
  const db = testDb();
  const { data: category } = await db.from("categories").select("id").eq("slug", "eletricista").single();
  const { error } = await db.from("service_requests").insert({
    provider_id: JOAO.id,
    category_id: category!.id,
    client_name: clientName,
    details,
    distance_km: 1.2,
    provider_token: token,
  });
  if (error) throw error;
}

/** A provider whose location only resolved to a city (no neighborhood). */
export async function createCityOnlyProvider(name: string, whatsapp: string) {
  const db = testDb();
  const { data: category } = await db.from("categories").select("id").eq("slug", "pedreiro").single();
  const { error } = await db.rpc("create_provider", {
    p_name: name,
    p_whatsapp: whatsapp,
    p_lat: -4.3047,
    p_lng: -38.9958,
    p_city: "Mulungu",
    p_state: "CE",
    p_category_ids: [category!.id],
  });
  if (error) throw error;
}

/** A request João already accepted: the client can open /c/{clientToken}. */
export async function createAcceptedRequestForJoao(clientName: string, providerToken: string, clientToken: string) {
  await createRequestForJoao(clientName, providerToken);
  const { error } = await testDb()
    .from("service_requests")
    .update({ status: "accepted", accepted_at: new Date().toISOString(), client_token: clientToken })
    .eq("provider_token", providerToken);
  if (error) throw error;
}

export async function requestStatus(providerToken: string) {
  const { data } = await testDb()
    .from("service_requests")
    .select("status, client_phone")
    .eq("provider_token", providerToken)
    .single();
  return data;
}

export async function joaoIsBusy() {
  const { data } = await testDb().from("providers").select("busy").eq("id", JOAO.id).single();
  return data!.busy as boolean;
}

/** Confirming a service makes João busy; later specs expect the seed state (free). */
export async function setJoaoFree() {
  const { error } = await testDb().from("providers").update({ busy: false }).eq("id", JOAO.id);
  if (error) throw error;
}

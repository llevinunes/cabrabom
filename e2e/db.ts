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

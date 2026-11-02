import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Seeded data (supabase/seed.sql). Run `npm run db:reset` before `npm run test:db`.
export const CITY_CENTRE = { lat: -7.2307, lng: -35.8811 };
export const JOAO_ID = "00000000-0000-4000-8000-000000000001";
export const JOAO_WHATSAPP = "5583900000001";
const SEED_PROVIDER_IDS = [1, 2, 3].map((n) => `00000000-0000-4000-8000-00000000000${n}`);

export function testClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

export type TestDb = ReturnType<typeof testClient>;

export async function categoryId(db: TestDb, slug: string): Promise<number> {
  const { data, error } = await db.from("categories").select("id").eq("slug", slug).single();
  if (error) throw error;
  return data.id;
}

/** Creates a provider `km` kilometres north of the city centre. */
export async function createProviderNorth(
  db: TestDb,
  input: { name: string; whatsapp: string; km: number; categoryIds: number[]; busy?: boolean },
): Promise<string> {
  const { data: id, error } = await db.rpc("create_provider", {
    p_name: input.name,
    p_whatsapp: input.whatsapp,
    p_lat: CITY_CENTRE.lat + input.km / 110.6,
    p_lng: CITY_CENTRE.lng,
    p_neighborhood: "Teste",
    p_city: "Campina Grande",
    p_category_ids: input.categoryIds,
  });
  if (error) throw error;
  if (input.busy) await must(db.from("providers").update({ busy: true }).eq("id", id));
  return id;
}

async function must(query: PromiseLike<{ error: unknown }>) {
  const { error } = await query;
  if (error) throw error;
}

/** Removes everything the tests create and puts the seed back as it was. */
export async function cleanTestData(db: TestDb) {
  await must(db.from("recommendations").delete().not("id", "is", null));
  await must(db.from("service_requests").delete().not("id", "is", null));
  await must(db.from("verifications").delete().not("id", "is", null));
  await must(db.from("sessions").delete().not("id", "is", null));
  await must(db.from("rate_limit_hits").delete().not("id", "is", null));
  await must(db.from("providers").delete().not("id", "in", `(${SEED_PROVIDER_IDS.join(",")})`));
  await must(db.from("categories").update({ active: true }).eq("active", false));
  await must(db.from("providers").update({ hidden: false, busy: false }).eq("id", JOAO_ID));
  const { error } = await db.rpc("set_provider_location", {
    p_provider_id: JOAO_ID,
    p_lat: -7.2199,
    p_lng: -35.8811,
    p_neighborhood: "Centro",
    p_city: "Campina Grande",
  });
  if (error) throw error;
}

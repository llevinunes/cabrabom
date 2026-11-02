import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// Seeded data (supabase/seed.sql). Run `npm run db:reset` before `npm run test:db`.
export const CITY_CENTRE = { lat: -7.2307, lng: -35.8811 };
export const JOAO_ID = "00000000-0000-4000-8000-000000000001";
export const JOAO_WHATSAPP = "5583900000001";

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

/** Removes everything the tests create, keeping the seed (ids/phones outside the seed range). */
export async function cleanTestData(db: TestDb) {
  const seedProviders = [1, 2, 3].map((n) => `00000000-0000-4000-8000-00000000000${n}`);
  const steps = [
    db.from("service_requests").delete().not("id", "is", null),
    db.from("verifications").delete().not("id", "is", null),
    db.from("sessions").delete().not("id", "is", null),
    db.from("rate_limit_hits").delete().not("id", "is", null),
  ];
  for (const step of steps) {
    const { error } = await step;
    if (error) throw error;
  }
  const { error } = await db.from("providers").delete().not("id", "in", `(${seedProviders.join(",")})`);
  if (error) throw error;
  await db.from("providers").update({ hidden: false, busy: false }).eq("id", JOAO_ID);
}

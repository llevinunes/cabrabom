import { createClient } from "@supabase/supabase-js";

// Every e2e run comes from the same IP: clear login leftovers so the
// rate limit and old codes from previous runs do not leak into this one.
export default async function globalSetup() {
  process.loadEnvFile(".env.local");
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  for (const table of ["rate_limit_hits", "verifications", "sessions"] as const) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw error;
  }
}

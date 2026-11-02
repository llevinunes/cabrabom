import { createClient } from "@supabase/supabase-js";

// Every e2e run comes from the same IP and reuses the same phones: clear what
// previous runs left (rate limit, codes, sessions, requests, providers).
export default async function globalSetup() {
  process.loadEnvFile(".env.local");
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  for (const table of ["rate_limit_hits", "verifications", "sessions", "service_requests"] as const) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw error;
  }
  // Providers created by previous runs (the seed uses 55839000000xx).
  const { error } = await db.from("providers").delete().not("whatsapp", "like", "55839000000%");
  if (error) throw error;
}

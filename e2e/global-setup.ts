import { createClient } from "@supabase/supabase-js";

// Every e2e run comes from the same IP and reuses the same phones: clear what
// previous runs left (rate limit, codes, sessions, requests, providers).
export default async function globalSetup() {
  process.loadEnvFile(".env.local");
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  for (const table of ["rate_limit_hits", "verifications", "sessions", "recommendations", "service_requests"] as const) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error) throw error;
  }
  // Providers created by previous runs (the seed uses 55839000000xx).
  const { error } = await db.from("providers").delete().not("whatsapp", "like", "55839000000%");
  if (error) throw error;
  // Panel tests flip João's status and move him; start every run from the seed state.
  const joao = "00000000-0000-4000-8000-000000000001";
  const reset = await db.from("providers").update({ busy: false }).eq("id", joao);
  if (reset.error) throw reset.error;
  const place = await db.rpc("set_provider_location", {
    p_provider_id: joao,
    p_lat: -7.2199,
    p_lng: -35.8811,
    p_neighborhood: "Centro",
    p_city: "Campina Grande",
  });
  if (place.error) throw place.error;
}

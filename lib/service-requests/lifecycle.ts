import type { Db } from "@/lib/supabase/server";
import { generateToken } from "@/lib/tokens";

/**
 * "Aceitar serviço" (spec 3.3): returns the client token for /c/, or null when this
 * phone is not the request's provider or the request can no longer be accepted.
 */
export async function acceptServiceRequest(db: Db, providerToken: string, phone: string): Promise<string | null> {
  const { data, error } = await db.rpc("accept_service_request", {
    p_provider_token: providerToken,
    p_phone: phone,
    p_client_token: generateToken(),
  });
  if (error) throw error;
  return data;
}

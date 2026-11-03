import "server-only";
import { confirmServiceRequest } from "@/lib/service-requests/lifecycle";
import { createServerClient } from "@/lib/supabase/server";

/**
 * Confirms with the session phone and returns where to go next. Kept out of the
 * "use server" files: an exported action would let anyone pass any phone.
 */
export async function confirmAndGo(token: string, phone: string): Promise<string> {
  const path = `/c/${encodeURIComponent(token)}`;
  const result = await confirmServiceRequest(createServerClient(), token, phone);
  return result === "provider_phone" ? `${path}?erro=proprio` : path;
}

import "server-only";
import { confirmedMessage } from "@/lib/push/messages";
import { confirmServiceRequest } from "@/lib/service-requests/lifecycle";
import { requestByClientToken } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { notifyLater } from "./notify";

/**
 * Confirms with the session phone and returns where to go next. Kept out of the
 * "use server" files: an exported action would let anyone pass any phone.
 */
export async function confirmAndGo(token: string, phone: string): Promise<string> {
  const path = `/c/${encodeURIComponent(token)}`;
  const db = createServerClient();
  const result = await confirmServiceRequest(db, token, phone);
  if (result === "confirmed") {
    const request = await requestByClientToken(db, token);
    if (request) notifyLater(request.providerWhatsapp, confirmedMessage(request.clientName));
  }
  return result === "provider_phone" ? `${path}?erro=proprio` : path;
}

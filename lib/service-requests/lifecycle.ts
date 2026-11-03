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

export type ConfirmResult = "confirmed" | "already_confirmed" | "other_phone" | "provider_phone" | "unavailable";

/** The client confirms on /c/ with the phone of their WhatsApp login; the provider becomes busy. */
export async function confirmServiceRequest(db: Db, clientToken: string, phone: string): Promise<ConfirmResult> {
  const { data, error } = await db.rpc("confirm_service_request", { p_client_token: clientToken, p_phone: phone });
  if (error) throw error;
  return data as ConfirmResult;
}

/** Who acts: the provider uses the provider token, the client the client token. */
export type Party = "provider" | "client";

export type CompleteResult = "completed" | "already_completed" | "unavailable";

/** "Finalizar serviço" / "Marcar como finalizado": frees the provider unless another service is in progress. */
export async function completeServiceRequest(db: Db, token: string, phone: string, by: Party): Promise<CompleteResult> {
  const { data, error } = await db.rpc("complete_service_request", { p_token: token, p_phone: phone, p_by: by });
  if (error) throw error;
  return data as CompleteResult;
}

export type CancelResult = "cancelled" | "already_cancelled" | "unavailable";

export async function cancelServiceRequest(db: Db, token: string, phone: string, by: Party): Promise<CancelResult> {
  const { data, error } = await db.rpc("cancel_service_request", { p_token: token, p_phone: phone, p_by: by });
  if (error) throw error;
  return data as CancelResult;
}

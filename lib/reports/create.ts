import type { Db } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

const TOKEN = /^[A-Za-z0-9_-]{24}$/;
export const REPORT_MAX_LENGTH = 1000;

export type ReportInput = {
  providerId?: string;
  /** The provider token (/s/) or the client token (/c/, /r/) of the service. */
  requestToken?: string;
  description: string;
};

/** Saves a private report (spec 3.5). False when it points at no provider or service. */
export async function createReport(db: Db, input: ReportInput): Promise<boolean> {
  let providerId = input.providerId && isUuid(input.providerId) ? input.providerId : null;
  let requestId: string | null = null;

  if (input.requestToken && TOKEN.test(input.requestToken)) {
    const { data, error } = await db
      .from("service_requests")
      .select("id, provider_id")
      .or(`provider_token.eq.${input.requestToken},client_token.eq.${input.requestToken}`)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      requestId = data.id;
      providerId = data.provider_id;
    }
  }
  if (providerId && !requestId) {
    const { data, error } = await db.from("providers").select("id").eq("id", providerId).maybeSingle();
    if (error) throw error;
    if (!data) providerId = null;
  }
  if (!providerId) return false;

  const { error } = await db
    .from("reports")
    .insert({ provider_id: providerId, service_request_id: requestId, description: input.description });
  if (error) throw error;
  return true;
}

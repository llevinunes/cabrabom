import type { Db } from "@/lib/supabase/server";
import type { RecommendationInput } from "./highlights";

/** Minimum time between the client confirming and recommending (ADR 0039). */
export const RECOMMEND_AFTER_MINUTES = 60;

export type RecommendResult =
  | "published"
  | "too_soon"
  | "not_completed"
  | "not_yours"
  | "own_provider"
  | "already_recommended";

/** The anti-fraud rules (spec 6) run in the database, in the same transaction as the insert. */
export async function createRecommendation(
  db: Db,
  clientToken: string,
  phone: string,
  input: RecommendationInput,
): Promise<RecommendResult> {
  const { data, error } = await db.rpc("create_recommendation", {
    p_client_token: clientToken,
    p_phone: phone,
    p_highlights: input.highlights,
    p_comment: input.comment ?? undefined,
  });
  if (error) throw error;
  return data as RecommendResult;
}

/** When a client who confirmed at `confirmedAt` may recommend. */
export function recommendAvailableAt(confirmedAt: Date): Date {
  return new Date(confirmedAt.getTime() + RECOMMEND_AFTER_MINUTES * 60_000);
}

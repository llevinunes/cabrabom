"use server";

import { redirect } from "next/navigation";
import { createRecommendation, type RecommendResult } from "@/lib/recommendations/create";
import { parseRecommendationForm } from "@/lib/recommendations/highlights";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/server/session";

export type RecommendState = { error: string } | null;

const REFUSED: Partial<Record<RecommendResult, string>> = {
  too_soon: "Ainda não dá para recomendar. Tente de novo mais tarde.",
  not_completed: "O serviço ainda não foi finalizado.",
  not_yours: "Esta recomendação é de outro número.",
  own_provider: "Você não pode recomendar o próprio serviço.",
};

/** "Enviar recomendação" (screen 06). The phone comes from the session; the rules run in the database. */
export async function recommend(_previous: RecommendState, form: FormData): Promise<RecommendState> {
  const token = String(form.get("token") ?? "");
  const session = await getCurrentSession();
  if (!session) redirect(`/entrar?voltar=${encodeURIComponent(`/r/${token}`)}`);

  const input = parseRecommendationForm(form);
  if (!input.ok) return { error: input.error };
  const result = await createRecommendation(createServerClient(), token, session.phone, input);
  const refused = REFUSED[result];
  if (refused) return { error: refused };
  redirect(`/r/${encodeURIComponent(token)}`);
}

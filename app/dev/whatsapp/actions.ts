"use server";

import { createServerClient } from "@/lib/supabase/server";
import { handleIncomingMessages } from "@/lib/whatsapp/webhook";

export type SimulationResult = { message: string } | null;

/** Development stand-in for the Meta webhook (ADR 0032): same logic, no signature. */
export async function simulateMessage(_previous: SimulationResult, form: FormData): Promise<SimulationResult> {
  if (process.env.NODE_ENV === "production") return { message: "Indisponível em produção." };
  const from = String(form.get("from") ?? "");
  const text = String(form.get("text") ?? "");
  const confirmed = await handleIncomingMessages(createServerClient(), [{ from, text }]);
  return { message: confirmed > 0 ? "Código confirmado." : "Nenhum código válido nessa mensagem." };
}

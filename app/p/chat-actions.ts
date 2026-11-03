"use server";

import { redirect } from "next/navigation";
import { categoryBySlug } from "@/lib/categories";
import { env } from "@/lib/env";
import { newRequestMessage } from "@/lib/push/messages";
import { isInBrazil } from "@/lib/location/resolve";
import { publicProfile, type PublicProfile } from "@/lib/providers/profile";
import { withinLimit } from "@/lib/rate-limit";
import { searchTextSchema, type SearchFormErrors } from "@/lib/search/form";
import { findOpenRequest, openServiceRequest, recentRequestCount } from "@/lib/service-requests/open";
import { whatsappLink } from "@/lib/service-requests/whatsapp";
import { createServerClient } from "@/lib/supabase/server";
import { getAnonymousClient } from "@/server/anonymous-client";
import { notifyLater } from "@/server/notify";
import { getClientIp } from "@/server/request-ip";

export type ChatState = {
  errors: SearchFormErrors & { form?: string };
  values: { name: string; category: string; details: string };
} | null;

/** Per IP and hour, across providers. Generous: mobile carriers share IPs (CGNAT). */
const CHATS_PER_IP = 30;
/** Per IP and hour, for one provider. */
const CHATS_PER_IP_AND_PROVIDER = 3;
/** New requests one provider can receive per hour, from everyone. */
const REQUESTS_PER_PROVIDER = 20;

/**
 * "Conversar no WhatsApp" (spec 3.2): opens the service request, then sends the client
 * to the provider's WhatsApp with the ready-made message. Used by the intermediate page
 * (with useActionState) and by the hidden-field forms on results and profile.
 */
export async function startChat(_previous: ChatState, form: FormData): Promise<ChatState> {
  const providerId = String(form.get("provider_id") ?? "");
  const values = {
    name: String(form.get("name") ?? ""),
    category: String(form.get("category") ?? ""),
    details: String(form.get("details") ?? ""),
  };
  const texts = searchTextSchema.safeParse(values);
  if (!texts.success) {
    const errors: SearchFormErrors = {};
    for (const issue of texts.error.issues) errors[issue.path[0] as keyof SearchFormErrors] ??= issue.message;
    return { errors, values };
  }

  const db = createServerClient();
  const [provider, category] = await Promise.all([
    publicProfile(db, providerId),
    categoryBySlug(db, texts.data.category),
  ]);
  if (!provider) return { errors: { form: "Este prestador não está mais disponível." }, values };
  if (!category || !provider.categories.some((c) => c.id === category.id)) {
    return { errors: { category: "Escolha uma das categorias deste prestador" }, values };
  }
  const message = { name: texts.data.name, category: category.name, details: texts.data.details };

  // Coming back to WhatsApp for a request this browser already opened costs nothing.
  const anonymousClient = await getAnonymousClient();
  const existing = await findOpenRequest(db, provider.id, anonymousClient);
  if (existing) redirect(chatUrl(provider, message, existing));

  const ip = await getClientIp();
  const allowed =
    (await withinLimit(db, `chat:${ip}`, CHATS_PER_IP, 60)) &&
    (await withinLimit(db, `chat:${provider.id}:${ip}`, CHATS_PER_IP_AND_PROVIDER, 60)) &&
    (await recentRequestCount(db, provider.id, 60)) < REQUESTS_PER_PROVIDER;
  if (!allowed) return { errors: { form: "Muitos pedidos agora. Tente de novo mais tarde." }, values };

  const { token } = await openServiceRequest(db, {
    providerId: provider.id,
    categoryId: category.id,
    clientName: texts.data.name,
    details: texts.data.details,
    anonymousClient,
    ...readPosition(form),
  });
  notifyLater(provider.whatsapp, newRequestMessage(texts.data.name, category.name, token));
  redirect(chatUrl(provider, message, token));
}

function chatUrl(provider: PublicProfile, message: { name: string; category: string; details: string }, token: string) {
  return whatsappLink(provider, message, `${env().APP_URL}/s/${token}`);
}

/** The client's position from the hidden fields, only when it is a real point in Brazil. */
function readPosition(form: FormData): { lat?: number; lng?: number } {
  const lat = Number(form.get("lat") || NaN);
  const lng = Number(form.get("lng") || NaN);
  return Number.isFinite(lat) && Number.isFinite(lng) && isInBrazil(lat, lng) ? { lat, lng } : {};
}

/** For the hidden-field forms: on any problem, continue on the intermediate page. */
export async function startChatFromSearch(form: FormData): Promise<void> {
  const state = await startChat(null, form);
  if (state) {
    const query = new URLSearchParams({
      nome: state.values.name,
      categoria: state.values.category,
      detalhes: state.values.details,
    });
    redirect(`/p/${encodeURIComponent(String(form.get("provider_id") ?? ""))}/conversar?${query}`);
  }
}

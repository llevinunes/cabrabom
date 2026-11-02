"use server";

import { redirect } from "next/navigation";
import { categoryBySlug } from "@/lib/categories";
import { env } from "@/lib/env";
import { publicProfile } from "@/lib/providers/profile";
import { withinLimit } from "@/lib/rate-limit";
import { searchTextSchema, type SearchFormErrors } from "@/lib/search/form";
import { openServiceRequest } from "@/lib/service-requests/open";
import { whatsappLink } from "@/lib/service-requests/whatsapp";
import { createServerClient } from "@/lib/supabase/server";
import { getAnonymousClient } from "@/server/anonymous-client";
import { getClientIp } from "@/server/request-ip";

export type ChatState = { errors: SearchFormErrors & { form?: string } } | null;

/**
 * "Conversar no WhatsApp" (spec 3.2): opens the service request, then sends the client
 * to the provider's WhatsApp with the ready-made message. Used by the intermediate page
 * (with useActionState) and by the hidden-field forms on results and profile.
 */
export async function startChat(_previous: ChatState, form: FormData): Promise<ChatState> {
  const providerId = String(form.get("provider_id") ?? "");
  const texts = searchTextSchema.safeParse({
    name: form.get("name") ?? "",
    category: form.get("category") ?? "",
    details: form.get("details") ?? "",
  });
  if (!texts.success) {
    const errors: SearchFormErrors = {};
    for (const issue of texts.error.issues) errors[issue.path[0] as keyof SearchFormErrors] ??= issue.message;
    return { errors };
  }

  const db = createServerClient();
  const [provider, category] = await Promise.all([
    publicProfile(db, providerId),
    categoryBySlug(db, texts.data.category),
  ]);
  if (!provider) return { errors: { form: "Este prestador não está mais disponível." } };
  if (!category || !provider.categories.some((c) => c.id === category.id)) {
    return { errors: { category: "Escolha uma das categorias deste prestador" } };
  }
  if (!(await withinLimit(db, `chat:${await getClientIp()}`, 10, 60))) {
    return { errors: { form: "Muitas tentativas. Tente de novo mais tarde." } };
  }

  const lat = Number(form.get("lat"));
  const lng = Number(form.get("lng"));
  const hasPosition = form.get("lat") !== null && Number.isFinite(lat) && Number.isFinite(lng);
  const { token } = await openServiceRequest(db, {
    providerId: provider.id,
    categoryId: category.id,
    clientName: texts.data.name,
    details: texts.data.details,
    anonymousClient: await getAnonymousClient(),
    ...(hasPosition ? { lat, lng } : {}),
  });

  redirect(
    whatsappLink(
      provider,
      { name: texts.data.name, category: category.name, details: texts.data.details },
      `${env().APP_URL}/s/${token}`,
    ),
  );
}

/** For the hidden-field forms: on any problem, continue on the intermediate page. */
export async function startChatFromSearch(form: FormData): Promise<void> {
  const state = await startChat(null, form);
  if (state) {
    const query = new URLSearchParams({
      nome: String(form.get("name") ?? ""),
      categoria: String(form.get("category") ?? ""),
      detalhes: String(form.get("details") ?? ""),
    });
    redirect(`/p/${encodeURIComponent(String(form.get("provider_id") ?? ""))}/conversar?${query}`);
  }
}

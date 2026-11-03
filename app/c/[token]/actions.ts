"use server";

import { redirect } from "next/navigation";
import { finishedByClientMessage } from "@/lib/push/messages";
import { cancelServiceRequest, completeServiceRequest } from "@/lib/service-requests/lifecycle";
import { requestByClientToken } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { PENDING_CONFIRMATION_COOKIE } from "@/server/cookie-names";
import { confirmAndGo } from "@/server/confirm-service";
import { setSignedCookie } from "@/server/cookies";
import { notifyLater } from "@/server/notify";
import { getCurrentSession } from "@/server/session";

/** How long the confirmation waits for the WhatsApp login. */
const PENDING_MINUTES = 15;

function servicePath(token: string) {
  return `/c/${encodeURIComponent(token)}`;
}

/**
 * "Confirmar com WhatsApp" (screen 04). Without a session, the intention is kept in a
 * signed cookie and the login comes back to /concluir, so the client taps only once.
 */
export async function confirmRequest(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const session = await getCurrentSession();
  if (session) redirect(await confirmAndGo(token, session.phone));

  await setSignedCookie(PENDING_CONFIRMATION_COOKIE, token, new Date(Date.now() + PENDING_MINUTES * 60_000));
  redirect(`/entrar?voltar=${encodeURIComponent(`${servicePath(token)}/concluir`)}`);
}

/** "Marcar como finalizado": only the phone that confirmed the service. */
export async function completeAsClient(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const session = await getCurrentSession();
  if (!session) redirect(`/entrar?voltar=${encodeURIComponent(servicePath(token))}`);
  const db = createServerClient();
  if ((await completeServiceRequest(db, token, session.phone, "client")) === "completed") {
    const request = await requestByClientToken(db, token);
    if (request) notifyLater(request.providerWhatsapp, finishedByClientMessage(request.clientName));
  }
  redirect(servicePath(token));
}

/** The client cancels a service in progress (before confirming, the link has no owner). */
export async function cancelAsClient(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const session = await getCurrentSession();
  if (!session) redirect(`/entrar?voltar=${encodeURIComponent(servicePath(token))}`);
  await cancelServiceRequest(createServerClient(), token, session.phone, "client");
  redirect(servicePath(token));
}

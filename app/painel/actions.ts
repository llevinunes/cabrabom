"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readLocationInput } from "@/lib/location/form";
import { resolveLocation } from "@/lib/location/resolve";
import { setBusy, updateProviderLocation } from "@/lib/providers/panel";
import { withinLimit } from "@/lib/rate-limit";
import { finishedByProviderMessage } from "@/lib/push/messages";
import { cancelServiceRequest, completeServiceRequest } from "@/lib/service-requests/lifecycle";
import { requestByClientToken, requestByToken } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProvider } from "@/server/current-provider";
import { notifyLater } from "@/server/notify";
import { getCurrentSession } from "@/server/session";

/** Free/busy switch on the panel. The provider comes from the session, never from the form. */
export async function toggleBusy(form: FormData): Promise<void> {
  const provider = await getCurrentProvider();
  if (!provider) redirect("/prestador");
  await setBusy(createServerClient(), provider.id, form.get("busy") === "true");
  revalidatePath("/painel");
}

/** "Continuo ocupado" after the busy reminder: renews busy_updated_at, so the count restarts (spec 3.6). */
export async function stillBusy(): Promise<void> {
  const provider = await getCurrentProvider();
  if (!provider) redirect("/prestador");
  await setBusy(createServerClient(), provider.id, true);
  revalidatePath("/painel");
}

export type LocationState = { error: string } | null;

export async function saveLocation(_previous: LocationState, form: FormData): Promise<LocationState> {
  const provider = await getCurrentProvider();
  if (!provider) redirect("/prestador");
  const input = readLocationInput(form);
  if (!input) return { error: "Informe onde você atende" };

  const db = createServerClient();
  if (!(await withinLimit(db, `location:${provider.id}`, 10, 60))) {
    return { error: "Muitas alterações seguidas. Tente de novo mais tarde." };
  }
  const place = await resolveLocation(input);
  if (!place) {
    return {
      error:
        input.kind === "cep"
          ? "Não encontramos esse CEP. Tente usar sua localização."
          : "Não conseguimos usar essa localização. Informe o CEP.",
    };
  }
  await updateProviderLocation(db, provider.id, place);
  redirect("/painel");
}

/** "Finalizar serviço" on the panel. The database checks the session phone is the provider's. */
export async function finishService(form: FormData): Promise<void> {
  const session = await getCurrentSession();
  if (!session) redirect("/entrar?voltar=/painel");
  const db = createServerClient();
  const token = String(form.get("token") ?? "");
  if ((await completeServiceRequest(db, token, session.phone, "provider")) === "completed") await askForRecommendation(db, token);
  revalidatePath("/painel");
}

/** Spec 3.3, step 4: when the provider finishes, the client gets the recommendation link. */
async function askForRecommendation(db: ReturnType<typeof createServerClient>, providerToken: string) {
  const clientToken = (await requestByToken(db, providerToken))?.clientToken;
  const request = clientToken ? await requestByClientToken(db, clientToken) : null;
  if (request?.clientPhone) notifyLater(request.clientPhone, finishedByProviderMessage(request.providerName, clientToken!));
}

export async function cancelService(form: FormData): Promise<void> {
  const session = await getCurrentSession();
  if (!session) redirect("/entrar?voltar=/painel");
  await cancelServiceRequest(createServerClient(), String(form.get("token") ?? ""), session.phone, "provider");
  revalidatePath("/painel");
}

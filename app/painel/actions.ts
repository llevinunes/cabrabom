"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readLocationInput } from "@/lib/location/form";
import { resolveLocation } from "@/lib/location/resolve";
import { setBusy, updateProviderLocation } from "@/lib/providers/panel";
import { withinLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProvider } from "@/server/current-provider";

/** Free/busy switch on the panel. The provider comes from the session, never from the form. */
export async function toggleBusy(form: FormData): Promise<void> {
  const provider = await getCurrentProvider();
  if (!provider) redirect("/prestador");
  await setBusy(createServerClient(), provider.id, form.get("busy") === "true");
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

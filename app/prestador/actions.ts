"use server";

import { redirect } from "next/navigation";
import { activeCategoryIds } from "@/lib/categories";
import { readLocationInput } from "@/lib/location/form";
import { resolveLocation } from "@/lib/location/resolve";
import { parseSignupForm, pendingSignupSchema, type SignupErrors } from "@/lib/providers/signup";
import { withinLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";
import { PENDING_SIGNUP_COOKIE } from "@/server/cookie-names";
import { setSignedCookie } from "@/server/cookies";
import { getClientIp } from "@/server/request-ip";
import { getCurrentSession } from "@/server/session";

export type SignupState = {
  errors: SignupErrors;
  values: { name: string; categoryIds: number[]; consent: boolean; cep: string };
} | null;

const PENDING_MINUTES = 30;

/**
 * Validates screen 07, then keeps the data in a signed cookie while the person logs in
 * with WhatsApp. The provider is only created afterwards, with the session phone.
 */
export async function submitSignup(_previous: SignupState, form: FormData): Promise<SignupState> {
  const values = {
    name: String(form.get("name") ?? ""),
    categoryIds: form.getAll("category").map(Number).filter(Number.isInteger),
    consent: form.get("consent") === "on",
    cep: String(form.get("location_cep") ?? ""),
  };
  const db = createServerClient();
  // Each submit may call BrasilAPI and Nominatim (max 1 request/second), so keep bots out.
  if (!(await withinLimit(db, `signup:${await getClientIp()}`, 10, 10))) {
    return { errors: { name: "Muitas tentativas. Espere alguns minutos e tente de novo." }, values };
  }

  const parsed = parseSignupForm(form);
  const errors: SignupErrors = parsed.ok ? {} : { ...parsed.errors };
  const categoryIds = parsed.ok ? await activeCategoryIds(db, parsed.data.categoryIds) : [];
  if (parsed.ok && categoryIds.length === 0) errors.categoryIds = "Escolha pelo menos uma categoria";

  const location = readLocationInput(form);
  if (!location) errors.location = "Informe onde você atende";
  // Only look the location up when everything else is right: it costs external calls.
  if (!parsed.ok || !location || Object.keys(errors).length > 0) return { errors, values };

  const place = await resolveLocation(location);
  const pending = pendingSignupSchema.safeParse({
    name: parsed.data.name,
    categoryIds,
    consent: true,
    place: place && {
      ...place,
      neighborhood: place.neighborhood?.slice(0, 80) ?? null,
      city: place.city?.slice(0, 80) ?? null,
      state: place.state,
    },
  });
  if (!pending.success) {
    errors.location =
      location.kind === "cep"
        ? "Não encontramos esse CEP. Tente usar sua localização."
        : "Não conseguimos usar essa localização. Informe o CEP.";
    return { errors, values };
  }

  await setSignedCookie(
    PENDING_SIGNUP_COOKIE,
    JSON.stringify(pending.data),
    new Date(Date.now() + PENDING_MINUTES * 60_000),
  );
  redirect((await getCurrentSession()) ? "/prestador/concluir" : "/entrar?voltar=/prestador/concluir");
}

"use server";

import { redirect } from "next/navigation";
import { categoryBySlug } from "@/lib/categories";
import { readLocationInput } from "@/lib/location/form";
import { lookupCep } from "@/lib/location/cep";
import { isInBrazil } from "@/lib/location/resolve";
import { withinLimit } from "@/lib/rate-limit";
import { parseSearchForm, type SearchFormErrors } from "@/lib/search/form";
import { toQuery } from "@/lib/search/params";
import { createServerClient } from "@/lib/supabase/server";
import { getClientIp } from "@/server/request-ip";

export type SearchState = {
  errors: SearchFormErrors;
  values: { name: string; category: string; details: string; radius: string; cep: string };
} | null;

/** Screen 01: validates the search and opens /resultados. No login (ADR 0005). */
export async function search(_previous: SearchState, form: FormData): Promise<SearchState> {
  const values = {
    name: String(form.get("name") ?? ""),
    category: String(form.get("category") ?? ""),
    details: String(form.get("details") ?? ""),
    radius: String(form.get("radius") ?? ""),
    cep: String(form.get("location_cep") ?? ""),
  };
  const parsed = parseSearchForm(form);
  const errors: SearchFormErrors = parsed.ok ? {} : { ...parsed.errors };
  const db = createServerClient();
  if (parsed.ok && !(await categoryBySlug(db, parsed.data.category))) errors.category = "Escolha uma categoria";

  const location = readLocationInput(form);
  if (!location) errors.location = "Informe onde é o serviço";
  if (!parsed.ok || !location || Object.keys(errors).length > 0) return { errors, values };

  // The client's own GPS needs no lookup. A CEP costs an external call, so it is rate limited.
  let point = location.kind === "gps" ? { lat: location.lat, lng: location.lng } : null;
  if (location.kind === "cep") {
    if (!(await withinLimit(db, `cep:${await getClientIp()}`, 30, 10))) {
      return { errors: { location: "Muitas buscas seguidas. Espere alguns minutos." }, values };
    }
    point = await lookupCep(location.cep);
  }
  if (!point || !isInBrazil(point.lat, point.lng)) {
    errors.location =
      location.kind === "cep"
        ? "Não encontramos esse CEP. Tente usar sua localização."
        : "Não conseguimos usar essa localização. Informe o CEP.";
    return { errors, values };
  }

  redirect(`/resultados?${toQuery({ ...parsed.data, lat: point.lat, lng: point.lng })}`);
}

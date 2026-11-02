import { z } from "zod";
import { normalizeRadius } from "./params";

/** Shared by the form and the URL (lib/search/params.ts): these texts end up in the WhatsApp message. */
export const searchTextSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(60, "Use até 60 caracteres"),
  category: z.string().trim().min(1, "Escolha uma categoria").max(60),
  details: z.string().trim().min(1, "Descreva o serviço").max(500, "Use até 500 caracteres"),
});

export type SearchFormData = { name: string; category: string; details: string; radiusKm: number };
export type SearchFormErrors = Partial<Record<"name" | "category" | "details" | "location", string>>;

/** Validates screen 01. The location is resolved separately. */
export function parseSearchForm(
  form: FormData,
): { ok: true; data: SearchFormData } | { ok: false; errors: SearchFormErrors } {
  const result = searchTextSchema.safeParse({
    name: form.get("name") ?? "",
    category: form.get("category") ?? "",
    details: form.get("details") ?? "",
  });
  if (!result.success) {
    const errors: SearchFormErrors = {};
    for (const issue of result.error.issues) errors[issue.path[0] as keyof SearchFormErrors] ??= issue.message;
    return { ok: false, errors };
  }
  return { ok: true, data: { ...result.data, radiusKm: normalizeRadius(String(form.get("radius") ?? "")) } };
}

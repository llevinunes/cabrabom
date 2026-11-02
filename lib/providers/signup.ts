import { z } from "zod";
import { isInBrazil } from "@/lib/location/resolve";

const name = z.string().trim().min(2, "Informe seu nome").max(60, "Use até 60 caracteres");
const categoryIds = z
  .array(z.coerce.number().int().positive())
  .min(1, "Escolha pelo menos uma categoria")
  .transform((ids) => [...new Set(ids)]);

const signupFormSchema = z.object({
  name,
  categoryIds,
  consent: z.literal("on", { error: "Marque a caixa para continuar" }),
});

export type SignupData = { name: string; categoryIds: number[] };
export type SignupErrors = Partial<Record<"name" | "categoryIds" | "consent" | "location", string>>;

/** Validates the signup form (screen 07). The location is resolved separately. */
export function parseSignupForm(
  form: FormData,
): { ok: true; data: SignupData } | { ok: false; errors: SignupErrors } {
  const result = signupFormSchema.safeParse({
    name: form.get("name") ?? "",
    categoryIds: form.getAll("category").filter((value) => /^\d+$/.test(String(value))),
    consent: form.get("consent") ?? undefined,
  });
  if (result.success) return { ok: true, data: { name: result.data.name, categoryIds: result.data.categoryIds } };

  const errors: SignupErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof SignupErrors;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}

/** What is kept in the pending-signup cookie between the form and the WhatsApp login. */
export const pendingSignupSchema = z.object({
  name,
  categoryIds,
  consent: z.literal(true),
  place: z
    .object({
      lat: z.number(),
      lng: z.number(),
      neighborhood: z.string().max(80).nullable(),
      city: z.string().max(80).nullable(),
    })
    .refine((place) => isInBrazil(place.lat, place.lng)),
});

export type PendingSignup = z.infer<typeof pendingSignupSchema>;

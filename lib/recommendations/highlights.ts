/** Suggested highlights (spec 3.4), in the order they are shown. */
export const HIGHLIGHTS = ["Pontual", "Caprichoso", "Preço justo", "Limpo e organizado", "Educado", "Resolveu rápido"] as const;

export const COMMENT_MAX_LENGTH = 500;

export type RecommendationInput = { highlights: string[]; comment: string | null };

export function parseRecommendationForm(
  form: FormData,
): ({ ok: true } & RecommendationInput) | { ok: false; error: string } {
  const chosen = new Set(form.getAll("highlight").map(String));
  const highlights = HIGHLIGHTS.filter((highlight) => chosen.has(highlight));
  const comment = String(form.get("comment") ?? "").trim() || null;
  if (comment && comment.length > COMMENT_MAX_LENGTH) {
    return { ok: false, error: `O comentário pode ter até ${COMMENT_MAX_LENGTH} caracteres` };
  }
  if (highlights.length === 0 && !comment) return { ok: false, error: "Escolha um destaque ou escreva um comentário" };
  return { ok: true, highlights, comment };
}

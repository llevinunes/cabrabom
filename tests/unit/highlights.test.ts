import { expect, test } from "vitest";
import { HIGHLIGHTS, parseRecommendationForm } from "@/lib/recommendations/highlights";

const form = (entries: [string, string][]) => {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return data;
};

test("the six highlights of the spec, in order", () => {
  expect(HIGHLIGHTS).toEqual(["Pontual", "Caprichoso", "Preço justo", "Limpo e organizado", "Educado", "Resolveu rápido"]);
});

test("keeps known highlights once each and trims the comment", () => {
  expect(
    parseRecommendationForm(
      form([
        ["highlight", "Pontual"],
        ["highlight", "Ótimo"],
        ["highlight", "Educado"],
        ["highlight", "Pontual"],
        ["comment", "  Muito bom  "],
      ]),
    ),
  ).toEqual({ ok: true, highlights: ["Pontual", "Educado"], comment: "Muito bom" });
});

test("an empty comment is null; a highlight alone is enough", () => {
  expect(parseRecommendationForm(form([["highlight", "Caprichoso"], ["comment", "   "]]))).toEqual({
    ok: true,
    highlights: ["Caprichoso"],
    comment: null,
  });
});

test("needs a highlight or a comment", () => {
  expect(parseRecommendationForm(form([["comment", " "]]))).toEqual({
    ok: false,
    error: "Escolha um destaque ou escreva um comentário",
  });
});

test("the comment has at most 500 characters", () => {
  expect(parseRecommendationForm(form([["comment", "a".repeat(501)]]))).toEqual({
    ok: false,
    error: "O comentário pode ter até 500 caracteres",
  });
  expect(parseRecommendationForm(form([["comment", "a".repeat(500)]])).ok).toBe(true);
});

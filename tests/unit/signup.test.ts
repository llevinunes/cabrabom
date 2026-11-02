import { describe, expect, test } from "vitest";
import { parseSignupForm, pendingSignupSchema } from "@/lib/providers/signup";

const form = (entries: [string, string][]) => {
  const data = new FormData();
  for (const [key, value] of entries) data.append(key, value);
  return data;
};

describe("parseSignupForm", () => {
  test("accepts name, categories and consent", () => {
    const result = parseSignupForm(
      form([
        ["name", "  João Silva "],
        ["category", "1"],
        ["category", "2"],
        ["consent", "on"],
      ]),
    );
    expect(result).toEqual({ ok: true, data: { name: "João Silva", categoryIds: [1, 2] } });
  });

  test("reports every missing field in Portuguese", () => {
    const result = parseSignupForm(form([["name", "J"]]));
    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Informe seu nome",
        categoryIds: "Escolha pelo menos uma categoria",
        consent: "Marque a caixa para continuar",
      },
    });
  });

  test("ignores category values that are not ids", () => {
    const result = parseSignupForm(form([["name", "João"], ["category", "abc"], ["consent", "on"]]));
    expect(result.ok).toBe(false);
  });
});

test("pendingSignupSchema validates what comes back from the cookie", () => {
  const valid = {
    name: "João",
    categoryIds: [1],
    consent: true,
    place: { lat: -7.2, lng: -35.9, neighborhood: "Centro", city: null },
  };
  expect(pendingSignupSchema.safeParse({ ...valid, consent: false }).success).toBe(false);
  expect(pendingSignupSchema.safeParse({ ...valid, place: { ...valid.place, neighborhood: "x".repeat(81) } }).success).toBe(
    false,
  );
  expect(pendingSignupSchema.safeParse(valid).success).toBe(true);
  expect(pendingSignupSchema.safeParse({ ...valid, categoryIds: [] }).success).toBe(false);
  expect(pendingSignupSchema.safeParse({ ...valid, place: { ...valid.place, lat: -95 } }).success).toBe(false);
});

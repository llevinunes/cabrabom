import { expect, test } from "vitest";
import { parseSearchForm } from "@/lib/search/form";

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

test("reads name, category, details and radius", () => {
  expect(parseSearchForm(form({ name: " Maria ", category: "eletricista", details: " Trocar tomada ", radius: "25" }))).toEqual({
    ok: true,
    data: { name: "Maria", category: "eletricista", details: "Trocar tomada", radiusKm: 25 },
  });
});

test("reports what is missing in Portuguese", () => {
  expect(parseSearchForm(form({ radius: "10" }))).toEqual({
    ok: false,
    errors: { name: "Informe seu nome", category: "Escolha uma categoria", details: "Descreva o serviço" },
  });
});

test("limits the details so the WhatsApp message stays reasonable", () => {
  const result = parseSearchForm(form({ name: "Maria", category: "eletricista", details: "x".repeat(501) }));
  expect(result).toEqual({ ok: false, errors: { details: "Use até 500 caracteres" } });
});

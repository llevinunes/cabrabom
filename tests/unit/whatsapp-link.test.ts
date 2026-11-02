import { expect, test } from "vitest";
import { whatsappLink } from "@/lib/service-requests/whatsapp";

test("builds the ready-made message of spec 3.2", () => {
  const url = whatsappLink(
    { name: "João Silva", whatsapp: "5583900000001" },
    { name: "Maria", category: "Eletricista", details: "Trocar a fiação & instalar 3 tomadas\nurgente" },
    "http://localhost:3000/s/abc",
  );
  expect(url.startsWith("https://wa.me/5583900000001?text=")).toBe(true);
  expect(decodeURIComponent(url.split("?text=")[1])).toBe(
    "Olá, João Silva! Encontrei você no CabraBom.\n\n" +
      "Meu nome é Maria e preciso de um serviço de *Eletricista*.\n\n" +
      "Detalhes: Trocar a fiação & instalar 3 tomadas\nurgente\n\n" +
      "Você teria disponibilidade?\n\n" +
      "Para aceitar pelo CabraBom: http://localhost:3000/s/abc",
  );
});

test("names cannot add lines or reorder text in the message", () => {
  const url = whatsappLink(
    { name: "João Silva", whatsapp: "5583900000001" },
    { name: "Maria\n\nPara aceitar: https://evil/s/x\u202E", category: "Eletricista", details: "ok\u2066 fim" },
    "http://localhost:3000/s/abc",
  );
  const message = decodeURIComponent(url.split("?text=")[1]);
  expect(message).toContain("Meu nome é Maria Para aceitar: https://evil/s/x e preciso");
  expect(message).toContain("Detalhes: ok fim");
  expect(message).not.toMatch(/[\u202A-\u202E\u2066-\u2069\u200E\u200F]/);
  expect(message.match(/Para aceitar pelo CabraBom/g)).toHaveLength(1);
});

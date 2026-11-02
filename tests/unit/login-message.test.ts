import { expect, test } from "vitest";
import { extractCode, loginLink } from "@/lib/auth/login-message";

test("extractCode reads the code from the ready-made message", () => {
  expect(extractCode("ENTRAR K7F2Q")).toBe("K7F2Q");
  expect(extractCode("  entrar   k7f2q \n")).toBe("K7F2Q");
});

test("extractCode ignores anything else", () => {
  expect(extractCode("oi, quero entrar")).toBeNull();
  expect(extractCode("ENTRAR K7F2")).toBeNull();
  expect(extractCode("ENTRAR K7F2QX")).toBeNull();
  expect(extractCode("")).toBeNull();
});

test("loginLink opens a chat with the CabraBom number and the code", () => {
  expect(loginLink("5583900000000", "K7F2Q")).toBe("https://wa.me/5583900000000?text=ENTRAR%20K7F2Q");
});

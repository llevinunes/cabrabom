import { expect, test } from "vitest";
import { safeReturnTo } from "@/lib/auth/return-to";

test("accepts paths inside the app", () => {
  expect(safeReturnTo("/painel")).toBe("/painel");
  expect(safeReturnTo("/s/abc?x=1")).toBe("/s/abc?x=1");
});

test("falls back to / for anything that leaves the app", () => {
  expect(safeReturnTo("//evil.com")).toBe("/");
  expect(safeReturnTo("https://evil.com")).toBe("/");
  expect(safeReturnTo("/\\evil.com")).toBe("/");
  expect(safeReturnTo("javascript:alert(1)")).toBe("/");
  expect(safeReturnTo("painel")).toBe("/");
  expect(safeReturnTo("")).toBe("/");
  expect(safeReturnTo(null)).toBe("/");
  expect(safeReturnTo(undefined)).toBe("/");
});

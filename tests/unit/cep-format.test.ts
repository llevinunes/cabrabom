import { expect, test } from "vitest";
import { CEP_MAX_LENGTH, formatCep } from "@/lib/location/cep-format";

test("formats as 00000-000 while typing", () => {
  expect(formatCep("5")).toBe("5");
  expect(formatCep("58400")).toBe("58400");
  expect(formatCep("584001")).toBe("58400-1");
  expect(formatCep("58400000")).toBe("58400-000");
});

test("drops anything that is not a digit", () => {
  expect(formatCep("58.400-000")).toBe("58400-000");
  expect(formatCep("abc58400 000")).toBe("58400-000");
  expect(formatCep("")).toBe("");
});

test("keeps at most 8 digits", () => {
  expect(formatCep("584000001234")).toBe("58400-000");
  expect(CEP_MAX_LENGTH).toBe(9);
});

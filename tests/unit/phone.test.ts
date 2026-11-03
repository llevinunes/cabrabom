import { describe, expect, test } from "vitest";
import { formatPhone, normalizePhone } from "@/lib/phone";

describe("normalizePhone", () => {
  test("keeps only digits", () => {
    expect(normalizePhone("+55 (83) 99999-1234")).toBe("5583999991234");
  });

  test("adds the country code when missing", () => {
    expect(normalizePhone("83999991234")).toBe("5583999991234");
    expect(normalizePhone("8333221234")).toBe("558333221234");
  });

  test("adds the mobile 9 that WhatsApp ids sometimes omit", () => {
    // wa_id for a Brazilian mobile can arrive as 55 + area code + 8 digits
    expect(normalizePhone("558399991234")).toBe("5583999991234");
  });

  test("keeps 8-digit landlines as they are", () => {
    expect(normalizePhone("558333221234")).toBe("558333221234");
  });

  test("rejects anything that is not a Brazilian number", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("14155552671")).toBeNull(); // US number
    expect(normalizePhone("5583999991234567")).toBeNull();
  });
});

test("formatPhone shows a normalized number the Brazilian way", () => {
  expect(formatPhone("5583999991234")).toBe("(83) 99999-1234");
  expect(formatPhone("558333221234")).toBe("(83) 3322-1234");
});

import { expect, test } from "vitest";
import { VERIFICATION_CODE_ALPHABET, generateToken, generateVerificationCode } from "@/lib/tokens";

test("generateToken returns 24 url-safe characters", () => {
  const token = generateToken();
  expect(token).toMatch(/^[A-Za-z0-9_-]{24}$/);
  expect(generateToken()).not.toBe(token);
});

test("generateVerificationCode uses 5 unambiguous characters", () => {
  expect(VERIFICATION_CODE_ALPHABET).toBe("ABCDEFGHJKLMNPQRSTUVWXYZ23456789");
  for (let i = 0; i < 50; i++) {
    expect(generateVerificationCode()).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$/);
  }
});

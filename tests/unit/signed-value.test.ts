import { expect, test } from "vitest";
import { signValue, verifySignedValue } from "@/lib/signed-value";

const SECRET = "a".repeat(32);

test("round-trips a value", () => {
  expect(verifySignedValue(signValue('{"name":"João"}', SECRET), SECRET)).toBe('{"name":"João"}');
});

test("rejects a tampered value, another secret or garbage", () => {
  const signed = signValue('{"name":"João"}', SECRET);
  const [payload, mac] = signed.split(".");
  const tampered = Buffer.from('{"name":"Spam"}').toString("base64url") + "." + mac;
  expect(payload).toBeTruthy();
  expect(verifySignedValue(tampered, SECRET)).toBeNull();
  expect(verifySignedValue(signed, "b".repeat(32))).toBeNull();
  expect(verifySignedValue("nonsense", SECRET)).toBeNull();
  expect(verifySignedValue("", SECRET)).toBeNull();
});

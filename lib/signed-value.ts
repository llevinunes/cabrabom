import { createHmac, timingSafeEqual } from "node:crypto";

/** "base64url(value).base64url(hmac)": lets the server trust a value it stored in the browser. */
export function signValue(value: string, secret: string): string {
  const payload = Buffer.from(value).toString("base64url");
  return `${payload}.${mac(payload, secret)}`;
}

/** The original value, or null if it was changed or signed with another secret. */
export function verifySignedValue(signed: string, secret: string): string | null {
  const [payload, received] = signed.split(".");
  if (!payload || !received) return null;
  const expected = Buffer.from(mac(payload, secret));
  const given = Buffer.from(received);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return Buffer.from(payload, "base64url").toString();
}

function mac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

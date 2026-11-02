import { createHmac, timingSafeEqual } from "node:crypto";
import { extractCode } from "@/lib/auth/login-message";
import { confirmCode } from "@/lib/auth/verification";
import { normalizePhone } from "@/lib/phone";
import type { Db } from "@/lib/supabase/server";

export type IncomingMessage = { from: string; text: string };

/** Checks Meta's X-Hub-Signature-256 header: "sha256=" + HMAC-SHA256 of the raw body. */
export function isValidSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest();
  const received = Buffer.from(header.slice("sha256=".length), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

type WebhookPayload = {
  entry?: { changes?: { value?: { messages?: { from?: string; type?: string; text?: { body?: string } }[] } }[] }[];
};

/** Text messages from a WhatsApp Cloud API webhook payload. Anything unexpected yields []. */
export function extractMessages(payload: unknown): IncomingMessage[] {
  const entries = (payload as WebhookPayload | null)?.entry;
  if (!Array.isArray(entries)) return [];
  return entries
    .flatMap((entry) => entry.changes ?? [])
    .flatMap((change) => change.value?.messages ?? [])
    .filter((message) => message.type === "text" && message.from && message.text?.body)
    .map((message) => ({ from: message.from!, text: message.text!.body! }));
}

/** Confirms login codes found in the messages. Returns how many were confirmed. */
export async function handleIncomingMessages(db: Db, messages: IncomingMessage[]): Promise<number> {
  let confirmed = 0;
  for (const message of messages) {
    const code = extractCode(message.text);
    const phone = normalizePhone(message.from);
    if (code && phone && (await confirmCode(db, code, phone))) confirmed++;
  }
  return confirmed;
}

import { env } from "@/lib/env";
import { createServerClient } from "@/lib/supabase/server";
import { extractMessages, handleIncomingMessages, isValidSignature } from "@/lib/whatsapp/webhook";

// Webhook of the WhatsApp Cloud API (spec section 4). The app only receives messages.

/** Meta's subscription check: echo hub.challenge when the verify token matches. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const verifyToken = env().WHATSAPP_VERIFY_TOKEN;
  if (verifyToken && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === verifyToken) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const secret = env().META_APP_SECRET;
  const rawBody = await request.text();
  if (!secret || !isValidSignature(rawBody, request.headers.get("x-hub-signature-256"), secret)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("OK", { status: 200 });
  }
  // Always 200 once the signature is valid, so Meta does not retry messages we chose to ignore.
  await handleIncomingMessages(createServerClient(), extractMessages(payload));
  return new Response("OK", { status: 200 });
}

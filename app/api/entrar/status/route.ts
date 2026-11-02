import { createSession } from "@/lib/auth/session";
import { consumeVerification } from "@/lib/auth/verification";
import { createServerClient } from "@/lib/supabase/server";
import { VERIFICATION_COOKIE, deleteCookie, readCookie } from "@/server/cookies";
import { setSessionCookie } from "@/server/session";

/**
 * Polled by /entrar while the user sends the WhatsApp message. Uses the httpOnly
 * verification cookie, never the code itself, so knowing a code is not enough to log in.
 */
export async function GET() {
  const verificationId = await readCookie(VERIFICATION_COOKIE);
  if (!verificationId) return Response.json({ ready: false, expired: true });

  const db = createServerClient();
  const verified = await consumeVerification(db, verificationId);
  if (!verified) return Response.json({ ready: false });

  const session = await createSession(db, verified.phone);
  await setSessionCookie(session.id, session.expiresAt);
  await deleteCookie(VERIFICATION_COOKIE);
  return Response.json({ ready: true });
}

import { createSession } from "@/lib/auth/session";
import { consumeVerification, findPendingVerification } from "@/lib/auth/verification";
import { createServerClient } from "@/lib/supabase/server";
import { VERIFICATION_COOKIE } from "@/server/cookie-names";
import { deleteCookie, readCookie } from "@/server/cookies";
import { setSessionCookie } from "@/server/session";

export type LoginStatus = { ready: boolean; expired?: boolean };

/**
 * Polled by /entrar while the user sends the WhatsApp message. Uses the httpOnly
 * verification cookie, never the code itself, so knowing a code is not enough to log in.
 */
export async function GET() {
  const verificationId = await readCookie(VERIFICATION_COOKIE);
  if (!verificationId) return status({ ready: false, expired: true });

  const db = createServerClient();
  const verified = await consumeVerification(db, verificationId);
  if (!verified) {
    if (await findPendingVerification(db, verificationId)) return status({ ready: false });
    await deleteCookie(VERIFICATION_COOKIE);
    return status({ ready: false, expired: true });
  }

  const session = await createSession(db, verified.phone);
  await setSessionCookie(session.id, session.expiresAt);
  await deleteCookie(VERIFICATION_COOKIE);
  return status({ ready: true });
}

function status(body: LoginStatus) {
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}

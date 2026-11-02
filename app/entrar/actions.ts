"use server";

import { loginLink } from "@/lib/auth/login-message";
import { findPendingVerification, startVerification, type Verification } from "@/lib/auth/verification";
import { env } from "@/lib/env";
import { withinLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";
import { VERIFICATION_COOKIE } from "@/server/cookie-names";
import { readCookie, setPrivateCookie } from "@/server/cookies";
import { getClientIp } from "@/server/request-ip";

export type StartLoginResult =
  | { ok: true; link: string; code: string; cabraBomNumber: string }
  | { ok: false; error: string };

/**
 * Returns the login code for this browser: the one still pending, if any (the user may
 * already have sent it), or a new one remembered in an httpOnly cookie for the polling route.
 */
export async function startLogin(): Promise<StartLoginResult> {
  const db = createServerClient();
  const existingId = await readCookie(VERIFICATION_COOKIE);
  let verification: Verification | null = existingId ? await findPendingVerification(db, existingId) : null;

  if (!verification) {
    if (!(await withinLimit(db, `code:${await getClientIp()}`, 5, 10))) {
      return { ok: false, error: "Muitas tentativas. Espere alguns minutos e tente de novo." };
    }
    verification = await startVerification(db);
    await setPrivateCookie(VERIFICATION_COOKIE, verification.id, verification.expiresAt);
  }

  const number = env().WHATSAPP_CABRABOM_NUMBER;
  return { ok: true, link: loginLink(number, verification.code), code: verification.code, cabraBomNumber: number };
}

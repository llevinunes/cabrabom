"use server";

import { loginLink } from "@/lib/auth/login-message";
import { startVerification } from "@/lib/auth/verification";
import { env } from "@/lib/env";
import { withinLimit } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase/server";
import { VERIFICATION_COOKIE, setPrivateCookie } from "@/server/cookies";
import { getClientIp } from "@/server/request-ip";

export type StartLoginResult =
  | { ok: true; link: string; code: string; cabraBomNumber: string }
  | { ok: false; error: string };

/** Creates a login code and remembers it in an httpOnly cookie for the polling route. */
export async function startLogin(): Promise<StartLoginResult> {
  const db = createServerClient();
  if (!(await withinLimit(db, `code:${await getClientIp()}`, 5, 10))) {
    return { ok: false, error: "Muitas tentativas. Espere alguns minutos e tente de novo." };
  }
  const verification = await startVerification(db);
  await setPrivateCookie(VERIFICATION_COOKIE, verification.id, verification.expiresAt);
  const number = env().WHATSAPP_CABRABOM_NUMBER;
  return { ok: true, link: loginLink(number, verification.code), code: verification.code, cabraBomNumber: number };
}

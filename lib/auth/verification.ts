import type { Db } from "@/lib/supabase/server";
import { generateVerificationCode } from "@/lib/tokens";
import { isUuid } from "@/lib/uuid";

export const VERIFICATION_MINUTES = 10;
const UNIQUE_VIOLATION = "23505";

export type Verification = { id: string; code: string; expiresAt: Date };

/** Creates a pending login code (spec section 4, step 2). */
export async function startVerification(db: Db): Promise<Verification> {
  const expiresAt = new Date(Date.now() + VERIFICATION_MINUTES * 60_000);
  // Codes are unique across history, so a rare collision just draws another one.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateVerificationCode();
    const { data, error } = await db
      .from("verifications")
      .insert({ code, expires_at: expiresAt.toISOString() })
      .select("id")
      .single();
    if (!error) return { id: data.id, code, expiresAt };
    if (error.code !== UNIQUE_VIOLATION) throw error;
  }
  throw new Error("could not generate a unique verification code");
}

/** Called by the webhook: links the sender's phone to a pending, unexpired code. */
export async function confirmCode(db: Db, code: string, phone: string): Promise<boolean> {
  const { data, error } = await db
    .from("verifications")
    .update({ phone, confirmed_at: new Date().toISOString() })
    .eq("code", code)
    .is("phone", null)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id");
  if (error) throw error;
  return data.length > 0;
}

/**
 * Called by the waiting browser: when the code was confirmed, marks it used and
 * returns the phone. A single conditional update, so it succeeds only once.
 */
export async function consumeVerification(db: Db, id: string): Promise<{ phone: string } | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await db
    .from("verifications")
    .update({ used_at: new Date().toISOString() })
    .eq("id", id)
    .is("used_at", null)
    .not("confirmed_at", "is", null)
    .gt("expires_at", new Date().toISOString())
    .select("phone")
    .maybeSingle();
  if (error) throw error;
  return data?.phone ? { phone: data.phone } : null;
}

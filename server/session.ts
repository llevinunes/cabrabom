import "server-only";
import { cache } from "react";
import { endSession, findSession, type Session } from "@/lib/auth/session";
import { createServerClient } from "@/lib/supabase/server";
import { SESSION_COOKIE } from "./cookie-names";
import { deleteCookie, readCookie, setPrivateCookie } from "./cookies";

/** The logged-in session for this request, or null. Cached per request. */
export const getCurrentSession = cache(async (): Promise<Session | null> => {
  const id = await readCookie(SESSION_COOKIE);
  return id ? findSession(createServerClient(), id) : null;
});

export async function setSessionCookie(id: string, expiresAt: Date) {
  await setPrivateCookie(SESSION_COOKIE, id, expiresAt);
}

export async function signOutCurrentSession() {
  const id = await readCookie(SESSION_COOKIE);
  if (id) await endSession(createServerClient(), id);
  await deleteCookie(SESSION_COOKIE);
}

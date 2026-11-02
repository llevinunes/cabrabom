import "server-only";
import { generateToken } from "@/lib/tokens";
import { ANONYMOUS_CLIENT_COOKIE } from "./cookie-names";
import { readCookie, setPrivateCookie } from "./cookies";

// Only needs to outlive an open request (48 h); kept short so it is not a long-term tracker.
const LIFETIME_MS = 7 * 86_400_000;

/** A random id for this browser, so tapping "Conversar" twice does not open two requests. */
export async function getAnonymousClient(): Promise<string> {
  const existing = await readCookie(ANONYMOUS_CLIENT_COOKIE);
  if (existing && /^[A-Za-z0-9_-]{24}$/.test(existing)) return existing;
  const id = generateToken();
  await setPrivateCookie(ANONYMOUS_CLIENT_COOKIE, id, new Date(Date.now() + LIFETIME_MS));
  return id;
}

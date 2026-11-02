import "server-only";
import { generateToken } from "@/lib/tokens";
import { ANONYMOUS_CLIENT_COOKIE } from "./cookie-names";
import { readCookie, setPrivateCookie } from "./cookies";

const ONE_YEAR_MS = 365 * 86_400_000;

/** A random id for this browser, so tapping "Conversar" twice does not open two requests. */
export async function getAnonymousClient(): Promise<string> {
  const existing = await readCookie(ANONYMOUS_CLIENT_COOKIE);
  if (existing && /^[A-Za-z0-9_-]{24}$/.test(existing)) return existing;
  const id = generateToken();
  await setPrivateCookie(ANONYMOUS_CLIENT_COOKIE, id, new Date(Date.now() + ONE_YEAR_MS));
  return id;
}

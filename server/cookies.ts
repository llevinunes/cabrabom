import "server-only";
import { cookies } from "next/headers";

export { SESSION_COOKIE, VERIFICATION_COOKIE } from "./cookie-names";

export async function setPrivateCookie(name: string, value: string, expires: Date) {
  (await cookies()).set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function readCookie(name: string): Promise<string | undefined> {
  return (await cookies()).get(name)?.value;
}

export async function deleteCookie(name: string) {
  (await cookies()).delete(name);
}

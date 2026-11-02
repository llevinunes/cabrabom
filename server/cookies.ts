import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { signValue, verifySignedValue } from "@/lib/signed-value";

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

/** A cookie the browser holds but cannot change: signed with COOKIE_SECRET. */
export async function setSignedCookie(name: string, value: string, expires: Date) {
  await setPrivateCookie(name, signValue(value, env().COOKIE_SECRET), expires);
}

export async function readSignedCookie(name: string): Promise<string | null> {
  const signed = await readCookie(name);
  return signed ? verifySignedValue(signed, env().COOKIE_SECRET) : null;
}

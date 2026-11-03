import "server-only";
import { headers } from "next/headers";

/** Client IP for rate limiting. On Vercel the first x-forwarded-for entry is the client. */
export async function getClientIp(): Promise<string> {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
}

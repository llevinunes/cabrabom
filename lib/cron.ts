import { timingSafeEqual } from "node:crypto";

/** Vercel Cron calls with "Authorization: Bearer <CRON_SECRET>". */
export function cronStatus(authorization: string | null, secret: string | undefined): 200 | 401 | 503 {
  if (!secret) return 503;
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(authorization ?? "");
  return given.length === expected.length && timingSafeEqual(given, expected) ? 200 : 401;
}

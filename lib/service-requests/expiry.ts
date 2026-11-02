/** Open requests expire after 2 days without an answer (spec 3.6). */
export const EXPIRY_HOURS = 48;

export function expiryCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - EXPIRY_HOURS * 3_600_000);
}

import { EXPIRY_HOURS } from "./expiry";

const HOUR = 3_600_000;

/** An open request older than 2 days counts as expired even before the hourly cron runs. */
export function isExpired(request: { status: string; createdAt: Date }, now: Date = new Date()): boolean {
  if (request.status === "expired") return true;
  return request.status === "open" && now.getTime() - request.createdAt.getTime() > EXPIRY_HOURS * HOUR;
}

/** "expira em 2 dias" … "expira em 5 h" … "expira em menos de 1 h" … "expirada". */
export function deadlineText(createdAt: Date, now: Date = new Date()): string {
  const left = createdAt.getTime() + EXPIRY_HOURS * HOUR - now.getTime();
  if (left <= 0) return "expirada";
  if (left >= 24 * HOUR) {
    const days = Math.floor(left / (24 * HOUR));
    return `expira em ${days} ${days === 1 ? "dia" : "dias"}`;
  }
  const hours = Math.floor(left / HOUR);
  return hours < 1 ? "expira em menos de 1 h" : `expira em ${hours} h`;
}

/** "Recebida agora" / "há 5 min" / "há 3 h" / "há 2 dias" (screen 08). */
export function receivedText(createdAt: Date, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - createdAt.getTime()) / 60_000);
  if (minutes < 1) return "Recebida agora";
  if (minutes < 60) return `Recebida há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Recebida há ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Recebida há ${days} ${days === 1 ? "dia" : "dias"}`;
}

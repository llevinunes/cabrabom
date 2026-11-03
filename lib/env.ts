import { z } from "zod";

const optional = z
  .string()
  .optional()
  .transform((value) => value || undefined);

const schema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  APP_URL: z
    .url()
    .default("http://localhost:3000")
    .transform((url) => url.replace(/\/+$/, "")),
  WHATSAPP_CABRABOM_NUMBER: z.string().regex(/^\d{10,15}$/, "only digits, with country code (55 + area code + number)"),
  COOKIE_SECRET: z.string().min(32, "at least 32 characters (signs cookies the server must trust)"),
  WHATSAPP_VERIFY_TOKEN: optional,
  META_APP_SECRET: optional,
  // Web push (spec 5). Without the three VAPID values, notifications are off.
  VAPID_PUBLIC_KEY: optional,
  VAPID_PRIVATE_KEY: optional,
  VAPID_SUBJECT: optional,
  /** Vercel Cron sends it as "Authorization: Bearer <CRON_SECRET>". */
  CRON_SECRET: optional,
});

export type Env = z.infer<typeof schema>;

/**
 * Optional while developing, required in the Vercel production deployment (VERCEL_ENV):
 * without them login or reminders break silently. A local `next build` does not need them.
 */
const REQUIRED_IN_PRODUCTION = ["WHATSAPP_VERIFY_TOKEN", "META_APP_SECRET", "CRON_SECRET"] as const;

export function parseEnv(source: Record<string, string | undefined>, deployment = process.env.VERCEL_ENV): Env {
  const result = schema.safeParse(source);
  const problems = result.success
    ? []
    : result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  if (deployment === "production" && result.success) {
    for (const name of REQUIRED_IN_PRODUCTION) {
      if (!result.data[name]) problems.push(`${name}: required in production`);
    }
    // APP_URL defaults to localhost; in production it goes into every link sent on WhatsApp.
    if (!source.APP_URL || !result.data.APP_URL.startsWith("https://") || /\/\/(localhost|127\.)/.test(result.data.APP_URL)) {
      problems.push("APP_URL: required in production, the public https address of the app");
    }
  }
  if (!result.success || problems.length > 0) {
    throw new Error(`Invalid environment variables:\n${problems.join("\n")}`);
  }
  return result.data;
}

export function pushEnabled(env: Env): boolean {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY && env.VAPID_SUBJECT);
}

let cached: Env | undefined;

/** Server environment, validated on first use. */
export function env(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

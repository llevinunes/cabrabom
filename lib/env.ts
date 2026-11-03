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
  WHATSAPP_CABRABOM_NUMBER: z.string().regex(/^\d{12,13}$/, "only digits: 55 + area code + number"),
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

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = schema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
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

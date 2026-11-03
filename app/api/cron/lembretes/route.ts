import { cronStatus } from "@/lib/cron";
import { env } from "@/lib/env";
import { sendDueReminders } from "@/lib/push/reminders";
import { createServerClient } from "@/lib/supabase/server";

/** Daily reminders (ADR 0040), called by Vercel Cron (vercel.json). */
export async function GET(request: Request) {
  const status = cronStatus(request.headers.get("authorization"), env().CRON_SECRET);
  if (status !== 200) return new Response(null, { status });
  return Response.json(await sendDueReminders(createServerClient()));
}

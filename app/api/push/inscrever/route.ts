import { subscribe } from "@/lib/push/subscriptions";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/server/session";

/** Saves this browser's push subscription for the logged-in session (spec 5). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const status = await subscribe(createServerClient(), await getCurrentSession(), body);
  return new Response(null, { status });
}

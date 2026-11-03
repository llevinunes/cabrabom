import { z } from "zod";
import type { Db } from "@/lib/supabase/server";

/** What the browser's PushSubscription.toJSON() sends to /api/push/inscrever. */
export const pushSubscriptionSchema = z.object({
  endpoint: z.url().startsWith("https://").max(1000),
  keys: z.object({ p256dh: z.string().min(1).max(200), auth: z.string().min(1).max(100) }),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

/** Saves (or moves to this session) the subscription of one browser. */
export async function saveSubscription(db: Db, sessionId: string, input: PushSubscriptionInput): Promise<void> {
  const { error } = await db.from("push_subscriptions").upsert(
    { session_id: sessionId, endpoint: input.endpoint, p256dh: input.keys.p256dh, auth: input.keys.auth },
    { onConflict: "endpoint" },
  );
  if (error) throw error;
}

/** Every browser where this phone is logged in and allowed notifications. */
export async function subscriptionsForPhone(db: Db, phone: string): Promise<(PushSubscriptionInput & { id: string })[]> {
  const { data, error } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth, sessions!inner(phone, expires_at)")
    .eq("sessions.phone", phone)
    .gt("sessions.expires_at", new Date().toISOString());
  if (error) throw error;
  return data.map((row) => ({ id: row.id, endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }));
}

export async function deleteSubscription(db: Db, id: string): Promise<void> {
  const { error } = await db.from("push_subscriptions").delete().eq("id", id);
  if (error) throw error;
}

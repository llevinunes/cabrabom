import type { Db } from "@/lib/supabase/server";
import { busyReminderMessage, finishReminderMessage } from "./messages";
import { notifyPhone, webPushSender, type PushSender } from "./send";

/** The daily reminders (ADR 0040): claims what is due and notifies each provider. */
export async function sendDueReminders(db: Db, send: PushSender = webPushSender): Promise<{ finish: number; busy: number }> {
  const [finish, busy] = await Promise.all([db.rpc("claim_finish_reminders"), db.rpc("claim_busy_reminders")]);
  if (finish.error) throw finish.error;
  if (busy.error) throw busy.error;
  await Promise.all([
    ...finish.data.map((row) => notifyPhone(db, row.provider_whatsapp, finishReminderMessage(row.client_name), send)),
    ...busy.data.map((row) => notifyPhone(db, row.provider_whatsapp, busyReminderMessage(), send)),
  ]);
  return { finish: finish.data.length, busy: busy.data.length };
}

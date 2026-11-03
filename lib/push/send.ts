import webpush from "web-push";
import { env, pushEnabled } from "@/lib/env";
import type { Db } from "@/lib/supabase/server";
import type { PushMessage } from "./messages";
import { deleteSubscription, subscriptionsForPhone, type PushSubscriptionInput } from "./subscriptions";

/** Sends one payload; throws an error with `statusCode` on failure, like web-push. */
export type PushSender = (subscription: PushSubscriptionInput, payload: string) => Promise<void>;

/** The real sender. Without VAPID keys (development), notifications are simply off. */
export const webPushSender: PushSender = async (subscription, payload) => {
  const config = env();
  if (!pushEnabled(config)) return;
  await webpush.sendNotification(subscription, payload, {
    vapidDetails: {
      subject: config.VAPID_SUBJECT!,
      publicKey: config.VAPID_PUBLIC_KEY!,
      privateKey: config.VAPID_PRIVATE_KEY!,
    },
    TTL: 24 * 3600,
    // A push service that does not answer must not hold the request or the cron run.
    timeout: 5000,
  });
};

/** The push service answers 404/410 when the browser dropped the subscription. */
const GONE = new Set([404, 410]);

/**
 * Notifies every browser of this phone. Never throws: a notification is a side effect
 * and must not undo or block the change that caused it (ADR 0039).
 */
export async function notifyPhone(db: Db, phone: string, message: PushMessage, send: PushSender = webPushSender): Promise<void> {
  try {
    const subscriptions = await subscriptionsForPhone(db, phone);
    const payload = JSON.stringify(message);
    await Promise.all(
      subscriptions.map(async ({ id, ...subscription }) => {
        try {
          await send(subscription, payload);
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status && GONE.has(status)) await deleteSubscription(db, id);
          else console.error("push failed", status ?? error);
        }
      }),
    );
  } catch (error) {
    console.error("push failed", error);
  }
}

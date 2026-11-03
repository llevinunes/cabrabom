import "server-only";
import { after } from "next/server";
import type { PushMessage } from "@/lib/push/messages";
import { notifyPhone } from "@/lib/push/send";
import { createServerClient } from "@/lib/supabase/server";

/** Sends the notification after the response: it never delays or undoes the action (ADR 0039). */
export function notifyLater(phone: string, message: PushMessage): void {
  after(() => notifyPhone(createServerClient(), phone, message));
}

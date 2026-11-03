import { afterEach, beforeAll, expect, test } from "vitest";
import { createSession } from "@/lib/auth/session";
import { busyReminderMessage, finishReminderMessage } from "@/lib/push/messages";
import { sendDueReminders } from "@/lib/push/reminders";
import type { PushSender } from "@/lib/push/send";
import { saveSubscription } from "@/lib/push/subscriptions";
import { acceptServiceRequest, confirmServiceRequest } from "@/lib/service-requests/lifecycle";
import { openServiceRequest } from "@/lib/service-requests/open";
import { JOAO_ID, JOAO_WHATSAPP, categoryId, cleanTestData, testClient } from "./helpers";

const db = testClient();
const DAY = 24 * 3_600_000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY).toISOString();
let electrician: number;
let sent: string[];
const send: PushSender = async (_subscription, payload) => {
  sent.push(JSON.parse(payload).title);
};

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
});

afterEach(async () => {
  await cleanTestData(db);
  await db.from("providers").update({ busy_reminder_sent_at: null }).eq("id", JOAO_ID);
});

async function subscribeJoao() {
  const session = await createSession(db, JOAO_WHATSAPP);
  await saveSubscription(db, session.id, { endpoint: "https://push.example/joao", keys: { p256dh: "p", auth: "a" } });
  sent = [];
}

let browser = 0;
async function confirmedDaysAgo(days: number) {
  const { token } = await openServiceRequest(db, {
    providerId: JOAO_ID,
    categoryId: electrician,
    clientName: "Maria",
    details: "Trocar a fiação",
    anonymousClient: `browser-${++browser}`,
  });
  const clientToken = (await acceptServiceRequest(db, token, JOAO_WHATSAPP))!;
  await confirmServiceRequest(db, clientToken, "5583988887777");
  await db.from("service_requests").update({ client_confirmed_at: daysAgo(days) }).eq("provider_token", token);
}

async function busyByHandDaysAgo(days: number) {
  await db.from("providers").update({ busy: true, busy_updated_at: daysAgo(days) }).eq("id", JOAO_ID);
}

test("finish reminder: once, 3 days after the client confirmed", async () => {
  await subscribeJoao();
  await confirmedDaysAgo(2);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 0, busy: 0 });
  await confirmedDaysAgo(4);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 1, busy: 0 });
  expect(sent).toEqual([finishReminderMessage("Maria").title]);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 0, busy: 0 });
});

test("busy reminder: busy by hand for 4 days without a service in progress", async () => {
  await subscribeJoao();
  await busyByHandDaysAgo(4);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 0, busy: 1 });
  expect(sent).toEqual([busyReminderMessage().title]);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 0, busy: 0 });
});

test("busy reminder is skipped while a service is in progress", async () => {
  await subscribeJoao();
  await confirmedDaysAgo(1);
  await busyByHandDaysAgo(4);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 0, busy: 0 });
});

test("busy reminder comes again only after busy_updated_at moves", async () => {
  await subscribeJoao();
  // Reminded 4 days ago; "Continuo ocupado" half a day later restarted the count.
  await db.from("providers").update({ busy: true, busy_reminder_sent_at: daysAgo(4), busy_updated_at: daysAgo(4) }).eq("id", JOAO_ID);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 0, busy: 0 });
  await busyByHandDaysAgo(3.5);
  expect(await sendDueReminders(db, send)).toEqual({ finish: 0, busy: 1 });
});

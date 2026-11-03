import { afterEach, expect, test } from "vitest";
import { createSession, endSession } from "@/lib/auth/session";
import type { PushMessage } from "@/lib/push/messages";
import { notifyPhone, type PushSender } from "@/lib/push/send";
import { deleteSubscription, saveSubscription, subscribe, subscriptionsForPhone } from "@/lib/push/subscriptions";
import { cleanTestData, testClient } from "./helpers";

const db = testClient();
const PHONE = "5583999991234";
const MESSAGE: PushMessage = { title: "t", body: "b", url: "/painel" };
const subscription = (endpoint: string) => ({ endpoint, keys: { p256dh: "p", auth: "a" } });

afterEach(() => cleanTestData(db));

async function endpointsOf(phone: string) {
  return (await subscriptionsForPhone(db, phone)).map((s) => s.endpoint).sort();
}

test("saveSubscription upserts by endpoint", async () => {
  const first = await createSession(db, PHONE);
  const second = await createSession(db, PHONE);
  await saveSubscription(db, first.id, subscription("https://fcm.googleapis.com/fcm/send/1"));
  await saveSubscription(db, second.id, subscription("https://fcm.googleapis.com/fcm/send/1"));
  const { data } = await db.from("push_subscriptions").select("session_id");
  expect(data).toEqual([{ session_id: second.id }]);
});

test("subscriptionsForPhone returns only subscriptions of unexpired sessions of that phone", async () => {
  const mine = await createSession(db, PHONE);
  const expired = await createSession(db, PHONE);
  const other = await createSession(db, "5583900000009");
  await saveSubscription(db, mine.id, subscription("https://fcm.googleapis.com/fcm/send/mine"));
  await saveSubscription(db, expired.id, subscription("https://fcm.googleapis.com/fcm/send/expired"));
  await saveSubscription(db, other.id, subscription("https://fcm.googleapis.com/fcm/send/other"));
  await db.from("sessions").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("id", expired.id);
  expect(await endpointsOf(PHONE)).toEqual(["https://fcm.googleapis.com/fcm/send/mine"]);
});

test("ending the session deletes its subscriptions", async () => {
  const session = await createSession(db, PHONE);
  await saveSubscription(db, session.id, subscription("https://fcm.googleapis.com/fcm/send/1"));
  await endSession(db, session.id);
  expect(await endpointsOf(PHONE)).toEqual([]);
});

test("deleteSubscription removes one subscription", async () => {
  const session = await createSession(db, PHONE);
  await saveSubscription(db, session.id, subscription("https://fcm.googleapis.com/fcm/send/1"));
  const [saved] = await subscriptionsForPhone(db, PHONE);
  await deleteSubscription(db, saved.id);
  expect(await endpointsOf(PHONE)).toEqual([]);
});

test("notifyPhone sends to every subscription and deletes the ones answering 410", async () => {
  const session = await createSession(db, PHONE);
  await saveSubscription(db, session.id, subscription("https://fcm.googleapis.com/fcm/send/ok"));
  await saveSubscription(db, session.id, subscription("https://fcm.googleapis.com/fcm/send/gone"));
  const sent: string[] = [];
  const send: PushSender = async (s, payload) => {
    sent.push(s.endpoint);
    expect(JSON.parse(payload)).toEqual(MESSAGE);
    if (s.endpoint.endsWith("/gone")) throw Object.assign(new Error("gone"), { statusCode: 410 });
  };
  await notifyPhone(db, PHONE, MESSAGE, send);
  expect(sent.sort()).toEqual(["https://fcm.googleapis.com/fcm/send/gone", "https://fcm.googleapis.com/fcm/send/ok"]);
  expect(await endpointsOf(PHONE)).toEqual(["https://fcm.googleapis.com/fcm/send/ok"]);
});

test("notifyPhone swallows other errors and keeps the subscription", async () => {
  const session = await createSession(db, PHONE);
  await saveSubscription(db, session.id, subscription("https://fcm.googleapis.com/fcm/send/flaky"));
  const send: PushSender = async () => {
    throw Object.assign(new Error("server error"), { statusCode: 500 });
  };
  await expect(notifyPhone(db, PHONE, MESSAGE, send)).resolves.toBeUndefined();
  expect(await endpointsOf(PHONE)).toEqual(["https://fcm.googleapis.com/fcm/send/flaky"]);
});

test("subscribe: 401 without a session, 400 for a bad body, 204 when saved, 429 past the limit", async () => {
  const session = await createSession(db, PHONE);
  const body = subscription("https://fcm.googleapis.com/fcm/send/route");
  expect(await subscribe(db, null, body)).toBe(401);
  expect(await subscribe(db, { id: session.id, phone: PHONE }, { endpoint: "http://insecure" })).toBe(400);
  expect(await subscribe(db, { id: session.id, phone: PHONE }, body)).toBe(204);
  expect(await endpointsOf(PHONE)).toEqual(["https://fcm.googleapis.com/fcm/send/route"]);
  for (let i = 0; i < 9; i++) await subscribe(db, { id: session.id, phone: PHONE }, body);
  expect(await subscribe(db, { id: session.id, phone: PHONE }, body)).toBe(429);
});

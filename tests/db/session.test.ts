import { afterEach, expect, test } from "vitest";
import { SESSION_DAYS, createSession, endSession, findSession } from "@/lib/auth/session";
import { cleanTestData, testClient } from "./helpers";

const db = testClient();
const PHONE = "5583999991234";

afterEach(() => cleanTestData(db));

test("a new session lasts 180 days and can be found", async () => {
  expect(SESSION_DAYS).toBe(180);
  const session = await createSession(db, PHONE);
  const days = (session.expiresAt.getTime() - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(179.9);
  expect(await findSession(db, session.id)).toEqual({ id: session.id, phone: PHONE });
});

test("an expired session is not found", async () => {
  const session = await createSession(db, PHONE);
  await db.from("sessions").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("id", session.id);
  expect(await findSession(db, session.id)).toBeNull();
});

test("an ended session is not found", async () => {
  const session = await createSession(db, PHONE);
  await endSession(db, session.id);
  expect(await findSession(db, session.id)).toBeNull();
});

test("a malformed id is not found", async () => {
  expect(await findSession(db, "x")).toBeNull();
});

test("the database rejects phones outside the 55 + DDD + number format", async () => {
  const { error } = await db
    .from("sessions")
    .insert({ phone: "+55 83 99999-1234", expires_at: new Date(Date.now() + 60_000).toISOString() });
  expect(error?.code).toBe("23514");
});

import { afterEach, describe, expect, test } from "vitest";
import { confirmCode, consumeVerification, startVerification } from "@/lib/auth/verification";
import { cleanTestData, testClient } from "./helpers";

const db = testClient();
const PHONE = "5583999991234";

afterEach(() => cleanTestData(db));

describe("startVerification", () => {
  test("creates a 5-character code that expires in 10 minutes", async () => {
    const before = Date.now();
    const verification = await startVerification(db);
    expect(verification.code).toMatch(/^[A-Z2-9]{5}$/);
    const minutes = (verification.expiresAt.getTime() - before) / 60_000;
    expect(minutes).toBeGreaterThan(9.9);
    expect(minutes).toBeLessThan(10.1);
  });
});

describe("confirmCode", () => {
  test("links the phone to a pending code once", async () => {
    const { code } = await startVerification(db);
    expect(await confirmCode(db, code, PHONE)).toBe(true);
    expect(await confirmCode(db, code, "5583988887777")).toBe(false);
  });

  test("ignores expired codes", async () => {
    const { id, code } = await startVerification(db);
    await db.from("verifications").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("id", id);
    expect(await confirmCode(db, code, PHONE)).toBe(false);
  });

  test("ignores unknown codes", async () => {
    expect(await confirmCode(db, "ZZZZZ", PHONE)).toBe(false);
  });
});

describe("consumeVerification", () => {
  test("returns nothing before the message arrives", async () => {
    const { id } = await startVerification(db);
    expect(await consumeVerification(db, id)).toBeNull();
  });

  test("returns the phone once, after confirmation", async () => {
    const { id, code } = await startVerification(db);
    await confirmCode(db, code, PHONE);
    expect(await consumeVerification(db, id)).toEqual({ phone: PHONE });
    expect(await consumeVerification(db, id)).toBeNull();
  });

  test("returns nothing when the verification expired", async () => {
    const { id, code } = await startVerification(db);
    await confirmCode(db, code, PHONE);
    await db.from("verifications").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("id", id);
    expect(await consumeVerification(db, id)).toBeNull();
  });

  test("returns nothing for an id that is not a uuid", async () => {
    expect(await consumeVerification(db, "not-a-uuid")).toBeNull();
  });
});

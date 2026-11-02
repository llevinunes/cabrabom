import { afterEach, expect, test } from "vitest";
import { consumeVerification, startVerification } from "@/lib/auth/verification";
import { handleIncomingMessages } from "@/lib/whatsapp/webhook";
import { cleanTestData, testClient } from "./helpers";

const db = testClient();

afterEach(() => cleanTestData(db));

test("a login message confirms the code with the normalized sender phone", async () => {
  const { id, code } = await startVerification(db);
  // WhatsApp ids of some Brazilian mobiles come without the leading 9
  const confirmed = await handleIncomingMessages(db, [{ from: "558399991234", text: `ENTRAR ${code}` }]);
  expect(confirmed).toBe(1);
  expect(await consumeVerification(db, id)).toEqual({ phone: "5583999991234" });
});

test("other messages and foreign numbers are ignored", async () => {
  const { id, code } = await startVerification(db);
  const confirmed = await handleIncomingMessages(db, [
    { from: "5583999991234", text: "bom dia" },
    { from: "14155552671", text: `ENTRAR ${code}` },
  ]);
  expect(confirmed).toBe(0);
  expect(await consumeVerification(db, id)).toBeNull();
});

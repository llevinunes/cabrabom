import { afterEach, expect, test } from "vitest";
import { withinLimit } from "@/lib/rate-limit";
import { cleanTestData, testClient } from "./helpers";

const db = testClient();

afterEach(() => cleanTestData(db));

test("allows up to the maximum within the window, per key", async () => {
  expect(await withinLimit(db, "code:1.2.3.4", 3, 10)).toBe(true);
  expect(await withinLimit(db, "code:1.2.3.4", 3, 10)).toBe(true);
  expect(await withinLimit(db, "code:1.2.3.4", 3, 10)).toBe(true);
  expect(await withinLimit(db, "code:1.2.3.4", 3, 10)).toBe(false);
  expect(await withinLimit(db, "code:5.6.7.8", 3, 10)).toBe(true);
});

test("old hits fall out of the window", async () => {
  await withinLimit(db, "code:1.2.3.4", 1, 10);
  await db
    .from("rate_limit_hits")
    .update({ created_at: new Date(Date.now() - 11 * 60_000).toISOString() })
    .eq("key", "code:1.2.3.4");
  expect(await withinLimit(db, "code:1.2.3.4", 1, 10)).toBe(true);
});

test("blocked attempts are not recorded, so they do not extend the lockout", async () => {
  for (let i = 0; i < 4; i++) await withinLimit(db, "code:9.9.9.9", 2, 10);
  const { count } = await db
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("key", "code:9.9.9.9");
  expect(count).toBe(2);
});

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

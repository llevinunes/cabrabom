import { expect, test } from "vitest";
import { cronStatus } from "@/lib/cron";

test("503 when the server has no CRON_SECRET", () => {
  expect(cronStatus("Bearer anything", undefined)).toBe(503);
});

test("401 without the right bearer token", () => {
  expect(cronStatus(null, "s3cret")).toBe(401);
  expect(cronStatus("Bearer wrong", "s3cret")).toBe(401);
  expect(cronStatus("s3cret", "s3cret")).toBe(401);
});

test("200 with the right bearer token", () => {
  expect(cronStatus("Bearer s3cret", "s3cret")).toBe(200);
});

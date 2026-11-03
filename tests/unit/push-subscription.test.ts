import { expect, test } from "vitest";
import { pushSubscriptionSchema } from "@/lib/push/subscriptions";

const keys = { p256dh: "p", auth: "a" };
const valid = (endpoint: string) => pushSubscriptionSchema.safeParse({ endpoint, keys }).success;

test("accepts the browsers' push services", () => {
  expect(valid("https://fcm.googleapis.com/fcm/send/abc")).toBe(true);
  expect(valid("https://web.push.apple.com/QGx")).toBe(true);
  expect(valid("https://updates.push.services.mozilla.com/wpush/v2/x")).toBe(true);
  expect(valid("https://wns2-bl2p.notify.windows.com/w/?token=x")).toBe(true);
});

test("refuses any other host, so the server never posts to internal or unknown addresses", () => {
  expect(valid("https://10.0.0.1/push")).toBe(false);
  expect(valid("https://localhost/push")).toBe(false);
  expect(valid("https://evil.example/fcm.googleapis.com")).toBe(false);
  expect(valid("https://fcm.googleapis.com.evil.example/x")).toBe(false);
  expect(valid("http://fcm.googleapis.com/fcm/send/abc")).toBe(false);
});

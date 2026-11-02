import { createHmac } from "node:crypto";
import { describe, expect, test } from "vitest";
import { extractMessages, isValidSignature } from "@/lib/whatsapp/webhook";

function payload(messages: unknown[]) {
  return {
    object: "whatsapp_business_account",
    entry: [{ id: "1", changes: [{ field: "messages", value: { messaging_product: "whatsapp", messages } }] }],
  };
}

const text = (from: string, body: string) => ({ from, id: "wamid.1", type: "text", text: { body } });

describe("isValidSignature", () => {
  const body = JSON.stringify(payload([text("5583999991234", "ENTRAR K7F2Q")]));
  const signature = "sha256=" + createHmac("sha256", "secret").update(body).digest("hex");

  test("accepts the HMAC-SHA256 of the raw body", () => {
    expect(isValidSignature(body, signature, "secret")).toBe(true);
  });

  test("rejects another secret, a missing header or a tampered body", () => {
    expect(isValidSignature(body, signature, "other")).toBe(false);
    expect(isValidSignature(body, null, "secret")).toBe(false);
    expect(isValidSignature(body + " ", signature, "secret")).toBe(false);
    expect(isValidSignature(body, "sha256=abc", "secret")).toBe(false);
  });
});

describe("extractMessages", () => {
  test("returns sender and text of text messages", () => {
    expect(extractMessages(payload([text("5583999991234", "ENTRAR K7F2Q")]))).toEqual([
      { from: "5583999991234", text: "ENTRAR K7F2Q" },
    ]);
  });

  test("ignores non-text messages", () => {
    const image = { from: "5583999991234", id: "wamid.2", type: "image", image: { id: "x" } };
    expect(extractMessages(payload([image]))).toEqual([]);
  });

  test("returns nothing for payloads without messages", () => {
    expect(extractMessages({ foo: 1 })).toEqual([]);
    expect(extractMessages(null)).toEqual([]);
    expect(extractMessages(payload([]))).toEqual([]);
  });
});

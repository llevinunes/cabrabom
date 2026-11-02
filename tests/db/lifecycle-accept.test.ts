import { afterEach, beforeAll, expect, test } from "vitest";
import { acceptServiceRequest } from "@/lib/service-requests/lifecycle";
import { openServiceRequest } from "@/lib/service-requests/open";
import { JOAO_ID, JOAO_WHATSAPP, categoryId, cleanTestData, testClient } from "./helpers";

const db = testClient();
let electrician: number;

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
});

afterEach(() => cleanTestData(db));

async function openRequest() {
  const { token } = await openServiceRequest(db, {
    providerId: JOAO_ID,
    categoryId: electrician,
    clientName: "Maria",
    details: "Trocar a fiação",
    anonymousClient: "browser-1",
  });
  return token;
}

async function statusOf(token: string) {
  const { data } = await db.from("service_requests").select("status").eq("provider_token", token).single();
  return data!.status;
}

test("accepting an open request returns a new client token and marks it accepted", async () => {
  const token = await openRequest();
  const clientToken = await acceptServiceRequest(db, token, JOAO_WHATSAPP);
  expect(clientToken).toMatch(/^[A-Za-z0-9_-]{24}$/);
  const { data } = await db
    .from("service_requests")
    .select("status, client_token, accepted_at")
    .eq("provider_token", token)
    .single();
  expect(data).toMatchObject({ status: "accepted", client_token: clientToken });
  expect(data!.accepted_at).not.toBeNull();
});

test("accepting twice returns the same client token", async () => {
  const token = await openRequest();
  const first = await acceptServiceRequest(db, token, JOAO_WHATSAPP);
  expect(await acceptServiceRequest(db, token, JOAO_WHATSAPP)).toBe(first);
});

test("another phone cannot accept", async () => {
  const token = await openRequest();
  expect(await acceptServiceRequest(db, token, "5583999999999")).toBeNull();
  expect(await statusOf(token)).toBe("open");
});

test("an expired request cannot be accepted", async () => {
  const token = await openRequest();
  await db
    .from("service_requests")
    .update({ created_at: new Date(Date.now() - 49 * 3_600_000).toISOString() })
    .eq("provider_token", token);
  expect(await acceptServiceRequest(db, token, JOAO_WHATSAPP)).toBeNull();
  expect(await statusOf(token)).toBe("open");
});

test("a cancelled request cannot be accepted", async () => {
  const token = await openRequest();
  await db.from("service_requests").update({ status: "cancelled" }).eq("provider_token", token);
  expect(await acceptServiceRequest(db, token, JOAO_WHATSAPP)).toBeNull();
});

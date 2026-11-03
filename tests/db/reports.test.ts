import { afterEach, beforeAll, expect, test } from "vitest";
import { createReport } from "@/lib/reports/create";
import { acceptServiceRequest } from "@/lib/service-requests/lifecycle";
import { openServiceRequest } from "@/lib/service-requests/open";
import { JOAO_ID, JOAO_WHATSAPP, categoryId, cleanTestData, testClient } from "./helpers";

const db = testClient();
let electrician: number;

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
});

afterEach(() => cleanTestData(db));

async function acceptedRequest() {
  const { token } = await openServiceRequest(db, {
    providerId: JOAO_ID,
    categoryId: electrician,
    clientName: "Maria",
    details: "Trocar a fiação",
    anonymousClient: "browser-1",
  });
  const clientToken = (await acceptServiceRequest(db, token, JOAO_WHATSAPP))!;
  return { providerToken: token, clientToken };
}

async function reports() {
  const { data } = await db.from("reports").select("provider_id, service_request_id, description, resolved");
  return data!;
}

test("a report about a provider", async () => {
  expect(await createReport(db, { providerId: JOAO_ID, description: "Cobrou a mais" })).toBe(true);
  expect(await reports()).toEqual([
    { provider_id: JOAO_ID, service_request_id: null, description: "Cobrou a mais", resolved: false },
  ]);
});

test("a report from a service link records the request and its provider", async () => {
  const { clientToken, providerToken } = await acceptedRequest();
  expect(await createReport(db, { requestToken: clientToken, description: "Não apareceu" })).toBe(true);
  expect(await createReport(db, { requestToken: providerToken, description: "Cliente sumiu" })).toBe(true);
  const rows = await reports();
  expect(rows).toHaveLength(2);
  for (const row of rows) {
    expect(row.provider_id).toBe(JOAO_ID);
    expect(row.service_request_id).not.toBeNull();
  }
});

test("nothing valid to attach the report to is refused", async () => {
  expect(await createReport(db, { description: "?" })).toBe(false);
  expect(await createReport(db, { providerId: "not-a-uuid", description: "?" })).toBe(false);
  expect(await createReport(db, { requestToken: "x".repeat(24), description: "?" })).toBe(false);
  expect(await reports()).toEqual([]);
});

test("a description over 1000 characters is refused by the database", async () => {
  await expect(createReport(db, { providerId: JOAO_ID, description: "a".repeat(1001) })).rejects.toThrow();
});

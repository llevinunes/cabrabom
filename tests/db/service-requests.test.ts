import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { openServiceRequest } from "@/lib/service-requests/open";
import { CITY_CENTRE, JOAO_ID, categoryId, cleanTestData, testClient } from "./helpers";

const db = testClient();
let electrician: number;
let painter: number;

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
  painter = await categoryId(db, "pintor");
});

afterEach(() => cleanTestData(db));

const request = (overrides: object = {}) => ({
  providerId: JOAO_ID,
  categoryId: electrician,
  clientName: "Maria",
  details: "Trocar a fiação",
  anonymousClient: "browser-1",
  ...overrides,
});

describe("openServiceRequest", () => {
  test("creates an open request with a 24-character provider token", async () => {
    const { token } = await openServiceRequest(db, request());
    expect(token).toMatch(/^[A-Za-z0-9_-]{24}$/);
    const { data } = await db
      .from("service_requests")
      .select("status, client_name, details, distance_km, client_phone")
      .eq("provider_token", token)
      .single();
    expect(data).toEqual({ status: "open", client_name: "Maria", details: "Trocar a fiação", distance_km: null, client_phone: null });
  });

  test("stores only the rounded distance when the client's position is known", async () => {
    const { token } = await openServiceRequest(db, request(CITY_CENTRE));
    const { data } = await db.from("service_requests").select("distance_km").eq("provider_token", token).single();
    expect(Number(data!.distance_km)).toBe(1.2);
  });

  test("the same browser tapping again for the same provider reuses the open request", async () => {
    const first = await openServiceRequest(db, request());
    const second = await openServiceRequest(db, request({ details: "outro texto" }));
    expect(second.token).toBe(first.token);
    const other = await openServiceRequest(db, request({ anonymousClient: "browser-2" }));
    expect(other.token).not.toBe(first.token);
    const { count } = await db.from("service_requests").select("id", { count: "exact", head: true });
    expect(count).toBe(2);
  });

  test("an expired request is not reused", async () => {
    const first = await openServiceRequest(db, request());
    await db
      .from("service_requests")
      .update({ created_at: new Date(Date.now() - 49 * 3_600_000).toISOString() })
      .eq("provider_token", first.token);
    expect((await openServiceRequest(db, request())).token).not.toBe(first.token);
  });

  test("refuses a category the provider does not offer", async () => {
    await expect(openServiceRequest(db, request({ categoryId: painter }))).rejects.toThrow(/category/);
  });

  test("refuses a hidden provider", async () => {
    await db.from("providers").update({ hidden: true }).eq("id", JOAO_ID);
    await expect(openServiceRequest(db, request())).rejects.toThrow(/provider/);
  });
});

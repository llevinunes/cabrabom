import { afterEach, describe, expect, test } from "vitest";
import { providerDashboard, setBusy, updateProviderLocation } from "@/lib/providers/panel";
import { openServiceRequest } from "@/lib/service-requests/open";
import { pendingRequests, requestByToken } from "@/lib/service-requests/queries";
import { JOAO_ID, categoryId, cleanTestData, testClient } from "./helpers";

const db = testClient();

afterEach(() => cleanTestData(db));

async function openRequest(anonymousClient: string, clientName = "Maria") {
  return openServiceRequest(db, {
    providerId: JOAO_ID,
    categoryId: await categoryId(db, "eletricista"),
    clientName,
    details: "Trocar a fiação",
    anonymousClient,
    lat: -7.2307,
    lng: -35.8811,
  });
}

describe("pendingRequests", () => {
  test("lists open, unexpired requests, newest first", async () => {
    await openRequest("b1", "Maria");
    await openRequest("b2", "Pedro");
    const old = await openRequest("b3", "Antiga");
    await db
      .from("service_requests")
      .update({ created_at: new Date(Date.now() - 49 * 3_600_000).toISOString() })
      .eq("provider_token", old.token);

    const pending = await pendingRequests(db, JOAO_ID);
    expect(pending.map((p) => p.clientName)).toEqual(["Pedro", "Maria"]);
    expect(pending[0]).toEqual({
      token: expect.stringMatching(/^[A-Za-z0-9_-]{24}$/),
      clientName: "Pedro",
      category: "Eletricista",
      createdAt: expect.any(Date),
    });
  });
});

describe("requestByToken", () => {
  test("returns the request with its provider's phone", async () => {
    const { token } = await openRequest("b1");
    expect(await requestByToken(db, token)).toEqual({
      status: "open",
      createdAt: expect.any(Date),
      clientName: "Maria",
      details: "Trocar a fiação",
      distanceKm: 1.2,
      category: "Eletricista",
      providerId: JOAO_ID,
      providerWhatsapp: "5583900000001",
    });
  });

  test("returns null for unknown or malformed tokens", async () => {
    expect(await requestByToken(db, "x".repeat(24))).toBeNull();
    expect(await requestByToken(db, "'; drop table")).toBeNull();
  });
});

describe("panel actions", () => {
  test("setBusy changes the status and its timestamp", async () => {
    const before = await db.from("providers").select("busy_updated_at").eq("id", JOAO_ID).single();
    await new Promise((resolve) => setTimeout(resolve, 20));
    await setBusy(db, JOAO_ID, true);
    const after = await db.from("providers").select("busy, busy_updated_at").eq("id", JOAO_ID).single();
    expect(after.data!.busy).toBe(true);
    expect(new Date(after.data!.busy_updated_at).getTime()).toBeGreaterThan(
      new Date(before.data!.busy_updated_at).getTime(),
    );
  });

  test("providerDashboard summarizes the panel", async () => {
    expect(await providerDashboard(db, JOAO_ID)).toEqual({
      name: "João Silva",
      busy: false,
      neighborhood: "Centro",
      city: "Campina Grande",
      state: "PB",
      recommendationCount: 0,
      servicesCount: 0,
    });
  });

  test("updateProviderLocation stores the new place", async () => {
    await updateProviderLocation(db, JOAO_ID, { lat: -7.24, lng: -35.88, neighborhood: null, city: "Campina Grande", state: "PB" });
    const dashboard = await providerDashboard(db, JOAO_ID);
    expect(dashboard).toMatchObject({ neighborhood: null, city: "Campina Grande", state: "PB" });
  });
});

import { afterEach, describe, expect, test } from "vitest";
import { providerDashboard, setBusy, updateProviderLocation } from "@/lib/providers/panel";
import { openServiceRequest } from "@/lib/service-requests/open";
import { acceptServiceRequest, completeServiceRequest, confirmServiceRequest } from "@/lib/service-requests/lifecycle";
import {
  acceptedRequests,
  finishedAwaitingRecommendation,
  inProgressRequests,
  pendingRequests,
  requestByToken,
} from "@/lib/service-requests/queries";
import { JOAO_ID, JOAO_WHATSAPP, categoryId, cleanTestData, testClient } from "./helpers";

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
      clientToken: null,
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
      busyReminded: false,
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

describe("acceptedRequests", () => {
  test("lists only accepted requests of the provider, with the client token", async () => {
    const accepted = await openRequest("b1", "Maria");
    await openRequest("b2", "Pedro");
    const clientToken = await acceptServiceRequest(db, accepted.token, JOAO_WHATSAPP);
    expect(await acceptedRequests(db, JOAO_ID)).toEqual([
      expect.objectContaining({ providerToken: accepted.token, clientToken, clientName: "Maria", category: "Eletricista" }),
    ]);
  });
});

describe("services on the panel", () => {
  const CLIENT_PHONE = "5583988887777";

  async function confirmed(anonymousClient: string, clientName: string) {
    const { token } = await openRequest(anonymousClient, clientName);
    const clientToken = (await acceptServiceRequest(db, token, JOAO_WHATSAPP))!;
    await confirmServiceRequest(db, clientToken, CLIENT_PHONE);
    return { providerToken: token, clientToken };
  }

  test("inProgressRequests lists only services in progress, with details", async () => {
    const service = await confirmed("b1", "Maria");
    await openRequest("b2", "Pedro");
    expect(await inProgressRequests(db, JOAO_ID)).toEqual([
      {
        providerToken: service.providerToken,
        clientName: "Maria",
        category: "Eletricista",
        details: "Trocar a fiação",
        confirmedAt: expect.any(Date),
      },
    ]);
  });

  test("finishedAwaitingRecommendation lists services the provider finished", async () => {
    const byProvider = await confirmed("b1", "Maria");
    const byClient = await confirmed("b2", "Pedro");
    await completeServiceRequest(db, byProvider.providerToken, JOAO_WHATSAPP, "provider");
    await completeServiceRequest(db, byClient.clientToken, CLIENT_PHONE, "client");
    expect(await finishedAwaitingRecommendation(db, JOAO_ID)).toEqual([
      { clientToken: byProvider.clientToken, clientName: "Maria", completedAt: expect.any(Date) },
    ]);
  });
});

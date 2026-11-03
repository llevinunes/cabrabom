import { afterEach, beforeAll, describe, expect, test } from "vitest";
import {
  acceptServiceRequest,
  cancelServiceRequest,
  completeServiceRequest,
  confirmServiceRequest,
} from "@/lib/service-requests/lifecycle";
import { openServiceRequest } from "@/lib/service-requests/open";
import { JOAO_ID, JOAO_WHATSAPP, categoryId, cleanTestData, testClient } from "./helpers";

const db = testClient();
const CLIENT = "5583988887777";
let electrician: number;

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
});

afterEach(() => cleanTestData(db));

let browser = 0;
async function openRequest() {
  const { token } = await openServiceRequest(db, {
    providerId: JOAO_ID,
    categoryId: electrician,
    clientName: "Maria",
    details: "Trocar a fiação",
    anonymousClient: `browser-${++browser}`,
  });
  return token;
}

async function acceptedRequest() {
  const providerToken = await openRequest();
  const clientToken = (await acceptServiceRequest(db, providerToken, JOAO_WHATSAPP))!;
  return { providerToken, clientToken };
}

async function inProgressRequest() {
  const tokens = await acceptedRequest();
  await confirmServiceRequest(db, tokens.clientToken, CLIENT);
  return tokens;
}

async function requestRow(providerToken: string) {
  const { data } = await db
    .from("service_requests")
    .select("status, client_phone, client_confirmed_at, completed_at, completed_by, cancelled_at")
    .eq("provider_token", providerToken)
    .single();
  return data!;
}

async function joaoBusy() {
  const { data } = await db.from("providers").select("busy").eq("id", JOAO_ID).single();
  return data!.busy;
}

describe("confirmServiceRequest", () => {
  test("confirming makes the request in_progress, stores the phone and makes the provider busy", async () => {
    const { providerToken, clientToken } = await acceptedRequest();
    expect(await confirmServiceRequest(db, clientToken, CLIENT)).toBe("confirmed");
    expect(await requestRow(providerToken)).toMatchObject({ status: "in_progress", client_phone: CLIENT });
    expect((await requestRow(providerToken)).client_confirmed_at).not.toBeNull();
    expect(await joaoBusy()).toBe(true);
  });

  test("confirming again with the same phone is already_confirmed", async () => {
    const { clientToken } = await inProgressRequest();
    expect(await confirmServiceRequest(db, clientToken, CLIENT)).toBe("already_confirmed");
  });

  test("another phone after confirmation gets other_phone and changes nothing", async () => {
    const { providerToken, clientToken } = await inProgressRequest();
    expect(await confirmServiceRequest(db, clientToken, "5583977776666")).toBe("other_phone");
    expect((await requestRow(providerToken)).client_phone).toBe(CLIENT);
  });

  test("the provider's own phone cannot confirm", async () => {
    const { providerToken, clientToken } = await acceptedRequest();
    expect(await confirmServiceRequest(db, clientToken, JOAO_WHATSAPP)).toBe("provider_phone");
    expect(await requestRow(providerToken)).toMatchObject({ status: "accepted", client_phone: null });
    expect(await joaoBusy()).toBe(false);
  });

  test("an unknown token or a cancelled request is unavailable", async () => {
    expect(await confirmServiceRequest(db, "x".repeat(24), CLIENT)).toBe("unavailable");
    const { providerToken, clientToken } = await acceptedRequest();
    await cancelServiceRequest(db, providerToken, JOAO_WHATSAPP, "provider");
    expect(await confirmServiceRequest(db, clientToken, CLIENT)).toBe("unavailable");
  });
});

describe("completeServiceRequest", () => {
  test("provider completes: completed_by provider and the provider is free again", async () => {
    const { providerToken } = await inProgressRequest();
    expect(await completeServiceRequest(db, providerToken, JOAO_WHATSAPP, "provider")).toBe("completed");
    expect(await requestRow(providerToken)).toMatchObject({ status: "completed", completed_by: "provider" });
    expect(await joaoBusy()).toBe(false);
  });

  test("client completes with the confirming phone; another phone gets unavailable", async () => {
    const { providerToken, clientToken } = await inProgressRequest();
    expect(await completeServiceRequest(db, clientToken, "5583977776666", "client")).toBe("unavailable");
    expect(await completeServiceRequest(db, clientToken, CLIENT, "client")).toBe("completed");
    expect(await requestRow(providerToken)).toMatchObject({ status: "completed", completed_by: "client" });
  });

  test("completing twice is already_completed", async () => {
    const { providerToken, clientToken } = await inProgressRequest();
    await completeServiceRequest(db, clientToken, CLIENT, "client");
    expect(await completeServiceRequest(db, providerToken, JOAO_WHATSAPP, "provider")).toBe("already_completed");
    expect((await requestRow(providerToken)).completed_by).toBe("client");
  });

  test("with two requests in progress, completing one keeps the provider busy", async () => {
    const first = await inProgressRequest();
    await inProgressRequest();
    await completeServiceRequest(db, first.providerToken, JOAO_WHATSAPP, "provider");
    expect(await joaoBusy()).toBe(true);
  });

  test("an open request cannot be completed", async () => {
    const providerToken = await openRequest();
    expect(await completeServiceRequest(db, providerToken, JOAO_WHATSAPP, "provider")).toBe("unavailable");
    expect((await requestRow(providerToken)).status).toBe("open");
  });
});

describe("cancelServiceRequest", () => {
  test("provider cancels an open, an accepted and an in-progress request; in-progress frees the provider", async () => {
    const open = await openRequest();
    const { providerToken: accepted } = await acceptedRequest();
    const { providerToken: inProgress } = await inProgressRequest();
    for (const token of [open, accepted, inProgress]) {
      expect(await cancelServiceRequest(db, token, JOAO_WHATSAPP, "provider")).toBe("cancelled");
      expect((await requestRow(token)).status).toBe("cancelled");
    }
    expect(await joaoBusy()).toBe(false);
    expect(await cancelServiceRequest(db, open, JOAO_WHATSAPP, "provider")).toBe("already_cancelled");
  });

  test("client cannot cancel before confirming", async () => {
    const { providerToken, clientToken } = await acceptedRequest();
    expect(await cancelServiceRequest(db, clientToken, CLIENT, "client")).toBe("unavailable");
    expect((await requestRow(providerToken)).status).toBe("accepted");
  });

  test("client cancels a service in progress with the confirming phone", async () => {
    const { providerToken, clientToken } = await inProgressRequest();
    expect(await cancelServiceRequest(db, clientToken, CLIENT, "client")).toBe("cancelled");
    expect((await requestRow(providerToken)).status).toBe("cancelled");
    expect(await joaoBusy()).toBe(false);
  });

  test("a completed service cannot be cancelled", async () => {
    const { providerToken } = await inProgressRequest();
    await completeServiceRequest(db, providerToken, JOAO_WHATSAPP, "provider");
    expect(await cancelServiceRequest(db, providerToken, JOAO_WHATSAPP, "provider")).toBe("unavailable");
  });
});

describe("concurrency", () => {
  test("two services ending at the same time leave the provider free", async () => {
    for (let round = 0; round < 8; round++) {
      const a = await inProgressRequest();
      const b = await inProgressRequest();
      await Promise.all([
        completeServiceRequest(db, a.clientToken, CLIENT, "client"),
        completeServiceRequest(db, b.providerToken, JOAO_WHATSAPP, "provider"),
      ]);
      expect(await joaoBusy()).toBe(false);
    }
  });
});

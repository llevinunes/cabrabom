import { afterEach, beforeAll, expect, test } from "vitest";
import { createRecommendation, hasRecommended } from "@/lib/recommendations/create";
import { recommendationSummary } from "@/lib/recommendations/summary";
import {
  acceptServiceRequest,
  completeServiceRequest,
  confirmServiceRequest,
} from "@/lib/service-requests/lifecycle";
import { openServiceRequest } from "@/lib/service-requests/open";
import { JOAO_ID, JOAO_WHATSAPP, categoryId, cleanTestData, createProviderNorth, testClient } from "./helpers";

const db = testClient();
const CLIENT = "5583988887777";
const ANSWER = { highlights: ["Pontual"], comment: "Muito bom" };
let electrician: number;

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
});

afterEach(() => cleanTestData(db));

let browser = 0;
/** A service João finished; the client confirmed `confirmedMinutesAgo` minutes ago. */
async function finishedService(opts: { providerId?: string; providerPhone?: string; confirmedMinutesAgo?: number; complete?: boolean } = {}) {
  const providerId = opts.providerId ?? JOAO_ID;
  const providerPhone = opts.providerPhone ?? JOAO_WHATSAPP;
  const { token } = await openServiceRequest(db, {
    providerId,
    categoryId: electrician,
    clientName: "Maria José",
    details: "Trocar a fiação",
    anonymousClient: `browser-${++browser}`,
  });
  const clientToken = (await acceptServiceRequest(db, token, providerPhone))!;
  await confirmServiceRequest(db, clientToken, CLIENT);
  const confirmedAt = new Date(Date.now() - (opts.confirmedMinutesAgo ?? 120) * 60_000).toISOString();
  await db.from("service_requests").update({ client_confirmed_at: confirmedAt }).eq("client_token", clientToken);
  if (opts.complete ?? true) await completeServiceRequest(db, clientToken, CLIENT, "client");
  return clientToken;
}

test("publishes and marks the request recommended", async () => {
  const clientToken = await finishedService();
  expect(await createRecommendation(db, clientToken, CLIENT, ANSWER)).toBe("published");
  const { data: request } = await db.from("service_requests").select("status").eq("client_token", clientToken).single();
  expect(request!.status).toBe("recommended");
  const { data } = await db.from("recommendations").select("client_name, client_phone, highlights, comment, flagged").single();
  expect(data).toEqual({ client_name: "Maria José", client_phone: CLIENT, highlights: ["Pontual"], comment: "Muito bom", flagged: false });
});

test("too_soon before one hour after confirmation", async () => {
  const clientToken = await finishedService({ confirmedMinutesAgo: 30 });
  expect(await createRecommendation(db, clientToken, CLIENT, ANSWER)).toBe("too_soon");
});

test("not_completed while in progress", async () => {
  const clientToken = await finishedService({ complete: false });
  expect(await createRecommendation(db, clientToken, CLIENT, ANSWER)).toBe("not_completed");
});

test("not_yours for another phone", async () => {
  const clientToken = await finishedService();
  expect(await createRecommendation(db, clientToken, "5583977776666", ANSWER)).toBe("not_yours");
});

test("own_provider when the provider's phone recommends", async () => {
  const clientToken = await finishedService();
  await db.from("service_requests").update({ client_phone: JOAO_WHATSAPP }).eq("client_token", clientToken);
  expect(await createRecommendation(db, clientToken, JOAO_WHATSAPP, ANSWER)).toBe("own_provider");
});

test("already_recommended for a second request with the same client phone", async () => {
  const first = await finishedService();
  const second = await finishedService();
  expect(await createRecommendation(db, first, CLIENT, ANSWER)).toBe("published");
  expect(await createRecommendation(db, first, CLIENT, ANSWER)).toBe("already_recommended");
  expect(await createRecommendation(db, second, CLIENT, ANSWER)).toBe("already_recommended");
});

test("flags a phone that recommended 3 other providers in the last 7 days", async () => {
  const pedreiro = await categoryId(db, "eletricista");
  for (let n = 1; n <= 3; n++) {
    const phone = `558390000010${n}`;
    const id = await createProviderNorth(db, { name: `Outro ${n}`, whatsapp: phone, km: n, categoryIds: [pedreiro] });
    const token = await finishedService({ providerId: id, providerPhone: phone });
    expect(await createRecommendation(db, token, CLIENT, ANSWER)).toBe("published");
  }
  const clientToken = await finishedService();
  expect(await createRecommendation(db, clientToken, CLIENT, ANSWER)).toBe("published");
  const { data } = await db.from("recommendations").select("flagged").eq("provider_id", JOAO_ID).single();
  expect(data!.flagged).toBe(true);
});

test("recommendationSummary counts highlights and lists comments, only visible ones", async () => {
  const phones = ["5583911110001", "5583911110002", "5583911110003"];
  const answers = [
    { highlights: ["Caprichoso", "Pontual"], comment: "Ótimo serviço" },
    { highlights: ["Pontual"], comment: null },
    { highlights: ["Educado"], comment: "Escondido" },
  ];
  for (let i = 0; i < 3; i++) {
    const token = await finishedService();
    await db.from("service_requests").update({ client_phone: phones[i] }).eq("client_token", token);
    expect(await createRecommendation(db, token, phones[i], answers[i])).toBe("published");
  }
  await db.from("recommendations").update({ visible: false }).eq("client_phone", phones[2]);

  expect(await recommendationSummary(db, JOAO_ID)).toEqual({
    count: 2,
    highlights: [
      { name: "Pontual", count: 2 },
      { name: "Caprichoso", count: 1 },
    ],
    comments: [{ firstName: "Maria", comment: "Ótimo serviço", createdAt: expect.any(Date) }],
  });
});

test("two different services of the same client submitted together: one published, no error", async () => {
  for (let round = 0; round < 10; round++) {
    await db.from("recommendations").delete().eq("client_phone", CLIENT);
    const first = await finishedService();
    const second = await finishedService();
    const results = await Promise.all([
      createRecommendation(db, first, CLIENT, ANSWER),
      createRecommendation(db, second, CLIENT, ANSWER),
    ]);
    expect(results.sort()).toEqual(["already_recommended", "published"]);
  }
});

test("hasRecommended tells whether this phone already recommended the provider", async () => {
  const token = await finishedService();
  expect(await hasRecommended(db, JOAO_ID, CLIENT)).toBe(false);
  await createRecommendation(db, token, CLIENT, ANSWER);
  expect(await hasRecommended(db, JOAO_ID, CLIENT)).toBe(true);
});

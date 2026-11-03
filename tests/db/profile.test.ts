import { afterEach, expect, test } from "vitest";
import { publicProfile } from "@/lib/providers/profile";
import { JOAO_ID, cleanTestData, testClient } from "./helpers";

const db = testClient();

afterEach(() => cleanTestData(db));

test("publicProfile returns what the profile page shows, never the location", async () => {
  const profile = await publicProfile(db, JOAO_ID);
  expect(profile).toEqual({
    id: JOAO_ID,
    name: "João Silva",
    neighborhood: "Centro",
    city: "Campina Grande",
    state: "PB",
    busy: false,
    yearsExperience: 8,
    bio: null,
    whatsapp: "5583900000001",
    categories: [
      { id: expect.any(Number), name: "Eletricista", slug: "eletricista" },
      { id: expect.any(Number), name: "Encanador", slug: "encanador" },
    ],
    recommendationCount: 0,
    servicesCount: 0,
  });
});

test("hidden or unknown providers have no profile", async () => {
  expect(await publicProfile(db, "00000000-0000-4000-8000-000000000099")).toBeNull();
  expect(await publicProfile(db, "not-a-uuid")).toBeNull();
  await db.from("providers").update({ hidden: true }).eq("id", JOAO_ID);
  expect(await publicProfile(db, JOAO_ID)).toBeNull();
});

import { expect, test } from "vitest";
import { searchProviders } from "@/lib/search/search";
import { CITY_CENTRE, categoryId, testClient } from "./helpers";

const db = testClient();

test("searchProviders maps the RPC rows to camelCase numbers", async () => {
  const results = await searchProviders(db, {
    ...CITY_CENTRE,
    radiusKm: 10,
    categoryId: await categoryId(db, "eletricista"),
  });
  expect(results.map((r) => r.name)).toEqual(["João Silva", "Antônio Ferreira", "Raimundo Costa"]);
  expect(results[0]).toEqual({
    id: "00000000-0000-4000-8000-000000000001",
    name: "João Silva",
    neighborhood: "Centro",
    city: "Campina Grande",
    state: "PB",
    busy: false,
    distanceKm: 1.2,
    categories: ["Eletricista", "Encanador"],
    recommendationCount: 0,
  });
});

import { afterEach, beforeAll, describe, expect, test } from "vitest";
import { CITY_CENTRE, JOAO_ID, JOAO_WHATSAPP, categoryId, cleanTestData, testClient } from "./helpers";

const db = testClient();
let electrician: number;
let painter: number;

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
  painter = await categoryId(db, "pintor");
});

afterEach(() => cleanTestData(db));

function search(radiusKm: number, categoryIdValue = electrician) {
  return db.rpc("search_providers", {
    p_lat: CITY_CENTRE.lat,
    p_lng: CITY_CENTRE.lng,
    p_radius_km: radiusKm,
    p_category_id: categoryIdValue,
  });
}

describe("search_providers", () => {
  test("lists free providers first, then by distance", async () => {
    const { data, error } = await search(10);
    expect(error).toBeNull();
    expect(data!.map((p) => p.name)).toEqual(["João Silva", "Antônio Ferreira", "Raimundo Costa"]);
  });

  test("returns neighborhood, rounded distance, all categories and recommendation count", async () => {
    const { data } = await search(10);
    const joao = data!.find((p) => p.id === JOAO_ID)!;
    expect(joao.neighborhood).toBe("Centro");
    expect(Number(joao.distance_km)).toBeCloseTo(1.2, 0);
    expect(joao.categories.sort()).toEqual(["Eletricista", "Encanador"]);
    expect(Number(joao.recommendation_count)).toBe(0);
    expect(joao.busy).toBe(false);
  });

  test("respects the radius", async () => {
    const { data } = await search(2);
    expect(data!.map((p) => p.name)).toEqual(["João Silva"]);
  });

  test("caps the radius at 100 km", async () => {
    const { data } = await search(500);
    expect(data).toHaveLength(3);
  });

  test("returns nothing for a category nobody offers", async () => {
    const { data } = await search(10, painter);
    expect(data).toEqual([]);
  });

  test("hides providers flagged as hidden", async () => {
    await db.from("providers").update({ hidden: true }).eq("id", JOAO_ID);
    const { data } = await search(10);
    expect(data!.map((p) => p.name)).not.toContain("João Silva");
  });
});

describe("distance_to_provider", () => {
  test("returns the distance in km with one decimal place", async () => {
    const { data, error } = await db.rpc("distance_to_provider", {
      p_provider_id: JOAO_ID,
      p_lat: CITY_CENTRE.lat,
      p_lng: CITY_CENTRE.lng,
    });
    expect(error).toBeNull();
    expect(Number(data)).toBeCloseTo(1.2, 0);
  });
});

describe("create_provider", () => {
  const input = {
    p_name: "Pedro Teste",
    p_whatsapp: "5583988887777",
    p_lat: -7.22,
    p_lng: -35.9,
    p_neighborhood: "Catolé",
    p_city: "Campina Grande",
  };

  test("creates the provider with categories and consent timestamp", async () => {
    const plumber = await categoryId(db, "encanador");
    const { data: id, error } = await db.rpc("create_provider", { ...input, p_category_ids: [plumber] });
    expect(error).toBeNull();
    const { data: provider } = await db
      .from("providers")
      .select("name, neighborhood, city, whatsapp_consent_at, provider_categories(category_id)")
      .eq("id", id!)
      .single();
    expect(provider!.name).toBe("Pedro Teste");
    expect(provider!.neighborhood).toBe("Catolé");
    expect(provider!.whatsapp_consent_at).not.toBeNull();
    expect(provider!.provider_categories).toEqual([{ category_id: plumber }]);
  });

  test("returns the existing id when the WhatsApp number is already registered", async () => {
    const { data: id } = await db.rpc("create_provider", {
      ...input,
      p_whatsapp: JOAO_WHATSAPP,
      p_name: "Outro Nome",
      p_category_ids: [electrician],
    });
    expect(id).toBe(JOAO_ID);
    const { data: joao } = await db.from("providers").select("name").eq("id", JOAO_ID).single();
    expect(joao!.name).toBe("João Silva");
  });
});

describe("set_provider_location", () => {
  test("updates the point, neighborhood and city", async () => {
    const { error } = await db.rpc("set_provider_location", {
      p_provider_id: JOAO_ID,
      p_lat: CITY_CENTRE.lat,
      p_lng: CITY_CENTRE.lng,
      p_neighborhood: "Prata",
      p_city: "Campina Grande",
    });
    expect(error).toBeNull();
    const { data: distance } = await db.rpc("distance_to_provider", {
      p_provider_id: JOAO_ID,
      p_lat: CITY_CENTRE.lat,
      p_lng: CITY_CENTRE.lng,
    });
    expect(Number(distance)).toBe(0);
    // restore the seed location
    await db.rpc("set_provider_location", {
      p_provider_id: JOAO_ID,
      p_lat: -7.2199,
      p_lng: -35.8811,
      p_neighborhood: "Centro",
      p_city: "Campina Grande",
    });
  });
});

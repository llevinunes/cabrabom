import { afterEach, beforeAll, describe, expect, test } from "vitest";
import {
  CITY_CENTRE,
  JOAO_ID,
  JOAO_WHATSAPP,
  categoryId,
  cleanTestData,
  createProviderNorth,
  testClient,
} from "./helpers";

const db = testClient();
let electrician: number;
let plumber: number;
let painter: number;

beforeAll(async () => {
  electrician = await categoryId(db, "eletricista");
  plumber = await categoryId(db, "encanador");
  painter = await categoryId(db, "pintor");
  await cleanTestData(db);
});

afterEach(() => cleanTestData(db));

async function search(radiusKm: number, categoryIdValue = electrician) {
  const { data, error } = await db.rpc("search_providers", {
    p_lat: CITY_CENTRE.lat,
    p_lng: CITY_CENTRE.lng,
    p_radius_km: radiusKm,
    p_category_id: categoryIdValue,
  });
  if (error) throw error;
  return data;
}

const names = (rows: { name: string }[]) => rows.map((r) => r.name);

describe("search_providers", () => {
  test("lists free providers first, even when a busy one is closer", async () => {
    await createProviderNorth(db, {
      name: "Ocupado Perto",
      whatsapp: "5583911110001",
      km: 0.5,
      categoryIds: [electrician],
      busy: true,
    });
    expect(names(await search(10))).toEqual(["João Silva", "Antônio Ferreira", "Ocupado Perto", "Raimundo Costa"]);
  });

  test("breaks distance ties by recommendation count", async () => {
    const plain = await createProviderNorth(db, {
      name: "Sem Recomendação",
      whatsapp: "5583911110002",
      km: 5,
      categoryIds: [electrician],
    });
    const recommended = await createProviderNorth(db, {
      name: "Recomendado",
      whatsapp: "5583911110003",
      km: 5,
      categoryIds: [electrician],
    });
    const { data: request, error } = await db
      .from("service_requests")
      .insert({
        provider_id: recommended,
        category_id: electrician,
        client_name: "Maria",
        details: "teste",
        provider_token: "token-desempate-000000",
        status: "recommended",
      })
      .select("id")
      .single();
    if (error) throw error;
    const rec = await db.from("recommendations").insert({
      provider_id: recommended,
      service_request_id: request.id,
      client_name: "Maria",
      client_phone: "5583922220000",
    });
    if (rec.error) throw rec.error;

    const order = names(await search(10));
    expect(order.indexOf("Recomendado")).toBeLessThan(order.indexOf("Sem Recomendação"));
    expect(plain).toBeDefined();
  });

  test("returns neighborhood, rounded distance, all categories and recommendation count", async () => {
    const joao = (await search(10)).find((p) => p.id === JOAO_ID)!;
    expect(joao.neighborhood).toBe("Centro");
    expect(Number(joao.distance_km)).toBe(1.2);
    expect(joao.categories).toEqual(["Eletricista", "Encanador"]);
    expect(Number(joao.recommendation_count)).toBe(0);
    expect(joao.busy).toBe(false);
  });

  test("respects the radius", async () => {
    expect(names(await search(2))).toEqual(["João Silva"]);
  });

  test("caps the radius at 100 km", async () => {
    await createProviderNorth(db, { name: "Longe", whatsapp: "5583911110004", km: 150, categoryIds: [electrician] });
    expect(names(await search(500))).not.toContain("Longe");
  });

  test("raises a radius below 1 km to 1 km", async () => {
    await createProviderNorth(db, { name: "Vizinho", whatsapp: "5583911110005", km: 0.5, categoryIds: [electrician] });
    expect(names(await search(0))).toEqual(["Vizinho"]);
  });

  test("returns nothing for a category nobody offers", async () => {
    expect(await search(10, painter)).toEqual([]);
  });

  test("returns nothing for a deactivated category", async () => {
    await db.from("categories").update({ active: false }).eq("id", electrician);
    expect(await search(10)).toEqual([]);
  });

  test("hides providers flagged as hidden", async () => {
    await db.from("providers").update({ hidden: true }).eq("id", JOAO_ID);
    expect(names(await search(10))).not.toContain("João Silva");
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
    expect(Number(data)).toBe(1.2);
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

  test("ignores repeated category ids", async () => {
    const { data: id, error } = await db.rpc("create_provider", { ...input, p_category_ids: [plumber, plumber] });
    expect(error).toBeNull();
    const { data } = await db.from("provider_categories").select("category_id").eq("provider_id", id!);
    expect(data).toEqual([{ category_id: plumber }]);
  });

  test("rejects an empty category list", async () => {
    const { error } = await db.rpc("create_provider", { ...input, p_category_ids: [] });
    expect(error?.message).toMatch(/categor/i);
  });

  test("rejects coordinates out of range", async () => {
    const { error } = await db.rpc("create_provider", { ...input, p_lat: -95, p_category_ids: [plumber] });
    expect(error?.message).toMatch(/coordinates/i);
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
    // stored rounded to 2 decimals (ADR 0034)
    const { data: distance } = await db.rpc("distance_to_provider", {
      p_provider_id: JOAO_ID,
      p_lat: -7.23,
      p_lng: -35.88,
    });
    expect(Number(distance)).toBe(0);
  });

  test("rejects coordinates out of range", async () => {
    const { error } = await db.rpc("set_provider_location", {
      p_provider_id: JOAO_ID,
      p_lat: 10,
      p_lng: 200,
      p_neighborhood: "Centro",
      p_city: "Campina Grande",
    });
    expect(error?.message).toMatch(/coordinates/i);
  });
});

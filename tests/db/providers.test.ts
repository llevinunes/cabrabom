import { afterEach, expect, test } from "vitest";
import { activeCategoryIds, categoryBySlug, listCategories } from "@/lib/categories";
import { createProvider, providerByPhone } from "@/lib/providers/queries";
import { JOAO_ID, JOAO_WHATSAPP, cleanTestData, testClient } from "./helpers";

const db = testClient();

afterEach(() => cleanTestData(db));

test("listCategories returns the active categories in seed order", async () => {
  const categories = await listCategories(db);
  expect(categories.map((c) => c.name)).toEqual([
    "Eletricista",
    "Encanador",
    "Pedreiro",
    "Pintor",
    "Diarista",
    "Jardineiro",
    "Montador de móveis",
  ]);
  await db.from("categories").update({ active: false }).eq("slug", "pintor");
  expect((await listCategories(db)).map((c) => c.slug)).not.toContain("pintor");
});

test("categoryBySlug finds active categories only", async () => {
  expect((await categoryBySlug(db, "encanador"))?.name).toBe("Encanador");
  expect(await categoryBySlug(db, "astronauta")).toBeNull();
});

test("activeCategoryIds keeps only ids of active categories", async () => {
  const plumber = (await categoryBySlug(db, "encanador"))!.id;
  expect(await activeCategoryIds(db, [plumber, 9999])).toEqual([plumber]);
});

test("createProvider stores the provider with the session phone", async () => {
  const plumber = (await categoryBySlug(db, "encanador"))!.id;
  const { id } = await createProvider(
    db,
    { name: "Pedro Teste", categoryIds: [plumber], place: { lat: -7.22, lng: -35.9, neighborhood: "Catolé", city: "Campina Grande" } },
    "5583988887777",
  );
  expect(await providerByPhone(db, "5583988887777")).toEqual({ id, name: "Pedro Teste" });
});

test("providerByPhone finds seeded providers and nothing else", async () => {
  expect(await providerByPhone(db, JOAO_WHATSAPP)).toEqual({ id: JOAO_ID, name: "João Silva" });
  expect(await providerByPhone(db, "5583977776666")).toBeNull();
});

test("createProvider accepts a place without neighborhood or city", async () => {
  const plumber = (await categoryBySlug(db, "encanador"))!.id;
  const { id } = await createProvider(
    db,
    { name: "Sem Bairro", categoryIds: [plumber], place: { lat: -7.22, lng: -35.9, neighborhood: null, city: null } },
    "5583966665555",
  );
  const { data } = await db.from("providers").select("neighborhood, city").eq("id", id).single();
  expect(data).toEqual({ neighborhood: null, city: null });
});

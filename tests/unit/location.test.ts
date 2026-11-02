import { describe, expect, test } from "vitest";
import { lookupCep } from "@/lib/location/cep";
import { placeFromCoordinates } from "@/lib/location/reverse";
import { resolveLocation } from "@/lib/location/resolve";

type Routes = Record<string, { status?: number; body: unknown } | Error>;

/** Fake fetch that answers by URL prefix and records the calls. */
function fakeFetch(routes: Routes) {
  const calls: string[] = [];
  const fetcher = (async (input: string | URL) => {
    const url = String(input);
    calls.push(url);
    const key = Object.keys(routes).find((prefix) => url.startsWith(prefix));
    const answer = key ? routes[key] : { status: 404, body: {} };
    if (answer instanceof Error) throw answer;
    return new Response(JSON.stringify(answer.body), { status: answer.status ?? 200 });
  }) as typeof fetch;
  return { fetcher, calls };
}

const BRASIL_API = "https://brasilapi.com.br/api/cep/v2/58400000";
const NOMINATIM_SEARCH = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_REVERSE = "https://nominatim.openstreetmap.org/reverse";

const brasilApiBody = (coordinates: object) => ({
  cep: "58400000",
  city: "Campina Grande",
  neighborhood: "Centro",
  location: { type: "Point", coordinates },
});

describe("lookupCep", () => {
  test("uses BrasilAPI coordinates, neighborhood and city", async () => {
    const { fetcher } = fakeFetch({
      [BRASIL_API]: { body: brasilApiBody({ latitude: "-7.23", longitude: "-35.88" }) },
    });
    expect(await lookupCep("58400-000", fetcher)).toEqual({
      lat: -7.23,
      lng: -35.88,
      neighborhood: "Centro",
      city: "Campina Grande",
    });
  });

  test("falls back to Nominatim when BrasilAPI has no coordinates", async () => {
    const { fetcher, calls } = fakeFetch({
      [BRASIL_API]: { body: brasilApiBody({}) },
      [NOMINATIM_SEARCH]: { body: [{ lat: "-7.22", lon: "-35.9" }] },
    });
    expect(await lookupCep("58400000", fetcher)).toEqual({
      lat: -7.22,
      lng: -35.9,
      neighborhood: "Centro",
      city: "Campina Grande",
    });
    expect(calls[1]).toContain("postalcode=58400-000");
  });

  test("returns null when nobody knows the CEP", async () => {
    const { fetcher } = fakeFetch({ [BRASIL_API]: { status: 404, body: {} }, [NOMINATIM_SEARCH]: { body: [] } });
    expect(await lookupCep("58400000", fetcher)).toBeNull();
  });

  test("returns null on network errors", async () => {
    const { fetcher } = fakeFetch({ [BRASIL_API]: new Error("offline"), [NOMINATIM_SEARCH]: new Error("offline") });
    expect(await lookupCep("58400000", fetcher)).toBeNull();
  });

  test("does not call the network for a malformed CEP", async () => {
    const { fetcher, calls } = fakeFetch({});
    expect(await lookupCep("123", fetcher)).toBeNull();
    expect(calls).toEqual([]);
  });
});

describe("lookupCep limits", () => {
  test("gives up on a slow service instead of waiting forever", async () => {
    const signals: (AbortSignal | null | undefined)[] = [];
    const fetcher = (async (_url: string, init?: RequestInit) => {
      signals.push(init?.signal);
      return new Response("{}", { status: 404 });
    }) as typeof fetch;
    await lookupCep("58400000", fetcher);
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.every((signal) => signal instanceof AbortSignal)).toBe(true);
  });

  test("ignores Nominatim answers without numbers", async () => {
    const { fetcher } = fakeFetch({
      [BRASIL_API]: { body: brasilApiBody({}) },
      [NOMINATIM_SEARCH]: { body: [{ lat: "", lon: "x" }] },
    });
    expect(await lookupCep("58400000", fetcher)).toBeNull();
  });
});

describe("placeFromCoordinates", () => {
  test("reads neighborhood and city from Nominatim", async () => {
    const { fetcher } = fakeFetch({
      [NOMINATIM_REVERSE]: { body: { address: { suburb: "Catolé", city: "Campina Grande" } } },
    });
    expect(await placeFromCoordinates(-7.24, -35.89, fetcher)).toEqual({
      lat: -7.24,
      lng: -35.89,
      neighborhood: "Catolé",
      city: "Campina Grande",
    });
  });

  test("keeps the coordinates when Nominatim fails", async () => {
    const { fetcher } = fakeFetch({ [NOMINATIM_REVERSE]: new Error("offline") });
    expect(await placeFromCoordinates(-7.24, -35.89, fetcher)).toEqual({
      lat: -7.24,
      lng: -35.89,
      neighborhood: null,
      city: null,
    });
  });
});

describe("resolveLocation", () => {
  test("rejects a CEP that resolves outside Brazil", async () => {
    const { fetcher } = fakeFetch({ [BRASIL_API]: { body: brasilApiBody({ latitude: "40.7", longitude: "-74.0" }) } });
    expect(await resolveLocation({ kind: "cep", cep: "58400000" }, fetcher)).toBeNull();
  });

  test("rejects GPS points outside Brazil, such as swapped latitude and longitude", async () => {
    const { fetcher, calls } = fakeFetch({});
    expect(await resolveLocation({ kind: "gps", lat: -35.88, lng: -7.23 }, fetcher)).toBeNull();
    expect(calls).toEqual([]);
  });

  test("resolves a GPS point in Brazil", async () => {
    const { fetcher } = fakeFetch({ [NOMINATIM_REVERSE]: { body: { address: { neighbourhood: "Prata", town: "Campina Grande" } } } });
    expect(await resolveLocation({ kind: "gps", lat: -7.22, lng: -35.9 }, fetcher)).toEqual({
      lat: -7.22,
      lng: -35.9,
      neighborhood: "Prata",
      city: "Campina Grande",
    });
  });
});

import { describe, expect, test } from "vitest";
import { DEFAULT_RADIUS_KM, normalizeRadius, readSearchParams, toQuery } from "@/lib/search/params";

describe("normalizeRadius", () => {
  test("defaults to 10 km and stays within 1–100 km", () => {
    expect(DEFAULT_RADIUS_KM).toBe(10);
    expect(normalizeRadius("500")).toBe(100);
    expect(normalizeRadius("0")).toBe(1);
    expect(normalizeRadius("-3")).toBe(1);
    expect(normalizeRadius("25")).toBe(25);
    expect(normalizeRadius("12.7")).toBe(13);
    expect(normalizeRadius("abc")).toBe(10);
    expect(normalizeRadius(undefined)).toBe(10);
    expect(normalizeRadius("")).toBe(10);
    expect(normalizeRadius(" ")).toBe(10);
    expect(normalizeRadius(["30", "40"])).toBe(30);
  });
});

describe("readSearchParams", () => {
  const complete = { nome: "Maria", categoria: "eletricista", detalhes: "Trocar a fiação", lat: "-7.2", lng: "-35.8", raio: "10" };

  test("reads a complete search from the URL", () => {
    expect(readSearchParams(complete)).toEqual({
      name: "Maria",
      category: "eletricista",
      details: "Trocar a fiação",
      lat: -7.2,
      lng: -35.8,
      radiusKm: 10,
    });
  });

  test("fixes a tampered radius", () => {
    expect(readSearchParams({ ...complete, raio: "abc" })?.radiusKm).toBe(10);
    expect(readSearchParams({ ...complete, raio: "999" })?.radiusKm).toBe(100);
  });

  test("returns null when something essential is missing or invalid", () => {
    expect(readSearchParams({ ...complete, lat: undefined })).toBeNull();
    expect(readSearchParams({ ...complete, lat: "200" })).toBeNull();
    expect(readSearchParams({ ...complete, lng: "x" })).toBeNull();
    expect(readSearchParams({ ...complete, nome: "  " })).toBeNull();
    expect(readSearchParams({ ...complete, categoria: "" })).toBeNull();
    expect(readSearchParams({ ...complete, detalhes: undefined })).toBeNull();
  });

  test("rounds the client's coordinates to about 100 m", () => {
    const params = readSearchParams({ ...complete, lat: "-7.2307123456", lng: "-35.8811987654" })!;
    expect(params.lat).toBe(-7.231);
    expect(params.lng).toBe(-35.881);
    expect(toQuery(params)).toContain("lat=-7.231&lng=-35.881");
  });

  test("rejects texts longer than the form allows", () => {
    expect(readSearchParams({ ...complete, nome: "x".repeat(61) })).toBeNull();
    expect(readSearchParams({ ...complete, detalhes: "x".repeat(501) })).toBeNull();
  });

  test("toQuery round-trips", () => {
    const params = readSearchParams(complete)!;
    expect(readSearchParams(Object.fromEntries(new URLSearchParams(toQuery(params))))).toEqual(params);
  });
});

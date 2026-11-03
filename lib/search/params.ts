import { isInBrazil } from "@/lib/location/resolve";
import { searchTextSchema } from "./form";

export const DEFAULT_RADIUS_KM = 10;
export const MAX_RADIUS_KM = 100;

type Raw = string | string[] | undefined;

/** A search as carried in the URL of /resultados and /p/[id] (spec 3.1). */
export type SearchParams = {
  name: string;
  category: string; // slug
  details: string;
  lat: number;
  lng: number;
  radiusKm: number;
};

const first = (value: Raw) => (Array.isArray(value) ? value[0] : value);

/** Whole km between 1 and 100; anything else becomes the 10 km default. */
export function normalizeRadius(value: Raw): number {
  const text = first(value)?.trim();
  const number = Number(text);
  if (!text || !Number.isFinite(number)) return DEFAULT_RADIUS_KM;
  return Math.min(MAX_RADIUS_KM, Math.max(1, Math.round(number)));
}

/** URL parameters are in Portuguese, like the routes: nome, categoria, detalhes, lat, lng, raio. */
export function readSearchParams(params: Record<string, Raw>): SearchParams | null {
  const texts = searchTextSchema.safeParse({
    name: first(params.nome) ?? "",
    category: first(params.categoria) ?? "",
    details: first(params.detalhes) ?? "",
  });
  const lat = toCoordinate(first(params.lat), 90);
  const lng = toCoordinate(first(params.lng), 180);
  if (!texts.success || lat === null || lng === null) return null;
  return { ...texts.data, lat, lng, radiusKm: normalizeRadius(params.raio) };
}

/**
 * The client's position travels in the URL (logs, history), so it is kept to
 * 3 decimal places (~110 m). Distances are shown to 0.1 km anyway.
 */
export function roundCoordinate(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function toQuery(params: SearchParams): string {
  return new URLSearchParams({
    nome: params.name,
    categoria: params.category,
    detalhes: params.details,
    lat: String(roundCoordinate(params.lat)),
    lng: String(roundCoordinate(params.lng)),
    raio: String(params.radiusKm),
  }).toString();
}

function toCoordinate(value: string | undefined, limit: number): number | null {
  if (!value?.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? roundCoordinate(number) : null;
}

export type SearchDefaults = {
  name: string;
  category: string;
  details: string;
  radiusKm: number;
  position: { lat: number; lng: number } | null;
};

/**
 * Prefills the search form (screen 01) from a URL such as the one "Voltar" builds on
 * /resultados. Lenient: keeps whatever is usable, trimmed to the form's limits.
 */
export function readSearchDefaults(params: Record<string, Raw>): SearchDefaults {
  const lat = toCoordinate(first(params.lat), 90);
  const lng = toCoordinate(first(params.lng), 180);
  return {
    name: (first(params.nome) ?? "").slice(0, 60),
    category: (first(params.categoria) ?? "").slice(0, 60),
    details: (first(params.detalhes) ?? "").slice(0, 500),
    radiusKm: normalizeRadius(params.raio),
    position: lat !== null && lng !== null && isInBrazil(lat, lng) ? { lat, lng } : null,
  };
}

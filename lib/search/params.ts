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
  const name = first(params.nome)?.trim();
  const category = first(params.categoria)?.trim();
  const details = first(params.detalhes)?.trim();
  const lat = toCoordinate(first(params.lat), 90);
  const lng = toCoordinate(first(params.lng), 180);
  if (!name || !category || !details || lat === null || lng === null) return null;
  return { name, category, details, lat, lng, radiusKm: normalizeRadius(params.raio) };
}

export function toQuery(params: SearchParams): string {
  return new URLSearchParams({
    nome: params.name,
    categoria: params.category,
    detalhes: params.details,
    lat: String(params.lat),
    lng: String(params.lng),
    raio: String(params.radiusKm),
  }).toString();
}

function toCoordinate(value: string | undefined, limit: number): number | null {
  if (!value?.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

import { lookupCep } from "./cep";
import { placeFromCoordinates } from "./reverse";
import type { LocationInput, Place } from "./types";

/** Rough bounding box of Brazil. Catches swapped latitude/longitude, which stays in range otherwise. */
export function isInBrazil(lat: number, lng: number): boolean {
  return lat >= -34 && lat <= 6 && lng >= -74 && lng <= -34;
}

export async function resolveLocation(input: LocationInput, fetcher: typeof fetch = fetch): Promise<Place | null> {
  if (input.kind === "cep") return lookupCep(input.cep, fetcher);
  if (!isInBrazil(input.lat, input.lng)) return null;
  return placeFromCoordinates(input.lat, input.lng, fetcher);
}

import { getJson, toUf } from "./cep";
import type { Place } from "./types";

type NominatimReverse = {
  address?: {
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city?: string;
    town?: string;
    village?: string;
    "ISO3166-2-lvl4"?: string; // "BR-CE"
  };
};

/** Neighborhood and city for a GPS point. Never fails: unknown parts come back as null. */
export async function placeFromCoordinates(lat: number, lng: number, fetcher: typeof fetch = fetch): Promise<Place> {
  const result = await getJson<NominatimReverse>(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&zoom=16&accept-language=pt-BR`,
    fetcher,
  );
  const address = result?.address ?? {};
  return {
    lat,
    lng,
    neighborhood: address.suburb ?? address.neighbourhood ?? address.quarter ?? null,
    city: address.city ?? address.town ?? address.village ?? null,
    state: toUf(address["ISO3166-2-lvl4"]),
  };
}

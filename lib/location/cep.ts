import { USER_AGENT, type Place } from "./types";

type BrasilApiCep = {
  city?: string;
  neighborhood?: string;
  location?: { coordinates?: { latitude?: string; longitude?: string } };
};

/** Coordinates, neighborhood and city of a CEP: BrasilAPI first, Nominatim for missing coordinates. */
export async function lookupCep(cep: string, fetcher: typeof fetch = fetch): Promise<Place | null> {
  const digits = cep.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const address = await getJson<BrasilApiCep>(`https://brasilapi.com.br/api/cep/v2/${digits}`, fetcher);
  const neighborhood = address?.neighborhood || null;
  const city = address?.city || null;

  const lat = Number(address?.location?.coordinates?.latitude);
  const lng = Number(address?.location?.coordinates?.longitude);
  if (address?.location?.coordinates?.latitude && Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, neighborhood, city };
  }

  const formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
  const found = await getJson<{ lat: string; lon: string }[]>(
    `https://nominatim.openstreetmap.org/search?postalcode=${formatted}&country=br&format=jsonv2&limit=1`,
    fetcher,
  );
  const foundLat = parseFloat(found?.[0]?.lat ?? "");
  const foundLng = parseFloat(found?.[0]?.lon ?? "");
  if (!Number.isFinite(foundLat) || !Number.isFinite(foundLng)) return null;
  return { lat: foundLat, lng: foundLng, neighborhood, city };
}

const TIMEOUT_MS = 4000;

export async function getJson<T>(url: string, fetcher: typeof fetch): Promise<T | null> {
  try {
    const response = await fetcher(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

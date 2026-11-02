import type { Db } from "@/lib/supabase/server";
import { generateToken } from "@/lib/tokens";
import { expiryCutoff } from "./expiry";

const MAX_DISTANCE_KM = 1000;

export type OpenRequestInput = {
  providerId: string;
  categoryId: number;
  clientName: string;
  details: string;
  /** Random id kept in a cookie, so the same browser does not open duplicates. */
  anonymousClient: string;
  lat?: number;
  lng?: number;
};

/**
 * "Conversar" (spec 3.2): creates an open request with a provider token, or returns
 * the open one this browser already has with the provider.
 */
export async function openServiceRequest(db: Db, input: OpenRequestInput): Promise<{ token: string }> {
  const { data: provider, error } = await db
    .from("providers")
    .select("hidden, provider_categories(category_id)")
    .eq("id", input.providerId)
    .maybeSingle();
  if (error) throw error;
  if (!provider || provider.hidden) throw new Error("provider unavailable");
  if (!provider.provider_categories.some((c) => c.category_id === input.categoryId)) {
    throw new Error("category not offered by the provider");
  }

  const existing = await findOpenRequest(db, input.providerId, input.anonymousClient);
  if (existing) return { token: existing };

  let distanceKm: number | null = null;
  if (input.lat !== undefined && input.lng !== undefined) {
    const distance = await db.rpc("distance_to_provider", {
      p_provider_id: input.providerId,
      p_lat: input.lat,
      p_lng: input.lng,
    });
    if (distance.error) throw distance.error;
    // A position far outside the service area (tampered form) just means "distance unknown".
    distanceKm = distance.data !== null && Number(distance.data) <= MAX_DISTANCE_KM ? Number(distance.data) : null;
  }

  const token = generateToken();
  const insert = await db.from("service_requests").insert({
    provider_id: input.providerId,
    category_id: input.categoryId,
    client_name: input.clientName,
    details: input.details,
    anonymous_client: input.anonymousClient,
    distance_km: distanceKm,
    provider_token: token,
  });
  if (insert.error) throw insert.error;
  return { token };
}

/** The provider token of this browser's unexpired open request with the provider, if any. */
export async function findOpenRequest(db: Db, providerId: string, anonymousClient: string): Promise<string | null> {
  const { data, error } = await db
    .from("service_requests")
    .select("provider_token")
    .eq("provider_id", providerId)
    .eq("anonymous_client", anonymousClient)
    .eq("status", "open")
    .gt("created_at", expiryCutoff().toISOString())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.provider_token ?? null;
}

/** How many requests a provider received in the last `minutes` (flood protection). */
export async function recentRequestCount(db: Db, providerId: string, minutes: number): Promise<number> {
  const since = new Date(Date.now() - minutes * 60_000).toISOString();
  const { count, error } = await db
    .from("service_requests")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", providerId)
    .gt("created_at", since);
  if (error) throw error;
  return count ?? 0;
}

import type { Db } from "@/lib/supabase/server";
import { generateToken } from "@/lib/tokens";
import { expiryCutoff } from "./expiry";

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

  const existing = await db
    .from("service_requests")
    .select("provider_token")
    .eq("provider_id", input.providerId)
    .eq("anonymous_client", input.anonymousClient)
    .eq("status", "open")
    .gt("created_at", expiryCutoff().toISOString())
    .limit(1)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return { token: existing.data.provider_token };

  let distanceKm: number | null = null;
  if (input.lat !== undefined && input.lng !== undefined) {
    const distance = await db.rpc("distance_to_provider", {
      p_provider_id: input.providerId,
      p_lat: input.lat,
      p_lng: input.lng,
    });
    if (distance.error) throw distance.error;
    distanceKm = distance.data === null ? null : Number(distance.data);
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

import type { Db } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  name: string;
  neighborhood: string | null;
  busy: boolean;
  distanceKm: number;
  categories: string[];
  recommendationCount: number;
};

/** Providers of a category within the radius: free first, then by distance (search_providers RPC). */
export async function searchProviders(
  db: Db,
  query: { lat: number; lng: number; radiusKm: number; categoryId: number },
): Promise<SearchResult[]> {
  const { data, error } = await db.rpc("search_providers", {
    p_lat: query.lat,
    p_lng: query.lng,
    p_radius_km: query.radiusKm,
    p_category_id: query.categoryId,
  });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    neighborhood: row.neighborhood,
    busy: row.busy,
    distanceKm: Number(row.distance_km),
    categories: row.categories,
    recommendationCount: Number(row.recommendation_count),
  }));
}

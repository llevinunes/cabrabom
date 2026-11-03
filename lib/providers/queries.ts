import type { Place } from "@/lib/location/types";
import type { Db } from "@/lib/supabase/server";

/** The provider registered with this WhatsApp number (the session phone), if any. */
export async function providerByPhone(db: Db, phone: string): Promise<{ id: string; name: string } | null> {
  const { data, error } = await db.from("providers").select("id, name").eq("whatsapp", phone).maybeSingle();
  if (error) throw error;
  return data;
}

/** Creates the provider for the logged-in phone. Returns the existing one if already registered. */
export async function createProvider(
  db: Db,
  input: { name: string; categoryIds: number[]; place: Place },
  phone: string,
): Promise<{ id: string }> {
  const { data, error } = await db.rpc("create_provider", {
    p_name: input.name,
    p_whatsapp: phone,
    p_lat: input.place.lat,
    p_lng: input.place.lng,
    p_neighborhood: input.place.neighborhood ?? undefined,
    p_city: input.place.city ?? undefined,
    p_state: input.place.state ?? undefined,
    p_category_ids: input.categoryIds,
  });
  if (error) throw error;
  return { id: data };
}

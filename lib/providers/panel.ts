import type { Place } from "@/lib/location/types";
import type { Db } from "@/lib/supabase/server";

export type Dashboard = {
  name: string;
  busy: boolean;
  /** Busy by hand for 3 days and already reminded (ADR 0040): offer "Continuo ocupado". */
  busyReminded: boolean;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  recommendationCount: number;
  servicesCount: number;
};

/** What /painel shows at the top (screen 10). */
export async function providerDashboard(db: Db, providerId: string): Promise<Dashboard | null> {
  const [provider, recommendations, services] = await Promise.all([
    db
      .from("providers")
      .select("name, busy, busy_updated_at, busy_reminder_sent_at, neighborhood, city, state")
      .eq("id", providerId)
      .maybeSingle(),
    db.from("recommendations").select("id", { count: "exact", head: true }).eq("provider_id", providerId).eq("visible", true),
    db
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", providerId)
      .in("status", ["completed", "recommended"]),
  ]);
  for (const result of [provider, recommendations, services]) if (result.error) throw result.error;
  if (!provider.data) return null;
  const { busy_updated_at, busy_reminder_sent_at, ...data } = provider.data;
  return {
    ...data,
    busyReminded:
      data.busy && busy_reminder_sent_at !== null && new Date(busy_reminder_sent_at) >= new Date(busy_updated_at),
    recommendationCount: recommendations.count ?? 0,
    servicesCount: services.count ?? 0,
  };
}

/** Manual free/busy switch. Every change updates busy_updated_at (spec 3.6). */
export async function setBusy(db: Db, providerId: string, busy: boolean): Promise<void> {
  const { error } = await db
    .from("providers")
    .update({ busy, busy_updated_at: new Date().toISOString() })
    .eq("id", providerId);
  if (error) throw error;
}

export async function updateProviderLocation(db: Db, providerId: string, place: Place): Promise<void> {
  const { error } = await db.rpc("set_provider_location", {
    p_provider_id: providerId,
    p_lat: place.lat,
    p_lng: place.lng,
    p_neighborhood: place.neighborhood?.slice(0, 80) ?? undefined,
    p_city: place.city?.slice(0, 80) ?? undefined,
    p_state: place.state ?? undefined,
  });
  if (error) throw error;
}

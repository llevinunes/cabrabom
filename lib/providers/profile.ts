import type { Category } from "@/lib/categories";
import type { Db } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";

/** What /p/[id] shows (screen 03). Never the location: only the neighborhood. */
export type PublicProfile = {
  id: string;
  name: string;
  neighborhood: string | null;
  busy: boolean;
  yearsExperience: number | null;
  bio: string | null;
  /** Public by the provider's consent (spec section 9); used for the wa.me link. */
  whatsapp: string;
  categories: Category[];
  recommendationCount: number;
  servicesCount: number;
};

export async function publicProfile(db: Db, id: string): Promise<PublicProfile | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await db
    .from("providers")
    .select("id, name, neighborhood, busy, years_experience, bio, whatsapp, hidden, provider_categories(categories(id, name, slug, active))")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.hidden) return null;

  const [recommendations, services] = await Promise.all([
    db.from("recommendations").select("id", { count: "exact", head: true }).eq("provider_id", id).eq("visible", true),
    db
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("provider_id", id)
      .in("status", ["completed", "recommended"]),
  ]);
  if (recommendations.error) throw recommendations.error;
  if (services.error) throw services.error;

  const categories = data.provider_categories
    .map((link) => link.categories)
    .filter((category) => category?.active)
    .map(({ id, name, slug }) => ({ id, name, slug }))
    .sort((a, b) => a.id - b.id);

  return {
    id: data.id,
    name: data.name,
    neighborhood: data.neighborhood,
    busy: data.busy,
    yearsExperience: data.years_experience,
    bio: data.bio,
    whatsapp: data.whatsapp,
    categories,
    recommendationCount: recommendations.count ?? 0,
    servicesCount: services.count ?? 0,
  };
}

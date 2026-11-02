import type { Db } from "@/lib/supabase/server";

export type Category = { id: number; name: string; slug: string };

/** Active categories, in the order the admin created them (spec: fixed list). */
export async function listCategories(db: Db): Promise<Category[]> {
  const { data, error } = await db.from("categories").select("id, name, slug").eq("active", true).order("id");
  if (error) throw error;
  return data;
}

export async function categoryBySlug(db: Db, slug: string): Promise<Category | null> {
  const { data, error } = await db
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Keeps only the ids that are active categories (form input is not trusted). */
export async function activeCategoryIds(db: Db, ids: number[]): Promise<number[]> {
  if (ids.length === 0) return [];
  const { data, error } = await db.from("categories").select("id").in("id", ids).eq("active", true).order("id");
  if (error) throw error;
  return data.map((row) => row.id);
}

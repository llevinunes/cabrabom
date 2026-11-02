import type { Db } from "@/lib/supabase/server";

/**
 * Records a hit for `key` and tells whether it is still within `max` hits in the
 * last `windowMinutes`. Stored in Postgres because serverless instances share no memory.
 */
export async function withinLimit(db: Db, key: string, max: number, windowMinutes: number): Promise<boolean> {
  const insert = await db.from("rate_limit_hits").insert({ key });
  if (insert.error) throw insert.error;

  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const { count, error } = await db
    .from("rate_limit_hits")
    .select("id", { count: "exact", head: true })
    .eq("key", key)
    .gt("created_at", since);
  if (error) throw error;
  return (count ?? 0) <= max;
}

import type { Db } from "@/lib/supabase/server";
import { firstName } from "@/lib/text";
import { HIGHLIGHTS } from "./highlights";

const COMMENTS_SHOWN = 10;

export type RecommendationSummary = {
  count: number;
  /** Most mentioned first; ties keep the order of HIGHLIGHTS. */
  highlights: { name: string; count: number }[];
  /** Only the client's first name is shown, never the phone (spec 3.4). */
  comments: { firstName: string; comment: string; createdAt: Date }[];
};

/** "12 pessoas recomendam · Pontual (9) · Caprichoso (7)" and the comments (spec 3.4). */
export async function recommendationSummary(db: Db, providerId: string): Promise<RecommendationSummary> {
  const { data, error } = await db
    .from("recommendations")
    .select("client_name, comment, highlights, created_at")
    .eq("provider_id", providerId)
    .eq("visible", true)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data) for (const name of row.highlights) counts.set(name, (counts.get(name) ?? 0) + 1);
  const highlights = HIGHLIGHTS.filter((name) => counts.has(name))
    .map((name) => ({ name, count: counts.get(name)! }))
    .sort((a, b) => b.count - a.count);

  const comments = data
    .filter((row) => row.comment)
    .slice(0, COMMENTS_SHOWN)
    .map((row) => ({ firstName: firstName(row.client_name), comment: row.comment!, createdAt: new Date(row.created_at) }));

  return { count: data.length, highlights, comments };
}

/** "1 pessoa recomenda · Pontual (1)" — up to three highlights. */
export function summaryLine(summary: RecommendationSummary): string {
  const people = summary.count === 1 ? "1 pessoa recomenda" : `${summary.count} pessoas recomendam`;
  return [people, ...summary.highlights.slice(0, 3).map((h) => `${h.name} (${h.count})`)].join(" · ");
}

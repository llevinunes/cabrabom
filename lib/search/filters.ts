import type { SearchResult } from "./search";

/** Quick filters of screen 02. The default order (free, distance, recommendations) comes from the database. */
export function applyFilters(
  results: SearchResult[],
  filters: { onlyFree: boolean; mostRecommended: boolean },
): SearchResult[] {
  const list = filters.onlyFree ? results.filter((result) => !result.busy) : [...results];
  // Array.prototype.sort is stable, so ties keep the database order.
  return filters.mostRecommended ? list.sort((a, b) => b.recommendationCount - a.recommendationCount) : list;
}

const QUICK_RADII = [10, 25, 50, 100];

/** The radius chip cycles 10 → 25 → 50 → 100 → 10 km. */
export function nextRadius(current: number): number {
  return QUICK_RADII.find((radius) => radius > current) ?? QUICK_RADII[0];
}

import { expect, test } from "vitest";
import { applyFilters, nextRadius } from "@/lib/search/filters";

const result = (name: string, busy: boolean, recommendationCount: number) => ({
  id: name,
  name,
  neighborhood: null,
  city: null,
  state: null,
  busy,
  distanceKm: 1,
  categories: [],
  recommendationCount,
});

const list = [result("A", false, 1), result("B", false, 5), result("C", true, 9), result("D", false, 5)];

test("onlyFree removes busy providers", () => {
  expect(applyFilters(list, { onlyFree: true, mostRecommended: false }).map((r) => r.name)).toEqual(["A", "B", "D"]);
});

test("mostRecommended sorts by recommendations and keeps the original order on ties", () => {
  expect(applyFilters(list, { onlyFree: false, mostRecommended: true }).map((r) => r.name)).toEqual([
    "C",
    "B",
    "D",
    "A",
  ]);
});

test("without filters the list is unchanged", () => {
  expect(applyFilters(list, { onlyFree: false, mostRecommended: false })).toEqual(list);
});

test("nextRadius cycles through the quick options", () => {
  expect(nextRadius(10)).toBe(25);
  expect(nextRadius(25)).toBe(50);
  expect(nextRadius(50)).toBe(100);
  expect(nextRadius(100)).toBe(10);
  expect(nextRadius(7)).toBe(10);
  expect(nextRadius(60)).toBe(100);
});

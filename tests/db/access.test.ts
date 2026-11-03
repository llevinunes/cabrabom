import { createClient } from "@supabase/supabase-js";
import { expect, test } from "vitest";
import { CITY_CENTRE } from "./helpers";

// The browser never talks to the database (ADR 0030): the public anon key must get nothing.
const anon = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});

test("anon cannot call the search function", async () => {
  const { error } = await anon.rpc("search_providers", {
    p_lat: CITY_CENTRE.lat,
    p_lng: CITY_CENTRE.lng,
    p_radius_km: 10,
    p_category_id: 1,
  });
  expect(error).not.toBeNull();
});

test("anon cannot read providers", async () => {
  const { data } = await anon.from("providers").select("whatsapp");
  expect(data ?? []).toEqual([]);
});

test("anon cannot read sessions", async () => {
  const { data } = await anon.from("sessions").select("*");
  expect(data ?? []).toEqual([]);
});

test("anon cannot read push subscriptions or reports", async () => {
  for (const table of ["push_subscriptions", "reports"] as const) {
    const { data } = await anon.from(table).select("*");
    expect(data ?? []).toEqual([]);
  }
});

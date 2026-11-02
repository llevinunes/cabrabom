import { expect, test } from "vitest";
import { createServerClient } from "@/lib/supabase/server";

test("the server client reads the database with the service_role key", async () => {
  const { data, error } = await createServerClient().from("categories").select("slug").eq("slug", "eletricista");
  expect(error).toBeNull();
  expect(data).toEqual([{ slug: "eletricista" }]);
});

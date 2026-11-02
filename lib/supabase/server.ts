import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "./database.types";

export type Db = SupabaseClient<Database>;

let client: Db | undefined;

/** Database client with the service_role key. Server only (ADR 0030). */
export function createServerClient(): Db {
  client ??= createClient<Database>(env().SUPABASE_URL, env().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

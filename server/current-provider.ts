import "server-only";
import { cache } from "react";
import { providerByPhone } from "@/lib/providers/queries";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentSession } from "./session";

/** The provider registered with the logged-in phone, or null (not logged in or not a provider). */
export const getCurrentProvider = cache(async () => {
  const session = await getCurrentSession();
  return session ? providerByPhone(createServerClient(), session.phone) : null;
});

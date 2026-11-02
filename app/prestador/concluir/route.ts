import { redirect } from "next/navigation";
import { createProvider } from "@/lib/providers/queries";
import { pendingSignupSchema } from "@/lib/providers/signup";
import { createServerClient } from "@/lib/supabase/server";
import { PENDING_SIGNUP_COOKIE } from "@/server/cookie-names";
import { deleteCookie, readCookie } from "@/server/cookies";
import { getCurrentSession } from "@/server/session";

/** After the WhatsApp login: creates the provider with the session phone and opens the panel. */
export async function GET() {
  const session = await getCurrentSession();
  if (!session) redirect("/entrar?voltar=/prestador/concluir");

  const pending = pendingSignupSchema.safeParse(parseJson(await readCookie(PENDING_SIGNUP_COOKIE)));
  if (!pending.success) redirect("/prestador");

  await createProvider(createServerClient(), pending.data, session.phone);
  await deleteCookie(PENDING_SIGNUP_COOKIE);
  redirect("/painel");
}

function parseJson(value: string | undefined): unknown {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

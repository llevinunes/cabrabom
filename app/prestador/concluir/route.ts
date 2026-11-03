import { redirect } from "next/navigation";
import { activeCategoryIds } from "@/lib/categories";
import { createProvider } from "@/lib/providers/queries";
import { pendingSignupSchema } from "@/lib/providers/signup";
import { createServerClient } from "@/lib/supabase/server";
import { PENDING_SIGNUP_COOKIE } from "@/server/cookie-names";
import { deleteCookie, readSignedCookie } from "@/server/cookies";
import { getCurrentSession } from "@/server/session";

/** After the WhatsApp login: creates the provider with the session phone and opens the panel. */
export async function GET() {
  const session = await getCurrentSession();
  if (!session) redirect("/entrar?voltar=/prestador/concluir");

  const pending = pendingSignupSchema.safeParse(parseJson(await readSignedCookie(PENDING_SIGNUP_COOKIE)));
  const db = createServerClient();
  const categoryIds = pending.success ? await activeCategoryIds(db, pending.data.categoryIds) : [];
  if (!pending.success || categoryIds.length === 0) {
    await deleteCookie(PENDING_SIGNUP_COOKIE);
    redirect("/prestador?erro=expirado");
  }

  await createProvider(db, { ...pending.data, categoryIds }, session.phone);
  await deleteCookie(PENDING_SIGNUP_COOKIE);
  redirect("/painel");
}

function parseJson(value: string | null): unknown {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

import { redirect } from "next/navigation";
import { confirmAndGo } from "@/server/confirm-service";
import { PENDING_CONFIRMATION_COOKIE } from "@/server/cookie-names";
import { deleteCookie, readSignedCookie } from "@/server/cookies";
import { getCurrentSession } from "@/server/session";

/**
 * After the WhatsApp login started by "Confirmar com WhatsApp": confirms only when this
 * browser asked to (signed cookie for this same token). A bare GET confirms nothing.
 */
export async function GET(_request: Request, { params }: RouteContext<"/c/[token]/concluir">) {
  const { token } = await params;
  const session = await getCurrentSession();
  if (!session) redirect(`/entrar?voltar=${encodeURIComponent(`/c/${token}/concluir`)}`);

  const pending = await readSignedCookie(PENDING_CONFIRMATION_COOKIE);
  await deleteCookie(PENDING_CONFIRMATION_COOKIE);
  if (pending !== token) redirect(`/c/${encodeURIComponent(token)}`);
  redirect(await confirmAndGo(token, session.phone));
}

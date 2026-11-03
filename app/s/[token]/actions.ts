"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { acceptServiceRequest } from "@/lib/service-requests/lifecycle";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/server/session";

/** "Aceitar serviço": the phone comes from the session; the database checks it is the provider's. */
export async function acceptRequest(form: FormData): Promise<void> {
  const token = String(form.get("token") ?? "");
  const session = await getCurrentSession();
  if (!session) redirect(`/entrar?voltar=/s/${encodeURIComponent(token)}`);
  await acceptServiceRequest(createServerClient(), token, session.phone);
  revalidatePath("/painel");
  redirect(`/s/${encodeURIComponent(token)}`);
}

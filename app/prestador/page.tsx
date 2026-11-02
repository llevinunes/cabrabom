import { redirect } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { listCategories } from "@/lib/categories";
import { formatPhone } from "@/lib/phone";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProvider } from "@/server/current-provider";
import { getCurrentSession } from "@/server/session";
import { signOut } from "@/server/session-actions";
import { SignupForm } from "./SignupForm";

// Screen 07 · provider signup. Also the recruiting link (QR codes, flyers, groups).
export default async function ProviderSignup({ searchParams }: PageProps<"/prestador">) {
  if (await getCurrentProvider()) redirect("/painel");
  const [{ erro }, session, categories] = await Promise.all([
    searchParams,
    getCurrentSession(),
    listCategories(createServerClient()),
  ]);

  return (
    <main className="flex flex-col gap-6">
      <BrandMark />
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-black">Mostre seu trabalho para quem precisa</h1>
        <p className="text-secundario">Leva menos de 2 minutos. O resto do perfil você completa depois.</p>
      </div>

      {erro === "expirado" && (
        <p role="alert" className="rounded-campo bg-ocupado-fundo p-4 text-sm font-semibold text-ocupado-texto">
          Não conseguimos concluir seu cadastro. Preencha os dados de novo, por favor.
        </p>
      )}

      {session && (
        // The number published is the session's, so say which one it is before consent.
        <div className="flex items-center justify-between gap-3 rounded-campo border border-borda bg-superficie p-4">
          <p className="text-sm">
            Seu WhatsApp: <strong className="whitespace-nowrap">{formatPhone(session.phone)}</strong>
          </p>
          <form action={signOut}>
            <button type="submit" className="text-sm font-semibold text-laranja-texto underline">
              Não é você? Sair
            </button>
          </form>
        </div>
      )}

      <SignupForm categories={categories} />
    </main>
  );
}

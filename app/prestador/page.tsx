import { redirect } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { listCategories } from "@/lib/categories";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProvider } from "@/server/current-provider";
import { SignupForm } from "./SignupForm";

// Screen 07 · provider signup. Also the recruiting link (QR codes, flyers, groups).
export default async function ProviderSignup() {
  if (await getCurrentProvider()) redirect("/painel");
  const categories = await listCategories(createServerClient());

  return (
    <main className="flex flex-col gap-6">
      <BrandMark />
      <div className="flex flex-col gap-1">
        <h1 className="text-[28px] leading-tight font-black">Mostre seu trabalho para quem precisa</h1>
        <p className="text-secundario">Leva menos de 2 minutos. O resto do perfil você completa depois.</p>
      </div>
      <SignupForm categories={categories} />
    </main>
  );
}

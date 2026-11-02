import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";
import { listCategories } from "@/lib/categories";
import { readSearchDefaults } from "@/lib/search/params";
import { createServerClient } from "@/lib/supabase/server";
import { getCurrentProvider } from "@/server/current-provider";
import { SearchForm } from "./SearchForm";

// Screen 01 · search. Opens straight away, no login (ADR 0005, ADR 0015).
export default async function Home({ searchParams }: PageProps<"/">) {
  const [categories, provider, params] = await Promise.all([
    listCategories(createServerClient()),
    getCurrentProvider(),
    searchParams,
  ]);

  return (
    <main className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <BrandMark />
        <Link
          href={provider ? "/painel" : "/prestador"}
          className="text-sm font-semibold text-laranja-texto underline underline-offset-2"
        >
          {provider ? "Meu painel" : "Sou prestador"}
        </Link>
      </header>

      <section className="flex flex-col gap-1 rounded-card bg-obra p-5 text-white">
        <h1 className="text-[22px] leading-tight font-black">Do que você precisa hoje?</h1>
        <p className="text-sm text-cabra">Encontre um cabra bom perto de você e converse direto pelo WhatsApp.</p>
      </section>

      <SearchForm categories={categories} defaults={readSearchDefaults(params)} />
    </main>
  );
}

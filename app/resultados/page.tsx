import Link from "next/link";
import { redirect } from "next/navigation";
import { ChatButton } from "@/components/ChatButton";
import { chipClasses } from "@/components/ui/Chip";
import { ProviderCard } from "@/components/ui/ProviderCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { categoryBySlug } from "@/lib/categories";
import { applyFilters, nextRadius } from "@/lib/search/filters";
import { readSearchParams, toQuery, type SearchParams } from "@/lib/search/params";
import { searchProviders } from "@/lib/search/search";
import { createServerClient } from "@/lib/supabase/server";
import { placeLabel } from "@/lib/text";

type Filters = { onlyFree: boolean; mostRecommended: boolean };

function resultsHref(search: SearchParams, filters: Filters) {
  const query = new URLSearchParams(toQuery(search));
  if (filters.onlyFree) query.set("livres", "1");
  if (filters.mostRecommended) query.set("ordem", "recomendados");
  return `/resultados?${query}`;
}

// Screen 02 · results: free providers first, then by distance (spec 3.1).
export default async function Results({ searchParams }: PageProps<"/resultados">) {
  const raw = await searchParams;
  const search = readSearchParams(raw);
  if (!search) redirect("/");
  const db = createServerClient();
  const category = await categoryBySlug(db, search.category);
  if (!category) redirect("/");

  const filters: Filters = { onlyFree: raw.livres === "1", mostRecommended: raw.ordem === "recomendados" };
  const results = applyFilters(
    await searchProviders(db, { lat: search.lat, lng: search.lng, radiusKm: search.radiusKm, categoryId: category.id }),
    filters,
  );
  const wider = { ...search, radiusKm: nextRadius(search.radiusKm) };
  const profileQuery = toQuery(search);

  return (
    <main className="flex flex-col gap-5">
      <ScreenHeader
        title={category.name}
        subtitle={`Até ${search.radiusKm} km de você · ${results.length} ${results.length === 1 ? "encontrado" : "encontrados"}`}
        backHref={`/?${toQuery(search)}`}
      />

      <nav aria-label="Filtros" className="flex flex-wrap gap-2">
        <Link href={resultsHref(wider, filters)} className={chipClasses("selected")} aria-label={`Raio de ${search.radiusKm} km, trocar para ${wider.radiusKm} km`}>
          {search.radiusKm} km
        </Link>
        <Link
          href={resultsHref(search, { ...filters, onlyFree: !filters.onlyFree })}
          className={chipClasses(filters.onlyFree ? "selected" : "neutral")}
          aria-label={filters.onlyFree ? "Só livres, ativado" : "Só livres"}
        >
          Só livres
        </Link>
        <Link
          href={resultsHref(search, { ...filters, mostRecommended: !filters.mostRecommended })}
          className={chipClasses(filters.mostRecommended ? "selected" : "neutral")}
          aria-label={filters.mostRecommended ? "Mais recomendados, ativado" : "Mais recomendados"}
        >
          Mais recomendados
        </Link>
      </nav>

      {results.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-card border border-borda bg-superficie p-4">
          <p>
            Nenhum prestador encontrado até {search.radiusKm} km.{" "}
            {search.radiusKm < 100 ? "Tente aumentar o raio." : "Tente outra categoria."}
          </p>
          {search.radiusKm < 100 && (
            <Link href={resultsHref(wider, filters)} className={chipClasses("neutral")}>
              Buscar até {wider.radiusKm} km
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {results.map((provider) => (
            <li key={provider.id}>
              <ProviderCard
                provider={{ ...provider, neighborhood: placeLabel(provider) }}
                href={`/p/${provider.id}?${profileQuery}`}
                chatAction={<ChatButton providerId={provider.id} search={search} offersCategory />}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

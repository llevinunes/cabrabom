import { notFound } from "next/navigation";
import { ChatButton } from "@/components/ChatButton";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { publicProfile } from "@/lib/providers/profile";
import { readSearchParams, toQuery } from "@/lib/search/params";
import { createServerClient } from "@/lib/supabase/server";
import { formatKm, placeLabel } from "@/lib/text";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col rounded-card border border-borda bg-superficie px-3 py-2.5">
      <span className="text-[22px] leading-tight font-black">{value}</span>
      <span className="text-xs text-secundario">{label}</span>
    </div>
  );
}

// Screen 03 · public profile. "Trabalhos realizados" (portfolio) comes in phase 3.
export default async function ProviderProfile({ params, searchParams }: PageProps<"/p/[id]">) {
  const [{ id }, raw] = await Promise.all([params, searchParams]);
  const db = createServerClient();
  const profile = await publicProfile(db, id);
  if (!profile) notFound();

  const search = readSearchParams(raw);
  let distanceKm: number | null = null;
  if (search) {
    const { data } = await db.rpc("distance_to_provider", { p_provider_id: id, p_lat: search.lat, p_lng: search.lng });
    distanceKm = data === null ? null : Number(data);
  }
  const place = [placeLabel(profile), distanceKm !== null ? `${formatKm(distanceKm)} de você` : null]
    .filter(Boolean)
    .join(" · ");

  const stats = [
    profile.yearsExperience ? { value: `${profile.yearsExperience} anos`, label: "de experiência" } : null,
    profile.recommendationCount > 0 ? { value: String(profile.recommendationCount), label: "recomendações" } : null,
    profile.servicesCount > 0 ? { value: String(profile.servicesCount), label: "serviços no app" } : null,
  ].filter((stat) => stat !== null);

  return (
    <main className="flex flex-col gap-5">
      <ScreenHeader title="Perfil" backHref={search ? `/resultados?${toQuery(search)}` : "/"} />

      <section className="flex items-center gap-4">
        <Avatar name={profile.name} size={72} />
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-2xl leading-tight font-black">{profile.name}</h2>
          {place && <p className="text-sm text-secundario">{place}</p>}
          <Chip variant={profile.busy ? "busy" : "free"}>{profile.busy ? "Ocupado no momento" : "Livre agora"}</Chip>
        </div>
      </section>

      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <Stat key={stat.label} {...stat} />
          ))}
        </div>
      )}

      {profile.bio && <p className="text-[15px]">{profile.bio}</p>}

      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Trabalha com</h3>
        <ul className="flex flex-wrap gap-2">
          {profile.categories.map((category) => (
            <li key={category.id}>
              <Chip>{category.name}</Chip>
            </li>
          ))}
        </ul>
      </section>

      <ChatButton
        providerId={profile.id}
        search={search}
        offersCategory={!!search && profile.categories.some((c) => c.slug === search.category)}
      />
    </main>
  );
}

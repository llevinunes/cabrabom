import { formatKm } from "@/lib/text";
import { Avatar } from "./Avatar";
import { Chip } from "./Chip";
import { Icon } from "./Icon";

export type ProviderCardData = {
  name: string;
  neighborhood: string | null;
  distanceKm: number;
  busy: boolean;
  categories: string[];
  recommendationCount: number;
};

export function recommendationsText(count: number): string {
  return count === 1 ? "1 pessoa recomenda" : `${count} pessoas recomendam`;
}

export function ProviderCard({
  provider,
  chatAction,
  title,
}: {
  provider: ProviderCardData;
  chatAction: React.ReactNode;
  /** Lets the page wrap the name in a link to the profile. */
  title?: React.ReactNode;
}) {
  const { name, neighborhood, distanceKm, busy, categories, recommendationCount } = provider;
  const place = neighborhood ? `${neighborhood} · ${formatKm(distanceKm)}` : formatKm(distanceKm);

  return (
    <article className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-tight font-extrabold">{title ?? name}</h3>
          <p className="text-sm text-secundario">{place}</p>
        </div>
        <Chip variant={busy ? "busy" : "free"}>{busy ? "Ocupado" : "Livre"}</Chip>
      </div>
      <ul className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <li key={category}>
            <Chip>{category}</Chip>
          </li>
        ))}
      </ul>
      {recommendationCount > 0 && (
        <p className="flex items-center gap-2 text-sm font-semibold text-secundario">
          <Icon name="check" className="size-4 text-obra" />
          {recommendationsText(recommendationCount)}
        </p>
      )}
      {chatAction}
    </article>
  );
}

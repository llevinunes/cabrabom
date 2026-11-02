import Link from "next/link";
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
  href,
}: {
  provider: ProviderCardData;
  chatAction: React.ReactNode;
  /**
   * Profile link. The name's link is stretched over the whole card (::after), so a tap
   * anywhere opens the profile; the chat action sits above it. One link, no nesting.
   */
  href?: string;
}) {
  const { name, neighborhood, distanceKm, busy, categories, recommendationCount } = provider;
  const place = neighborhood ? `${neighborhood} · ${formatKm(distanceKm)}` : formatKm(distanceKm);

  return (
    <article
      className={`relative flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4 ${href ? "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-obra active:bg-cabra" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg leading-tight font-extrabold">
            {href ? (
              <Link href={href} className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none">
                {name}
              </Link>
            ) : (
              name
            )}
          </h3>
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
      <div className="relative z-10">{chatAction}</div>
    </article>
  );
}

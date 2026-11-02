import Link from "next/link";
import { Icon } from "./Icon";

export function ScreenHeader({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="flex items-start gap-3">
      {backHref && (
        <Link href={backHref} aria-label="Voltar" className="-ml-2 flex size-11 shrink-0 items-center justify-center">
          <Icon name="back" />
        </Link>
      )}
      <div className={backHref ? "pt-1.5" : ""}>
        <h1 className="text-xl leading-tight font-extrabold">{title}</h1>
        {subtitle && <p className="text-sm text-secundario">{subtitle}</p>}
      </div>
    </header>
  );
}

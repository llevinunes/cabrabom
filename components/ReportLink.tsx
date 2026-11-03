import Link from "next/link";

/** Discreet "Relatar problema" link (spec 3.5): on the profile and on the service links. */
export function ReportLink({ providerId, requestToken }: { providerId?: string; requestToken?: string }) {
  const query = new URLSearchParams();
  if (providerId) query.set("prestador", providerId);
  if (requestToken) query.set("pedido", requestToken);
  return (
    <Link href={`/relatar?${query}`} className="self-center text-[13px] text-secundario underline">
      Relatar problema
    </Link>
  );
}

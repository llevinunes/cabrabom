import { notFound } from "next/navigation";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ReportForm } from "./ReportForm";

// Spec 3.5 · private report: only the admin sees it (Supabase dashboard, ADR 0041).
export default async function ReportProblem({ searchParams }: PageProps<"/relatar">) {
  const { prestador, pedido } = await searchParams;
  const providerId = typeof prestador === "string" ? prestador : undefined;
  const requestToken = typeof pedido === "string" ? pedido : undefined;
  if (!providerId && !requestToken) notFound();

  return (
    <main className="flex flex-col gap-5">
      <ScreenHeader title="Relatar problema" />
      <p className="text-secundario">Conte o que aconteceu. Só a equipe do CabraBom vê esta mensagem.</p>
      <ReportForm providerId={providerId} requestToken={requestToken} />
    </main>
  );
}

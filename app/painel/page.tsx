import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { providerDashboard } from "@/lib/providers/panel";
import { deadlineText } from "@/lib/service-requests/deadline";
import { pendingRequests } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { firstName } from "@/lib/text";
import { getCurrentProvider } from "@/server/current-provider";
import { getCurrentSession } from "@/server/session";
import { signOut } from "@/server/session-actions";
import { StatusSwitch } from "./StatusSwitch";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col rounded-card border border-borda bg-superficie p-4">
      <span className="text-[26px] leading-tight font-black">{value}</span>
      <span className="text-sm text-secundario">{label}</span>
    </div>
  );
}

// Screen 10 · provider panel. "Em andamento" comes with the service lifecycle (phase 2).
export default async function ProviderPanel() {
  // proxy.ts only checks that a cookie exists; the session itself may be gone.
  if (!(await getCurrentSession())) redirect("/entrar?voltar=/painel");
  const provider = await getCurrentProvider();
  if (!provider) redirect("/prestador");

  const db = createServerClient();
  const [dashboard, pending] = await Promise.all([providerDashboard(db, provider.id), pendingRequests(db, provider.id)]);
  if (!dashboard) redirect("/prestador");

  return (
    <main className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <BrandMark compact />
        <h1 className="text-[26px] font-black">Olá, {firstName(dashboard.name)}</h1>
      </header>

      <StatusSwitch busy={dashboard.busy} />

      <div className="grid grid-cols-2 gap-3">
        <Stat value={dashboard.recommendationCount} label="recomendações" />
        <Stat value={dashboard.servicesCount} label="serviços no app" />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold">Aguardando sua resposta</h2>
        {pending.length === 0 ? (
          <p className="rounded-card border border-borda bg-superficie p-4 text-sm text-secundario">
            Nenhum pedido aguardando.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((request) => (
              <li key={request.token} className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold">
                    {request.clientName} · {request.category}
                  </span>
                  <span className="shrink-0 text-[13px] font-semibold text-laranja-texto">
                    {deadlineText(request.createdAt)}
                  </span>
                </div>
                <Button variant="primary" href={`/s/${request.token}`}>
                  Ver pedido
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex items-center justify-between gap-3 rounded-card border border-borda bg-superficie p-4">
        <div className="flex flex-col">
          <span className="text-sm text-secundario">Onde você atende</span>
          <span className="font-bold">{dashboard.neighborhood ?? "Bairro não identificado"}</span>
        </div>
        <Link href="/painel/localizacao" className="text-sm font-semibold text-laranja-texto underline">
          Mudar localização
        </Link>
      </section>

      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sair
        </Button>
      </form>
    </main>
  );
}

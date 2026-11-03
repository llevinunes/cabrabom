import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { providerDashboard } from "@/lib/providers/panel";
import { NotificationsCard } from "@/components/NotificationsCard";
import { ShareLink } from "@/components/ShareLink";
import { env, pushEnabled } from "@/lib/env";
import { confirmedText, deadlineText } from "@/lib/service-requests/deadline";
import { recommendLink } from "@/lib/service-requests/links";
import {
  acceptedRequests,
  finishedAwaitingRecommendation,
  inProgressRequests,
  pendingRequests,
} from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { firstName, placeLabel } from "@/lib/text";
import { getCurrentProvider } from "@/server/current-provider";
import { getCurrentSession } from "@/server/session";
import { signOut } from "@/server/session-actions";
import { cancelService, finishService, stillBusy } from "./actions";
import { StatusSwitch } from "./StatusSwitch";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col rounded-card border border-borda bg-superficie p-4">
      <span className="text-[26px] leading-tight font-black">{value}</span>
      <span className="text-sm text-secundario">{label}</span>
    </div>
  );
}

// Screen 10 · provider panel.
export default async function ProviderPanel() {
  // proxy.ts only checks that a cookie exists; the session itself may be gone.
  if (!(await getCurrentSession())) redirect("/entrar?voltar=/painel");
  const provider = await getCurrentProvider();
  if (!provider) redirect("/prestador");

  const db = createServerClient();
  const [dashboard, inProgress, accepted, pending, finished] = await Promise.all([
    providerDashboard(db, provider.id),
    inProgressRequests(db, provider.id),
    acceptedRequests(db, provider.id),
    pendingRequests(db, provider.id),
    finishedAwaitingRecommendation(db, provider.id),
  ]);
  if (!dashboard) redirect("/prestador");

  return (
    <main className="flex flex-col gap-5">
      <header className="flex items-center gap-3">
        <BrandMark compact />
        <h1 className="text-[26px] font-black">Olá, {firstName(dashboard.name)}</h1>
      </header>

      <StatusSwitch busy={dashboard.busy} />

      {dashboard.busyReminded && (
        <form action={stillBusy} className="flex flex-col gap-2 rounded-card bg-cabra p-4">
          <p className="text-sm font-medium">Você está ocupado há alguns dias. Ainda está?</p>
          <Button type="submit" variant="outline">
            Continuo ocupado
          </Button>
        </form>
      )}

      <NotificationsCard
        publicKey={pushEnabled(env()) ? env().VAPID_PUBLIC_KEY! : null}
        loggedIn
        returnTo="/painel"
        title="Quer saber quando chegar um pedido?"
        text="Ative as notificações. No iPhone, adicione o CabraBom à tela inicial antes."
      />

      <div className="grid grid-cols-2 gap-3">
        <Stat value={dashboard.recommendationCount} label="recomendações" />
        <Stat value={dashboard.servicesCount} label="serviços no app" />
      </div>

      {inProgress.length > 0 && (
        <section aria-labelledby="in-progress-title" className="flex flex-col gap-2">
          <h2 id="in-progress-title" className="text-sm font-semibold">
            Em andamento
          </h2>
          <ul className="flex flex-col gap-3">
            {inProgress.map((request) => (
              <li key={request.providerToken} className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
                <div className="flex items-baseline justify-between gap-3">
                  {/* Client text is untrusted: isolate its direction and let it wrap. */}
                  <span className="min-w-0 font-bold [overflow-wrap:anywhere]">
                    <bdi>{request.clientName}</bdi> · {request.category}
                  </span>
                  <span className="shrink-0 text-[13px] text-secundario">{confirmedText(request.confirmedAt)}</span>
                </div>
                <p className="text-[15px] [overflow-wrap:anywhere]">
                  <bdi>{request.details}</bdi>
                </p>
                <form action={finishService}>
                  <input type="hidden" name="token" value={request.providerToken} />
                  <Button type="submit" variant="secondary">
                    Finalizar serviço
                  </Button>
                </form>
                <form action={cancelService} className="text-center">
                  <input type="hidden" name="token" value={request.providerToken} />
                  <button type="submit" className="text-[13px] text-secundario underline">
                    Cancelar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {accepted.length > 0 && (
        <section aria-labelledby="accepted-title" className="flex flex-col gap-2">
          <h2 id="accepted-title" className="text-sm font-semibold">
            Esperando o cliente confirmar
          </h2>
          <ul className="flex flex-col gap-3">
            {accepted.map((request) => (
              <li key={request.providerToken} className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
                <span className="min-w-0 font-bold [overflow-wrap:anywhere]">
                  <bdi>{request.clientName}</bdi> · {request.category}
                </span>
                <Button variant="outline" href={`/s/${request.providerToken}`}>
                  Reenviar link
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}

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
                  {/* Client text is untrusted: isolate its direction and let it wrap. */}
                  <span className="min-w-0 font-bold [overflow-wrap:anywhere]">
                    <bdi>{request.clientName}</bdi> · {request.category}
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

      {finished.length > 0 && (
        <section aria-labelledby="ask-title" className="flex flex-col gap-2">
          <h2 id="ask-title" className="text-sm font-semibold">
            Peça uma recomendação
          </h2>
          <ul className="flex flex-col gap-3">
            {finished.map((request) => (
              <li key={request.clientToken} className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
                <span className="min-w-0 font-bold [overflow-wrap:anywhere]">
                  <bdi>{request.clientName}</bdi>
                </span>
                <ShareLink
                  url={recommendLink(request.clientToken)}
                  shareLabel="Enviar link de recomendação"
                  text="Pode recomendar meu serviço no CabraBom?"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flex items-center justify-between gap-3 rounded-card border border-borda bg-superficie p-4">
        <div className="flex flex-col">
          <span className="text-sm text-secundario">Onde você atende</span>
          <span className="font-bold">{placeLabel(dashboard) ?? "Localização não identificada"}</span>
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

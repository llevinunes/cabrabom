import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ShareLink } from "@/components/ShareLink";
import { isExpired, receivedText } from "@/lib/service-requests/deadline";
import { clientLink } from "@/lib/service-requests/links";
import { requestByToken } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { firstName, formatKm } from "@/lib/text";
import { getCurrentSession } from "@/server/session";
import { signOut } from "@/server/session-actions";
import { acceptRequest, cancelRequest } from "./actions";

function CancelRequest({ token }: { token: string }) {
  return (
    <form action={cancelRequest} className="text-center">
      <input type="hidden" name="token" value={token} />
      <button type="submit" className="text-[13px] text-secundario underline">
        Cancelar pedido
      </button>
    </form>
  );
}

const FINAL_STATES: Record<string, string> = {
  in_progress: "Serviço em andamento",
  completed: "Serviço finalizado",
  recommended: "Serviço finalizado",
  cancelled: "Serviço cancelado",
};

// Screen 08 · the request behind the link in the client's first WhatsApp message;
// once accepted, screen 09 with the link for the client.
export default async function ServiceRequestForProvider({ params }: PageProps<"/s/[token]">) {
  const { token } = await params;
  const session = await getCurrentSession();
  if (!session) redirect(`/entrar?voltar=/s/${encodeURIComponent(token)}`);

  const request = await requestByToken(createServerClient(), token);
  if (!request) notFound();

  // The link also sits in the client's chat: only the provider of this request may see it (spec 6).
  if (session.phone !== request.providerWhatsapp) {
    return (
      <main className="flex flex-col gap-5">
        <ScreenHeader title="Este pedido é de outro prestador" />
        <p className="text-secundario">
          Você entrou com outro número de WhatsApp. Entre com o número que recebeu a mensagem.
        </p>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      </main>
    );
  }

  if (request.status === "accepted" && request.clientToken) {
    const client = firstName(request.clientName);
    return (
      <main className="flex flex-col gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-livre-fundo text-livre-texto">
          <Icon name="check" className="size-8" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-tight font-black">Serviço aceito!</h1>
          <p className="text-secundario [overflow-wrap:anywhere]">
            Agora envie este link para <bdi>{client}</bdi> confirmar. Assim dá para acompanhar o serviço e te recomendar
            no final.
          </p>
        </div>
        <ShareLink
          url={clientLink(request.clientToken)}
          shareLabel={
            <>
              Enviar para <bdi>{client}</bdi>
            </>
          }
          text="Confirme o serviço no CabraBom:"
        />
        <p className="text-[13px] text-secundario">
          Você aparece como ocupado quando o cliente confirmar. Ao finalizar, volta a ficar livre.
        </p>
        <Button variant="outline" href="/painel">
          Ir para o painel
        </Button>
        <CancelRequest token={token} />
      </main>
    );
  }

  const finalState = FINAL_STATES[request.status];
  if (finalState) {
    return (
      <main className="flex flex-col gap-5">
        <ScreenHeader title={finalState} subtitle={request.category} backHref="/painel" />
        <Button variant="outline" href="/painel">
          Ir para o painel
        </Button>
      </main>
    );
  }

  if (isExpired(request)) {
    return (
      <main className="flex flex-col gap-5">
        <ScreenHeader title="Esta solicitação expirou" />
        <p className="text-secundario">Pedidos sem resposta expiram em 2 dias.</p>
        <Button variant="outline" href="/painel">
          Ir para o painel
        </Button>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-5">
      <ScreenHeader title="Nova solicitação" subtitle={receivedText(request.createdAt)} backHref="/painel" />

      <article className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Client text is untrusted: isolate its direction and let it wrap. */}
          <h2 className="min-w-0 text-lg font-extrabold [overflow-wrap:anywhere]">
            <bdi>{request.clientName}</bdi>
          </h2>
          <Chip>{request.category}</Chip>
        </div>
        <p className="whitespace-pre-line text-[15px] [overflow-wrap:anywhere]">
          <bdi>{request.details}</bdi>
        </p>
        {request.distanceKm !== null && (
          <p className="flex items-center gap-2 text-sm text-secundario">
            <Icon name="location" className="size-5 text-obra" />A cerca de {formatKm(request.distanceKm)} de você
          </p>
        )}
      </article>

      <p className="rounded-campo bg-cabra p-4 text-sm font-medium">
        Se não for aceita, esta solicitação expira em 2 dias.
      </p>
      <form action={acceptRequest}>
        <input type="hidden" name="token" value={token} />
        <Button type="submit">Aceitar serviço</Button>
      </form>
      <p className="text-[13px] text-secundario">Combine preço e horário com o cliente pelo WhatsApp.</p>
      <Button variant="outline" href="/painel">
        Ir para o painel
      </Button>
      <CancelRequest token={token} />
    </main>
  );
}

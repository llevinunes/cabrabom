import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { isExpired, receivedText } from "@/lib/service-requests/deadline";
import { requestByToken } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { formatKm } from "@/lib/text";
import { getCurrentSession } from "@/server/session";
import { signOut } from "@/server/session-actions";

// Screen 08 · the request behind the link in the client's first WhatsApp message.
// Phase 1 is read-only: accepting comes with the service lifecycle (phase 2).
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
      <p className="text-[13px] text-secundario">
        Combine preço e horário com o cliente pelo WhatsApp. Em breve você poderá aceitar o pedido por aqui.
      </p>
      <Button variant="outline" href="/painel">
        Ir para o painel
      </Button>
    </main>
  );
}

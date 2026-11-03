import { notFound } from "next/navigation";
import { ServiceTimeline } from "@/components/ServiceTimeline";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FieldError } from "@/components/ui/Field";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { requestByClientToken, type RequestForClient } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { firstName } from "@/lib/text";
import { getCurrentSession } from "@/server/session";
import { signOut } from "@/server/session-actions";
import { cancelAsClient, completeAsClient, confirmRequest } from "./actions";

function RequestCard({ request }: { request: RequestForClient }) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-borda bg-superficie p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-lg font-extrabold [overflow-wrap:anywhere]">{request.providerName}</h2>
        <Chip>{request.category}</Chip>
      </div>
      {/* Client text is untrusted: isolate its direction and let it wrap. */}
      <p className="whitespace-pre-line text-[15px] [overflow-wrap:anywhere]">
        <bdi>{request.details}</bdi>
      </p>
    </article>
  );
}

function Message({ title, text, signOutButton }: { title: string; text?: string; signOutButton?: boolean }) {
  return (
    <main className="flex flex-col gap-5">
      <BrandMark />
      <ScreenHeader title={title} />
      {text && <p className="text-secundario">{text}</p>}
      {signOutButton && (
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      )}
    </main>
  );
}

// Screens 04 (confirm) and 05 (service in progress) · the link the provider sends to the client.
// Outside proxy.ts on purpose: the login happens in the middle of this page (spec section 7).
export default async function ServiceForClient({ params, searchParams }: PageProps<"/c/[token]">) {
  const [{ token }, { erro }] = await Promise.all([params, searchParams]);
  const request = await requestByClientToken(createServerClient(), token);
  if (!request) notFound();
  const session = await getCurrentSession();
  const provider = firstName(request.providerName);

  if (request.status === "cancelled") {
    return <Message title="Este serviço foi cancelado" text="Se ainda precisar, faça uma nova busca no CabraBom." />;
  }

  if (request.status === "accepted") {
    return (
      <main className="flex flex-col gap-5">
        <BrandMark />
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] leading-tight font-black [overflow-wrap:anywhere]">{provider} aceitou seu pedido!</h1>
          <p className="text-secundario">Confirme com seu WhatsApp para acompanhar o serviço e poder recomendar depois.</p>
        </div>
        <RequestCard request={request} />
        {erro === "proprio" && <FieldError>Você não pode confirmar o próprio serviço.</FieldError>}
        <form action={confirmRequest}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" variant="whatsapp">
            Confirmar com WhatsApp
          </Button>
        </form>
        <p className="text-[13px] text-secundario">
          Vamos abrir o WhatsApp com uma mensagem pronta para o CabraBom. É só tocar em enviar. Não precisa de senha.
        </p>
      </main>
    );
  }

  // in_progress, completed or recommended: only the phone that confirmed follows the service.
  if (!session) {
    return (
      <main className="flex flex-col gap-5">
        <BrandMark />
        <ScreenHeader title="Entre para acompanhar o serviço" />
        <p className="text-secundario">Use o mesmo WhatsApp com que você confirmou o serviço.</p>
        <Button variant="whatsapp" href={`/entrar?voltar=${encodeURIComponent(`/c/${token}`)}`}>
          Entrar com WhatsApp
        </Button>
      </main>
    );
  }
  if (session.phone !== request.clientPhone) {
    return (
      <Message
        title="Este serviço é de outro número"
        text="Você entrou com outro número de WhatsApp. Entre com o número que confirmou o serviço."
        signOutButton
      />
    );
  }

  const status = request.status as "in_progress" | "completed" | "recommended";
  return (
    <main className="flex flex-col gap-5">
      <ScreenHeader title="Seu serviço" subtitle={`${request.category} · ${request.providerName}`} />
      <ServiceTimeline status={status} />

      {status === "in_progress" && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">O serviço já terminou?</h2>
            <form action={completeAsClient}>
              <input type="hidden" name="token" value={token} />
              <Button type="submit" variant="outline">
                Marcar como finalizado
              </Button>
            </form>
            <p className="text-[13px] text-secundario">Ao finalizar, você pode recomendar {provider}.</p>
          </section>
          <form action={cancelAsClient}>
            <input type="hidden" name="token" value={token} />
            <button type="submit" className="text-[13px] text-secundario underline">
              Cancelar serviço
            </button>
          </form>
        </>
      )}

      {status === "completed" && (
        <Button href={`/r/${token}`}>Recomendar {provider}</Button>
      )}
      {status === "recommended" && (
        <p className="rounded-card bg-livre-fundo p-4 font-semibold text-livre-texto">
          Você já recomendou {provider}. Obrigado!
        </p>
      )}
    </main>
  );
}

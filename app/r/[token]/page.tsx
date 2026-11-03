import { notFound } from "next/navigation";
import { BrandMark } from "@/components/ui/BrandMark";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { recommendAvailableAt } from "@/lib/recommendations/create";
import { requestByClientToken } from "@/lib/service-requests/queries";
import { createServerClient } from "@/lib/supabase/server";
import { firstName } from "@/lib/text";
import { getCurrentSession } from "@/server/session";
import { signOut } from "@/server/session-actions";
import { RecommendForm } from "./RecommendForm";

function Message({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <main className="flex flex-col gap-5">
      <BrandMark />
      <ScreenHeader title={title} />
      {text && <p className="text-secundario">{text}</p>}
      {children}
    </main>
  );
}

function localTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Fortaleza" });
}

// Screen 06 · recommend the provider. Only the phone that confirmed the service (spec 3.4).
export default async function Recommend({ params }: PageProps<"/r/[token]">) {
  const { token } = await params;
  const request = await requestByClientToken(createServerClient(), token);
  if (!request || !request.clientPhone) notFound();
  const provider = firstName(request.providerName);

  const session = await getCurrentSession();
  if (!session) {
    return (
      <Message title={`Recomendar ${provider}`} text="Entre com o mesmo WhatsApp com que você confirmou o serviço.">
        <Button variant="whatsapp" href={`/entrar?voltar=${encodeURIComponent(`/r/${token}`)}`}>
          Entrar com WhatsApp
        </Button>
      </Message>
    );
  }
  if (session.phone !== request.clientPhone) {
    return (
      <Message
        title="Esta recomendação é de outro número"
        text="Você entrou com outro número de WhatsApp. Entre com o número que confirmou o serviço."
      >
        <form action={signOut}>
          <Button type="submit" variant="outline">
            Sair
          </Button>
        </form>
      </Message>
    );
  }

  if (request.status === "recommended") {
    return (
      <Message
        title="Obrigado pela recomendação!"
        text={`Ela já aparece no perfil de ${provider} e ajuda outras pessoas a encontrar um bom profissional.`}
      >
        <Button variant="outline" href={`/p/${request.providerId}`}>
          Ver perfil
        </Button>
      </Message>
    );
  }
  if (request.status === "in_progress") {
    return (
      <Message title={`Recomendar ${provider}`} text="Finalize o serviço antes de recomendar.">
        <Button variant="outline" href={`/c/${token}`}>
          Ver serviço
        </Button>
      </Message>
    );
  }
  if (request.status !== "completed") {
    return <Message title="Este serviço não pode ser recomendado" />;
  }

  const availableAt = recommendAvailableAt(request.clientConfirmedAt!);
  return (
    <main className="flex flex-col gap-5">
      <ScreenHeader title={`Recomendar ${provider}`} subtitle={`${request.category} · serviço finalizado`} backHref={`/c/${token}`} />
      {availableAt > new Date() ? (
        <p className="rounded-campo bg-cabra p-4 text-sm font-medium">
          Você poderá recomendar a partir das {localTime(availableAt)}. Guarde este link e volte depois.
        </p>
      ) : (
        <RecommendForm token={token} />
      )}
    </main>
  );
}

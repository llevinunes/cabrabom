import { oneLine } from "@/lib/service-requests/whatsapp";
import { firstName } from "@/lib/text";

export type PushMessage = { title: string; body: string; url: string };

const NAME_MAX = 40;

/** Names typed by people: one line, no direction tricks, first name only, bounded. */
function name(fullName: string): string {
  return firstName(oneLine(fullName)).slice(0, NAME_MAX);
}

export function newRequestMessage(clientName: string, category: string, providerToken: string): PushMessage {
  return {
    title: "Novo pedido de serviço",
    body: `${name(clientName)} quer um ${category}. Toque para ver.`,
    url: `/s/${providerToken}`,
  };
}

export function acceptedMessage(providerName: string, clientToken: string): PushMessage {
  return { title: `${name(providerName)} aceitou seu pedido`, body: "Toque para confirmar o serviço.", url: `/c/${clientToken}` };
}

export function confirmedMessage(clientName: string): PushMessage {
  return { title: `${name(clientName)} confirmou o serviço`, body: "Você agora aparece como ocupado.", url: "/painel" };
}

export function finishedByProviderMessage(providerName: string, clientToken: string): PushMessage {
  return {
    title: `${name(providerName)} finalizou o serviço`,
    body: "Que tal recomendar? Leva menos de um minuto.",
    url: `/r/${clientToken}`,
  };
}

export function finishedByClientMessage(clientName: string): PushMessage {
  return {
    title: `${name(clientName)} marcou o serviço como finalizado`,
    body: "Você está livre para novos serviços.",
    url: "/painel",
  };
}

/** 3 days after the client confirmed, once (ADR 0040). */
export function finishReminderMessage(clientName: string): PushMessage {
  return {
    title: `Já finalizou o serviço de ${name(clientName)}?`,
    body: "Finalize no app para receber recomendações dos clientes.",
    url: "/painel",
  };
}

/** 3 days after marking busy by hand, once (spec 3.6, ADR 0040). */
export function busyReminderMessage(): PushMessage {
  return { title: "Você ainda está ocupado?", body: "Toque para atualizar.", url: "/painel" };
}

import { expect, test } from "vitest";
import {
  acceptedMessage,
  busyReminderMessage,
  confirmedMessage,
  finishReminderMessage,
  finishedByClientMessage,
  finishedByProviderMessage,
  newRequestMessage,
} from "@/lib/push/messages";

test("new request: first name of the client, the category and the provider link", () => {
  expect(newRequestMessage("Maria José da Silva", "Eletricista", "tok")).toEqual({
    title: "Novo pedido de serviço",
    body: "Maria quer um Eletricista. Toque para ver.",
    url: "/s/tok",
  });
});

test("names lose line breaks and bidi controls and are cut at 40 characters", () => {
  expect(newRequestMessage("\u202EMa\nria", "Pintor", "t").body).toBe("Ma quer um Pintor. Toque para ver.");
  expect(confirmedMessage("x".repeat(60)).title).toBe(`${"x".repeat(40)} confirmou o serviço`);
});

test("the other events", () => {
  expect(acceptedMessage("João Silva", "c1")).toEqual({
    title: "João aceitou seu pedido",
    body: "Toque para confirmar o serviço.",
    url: "/c/c1",
  });
  expect(confirmedMessage("Maria")).toEqual({
    title: "Maria confirmou o serviço",
    body: "Você agora aparece como ocupado.",
    url: "/painel",
  });
  expect(finishedByProviderMessage("João Silva", "c1")).toEqual({
    title: "João finalizou o serviço",
    body: "Que tal recomendar? Leva menos de um minuto.",
    url: "/r/c1",
  });
  expect(finishedByClientMessage("Maria")).toEqual({
    title: "Maria marcou o serviço como finalizado",
    body: "Você está livre para novos serviços.",
    url: "/painel",
  });
  expect(finishReminderMessage("Maria")).toEqual({
    title: "Já finalizou o serviço de Maria?",
    body: "Finalize no app para receber recomendações dos clientes.",
    url: "/painel",
  });
  expect(busyReminderMessage()).toEqual({
    title: "Você ainda está ocupado?",
    body: "Toque para atualizar.",
    url: "/painel",
  });
});

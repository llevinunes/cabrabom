import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { NotificationsCard } from "@/components/NotificationsCard";

const props = {
  publicKey: "BPublicKey",
  loggedIn: true,
  returnTo: "/painel",
  title: "Quer saber quando chegar um pedido?",
  text: "Ative as notificações. No iPhone, adicione o CabraBom à tela inicial antes.",
};

function supportPush() {
  Object.defineProperty(navigator, "serviceWorker", {
    value: { getRegistration: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
  Object.defineProperty(window, "PushManager", { value: function PushManager() {}, configurable: true });
}

function useUserAgent(value: string) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(value);
}

afterEach(() => {
  Reflect.deleteProperty(navigator, "serviceWorker");
  Reflect.deleteProperty(window, "PushManager");
  vi.restoreAllMocks();
});

test("renders nothing without a VAPID public key", () => {
  supportPush();
  const { container } = render(<NotificationsCard {...props} publicKey={null} />);
  expect(container).toBeEmptyDOMElement();
});

test("offers to turn notifications on where push is supported", async () => {
  supportPush();
  render(<NotificationsCard {...props} />);
  expect(await screen.findByRole("button", { name: "Ativar notificações" })).toBeInTheDocument();
  expect(screen.getByText(props.title)).toBeInTheDocument();
});

test("without a session (installed app on iPhone), asks to log in first", async () => {
  supportPush();
  render(<NotificationsCard {...props} loggedIn={false} />);
  expect(await screen.findByRole("link", { name: "Entrar para ativar" })).toHaveAttribute(
    "href",
    "/entrar?voltar=%2Fpainel",
  );
});

test("on iPhone outside the home screen, explains how to add the app", async () => {
  useUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148");
  render(<NotificationsCard {...props} />);
  expect(await screen.findByText(/Adicionar à Tela de Início/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Ativar notificações" })).toBeNull();
});

test("renders nothing in a browser without push (not iPhone)", () => {
  const { container } = render(<NotificationsCard {...props} />);
  expect(container).toBeEmptyDOMElement();
});

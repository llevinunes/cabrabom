import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { ShareLink } from "@/components/ShareLink";

const URL = "https://cabrabom.app/c/abc";

test("without the Web Share API, the share button is a wa.me link with the text and the URL", () => {
  render(<ShareLink url={URL} shareLabel="Enviar para Maria" text="Confirme o serviço no CabraBom:" />);
  const link = screen.getByRole("link", { name: "Enviar para Maria" });
  expect(link.getAttribute("href")).toBe(
    `https://wa.me/?text=${encodeURIComponent(`Confirme o serviço no CabraBom: ${URL}`)}`,
  );
  expect(screen.getByText(URL)).toBeInTheDocument();
});

test("with the Web Share API, tapping shares instead of following the link", () => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
  render(<ShareLink url={URL} shareLabel="Enviar para Maria" text="Confirme o serviço no CabraBom:" />);
  fireEvent.click(screen.getByRole("link", { name: "Enviar para Maria" }));
  expect(share).toHaveBeenCalledWith({ text: "Confirme o serviço no CabraBom:", url: URL });
  Reflect.deleteProperty(navigator, "share");
});

test("copies the link and says so", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  render(<ShareLink url={URL} shareLabel="Enviar para Maria" text="Confirme" />);
  fireEvent.click(screen.getByRole("button", { name: "Copiar link" }));
  expect(writeText).toHaveBeenCalledWith(URL);
  expect(await screen.findByRole("status")).toHaveTextContent("Link copiado");
});

test("an untrusted name in the label is isolated and can wrap", () => {
  const name = "ابراهيم".repeat(10);
  render(
    <ShareLink
      url={URL}
      shareLabel={
        <>
          Enviar para <bdi>{name}</bdi>
        </>
      }
      text="Confirme"
    />,
  );
  const link = screen.getByRole("link", { name: `Enviar para ${name}` });
  expect(link.querySelector("bdi")).toHaveTextContent(name);
  expect(link.className).toContain("[overflow-wrap:anywhere]");
});

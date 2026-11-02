import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { LocationField } from "@/components/LocationField";

afterEach(() => vi.unstubAllGlobals());

test("on an insecure connection it explains why the location is unavailable", () => {
  vi.stubGlobal("isSecureContext", false);
  render(<LocationField label="Onde é o serviço?" />);
  fireEvent.click(screen.getByRole("button", { name: /Usar minha localização/ }));
  expect(screen.getAllByText(/só funciona em conexão segura \(HTTPS\)/).length).toBeGreaterThan(0);
  expect(screen.getByLabelText("CEP")).toBeInTheDocument();
});

test("when the browser refuses, it asks for the CEP", () => {
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("navigator", {
    geolocation: { getCurrentPosition: (_ok: unknown, fail: (e: { code: number }) => void) => fail({ code: 1 }) },
  });
  render(<LocationField label="Onde é o serviço?" />);
  fireEvent.click(screen.getByRole("button", { name: /Usar minha localização/ }));
  expect(screen.getAllByText(/Permita o acesso à localização ou informe o CEP/).length).toBeGreaterThan(0);
});

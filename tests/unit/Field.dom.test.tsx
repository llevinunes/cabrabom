import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { Field } from "@/components/ui/Field";

test("keeps the caller's aria-describedby when there is no error", () => {
  render(<Field id="cep" label="CEP" aria-describedby="cep-hint" />);
  expect(screen.getByLabelText("CEP")).toHaveAttribute("aria-describedby", "cep-hint");
});

test("merges the caller's aria-describedby with the error id", () => {
  render(<Field id="cep" label="CEP" aria-describedby="cep-hint" error="CEP inválido" />);
  const input = screen.getByLabelText("CEP");
  expect(input).toHaveAttribute("aria-describedby", "cep-hint cep-error");
  expect(input).toHaveAttribute("aria-invalid", "true");
});

test("appends the caller's className to the box", () => {
  render(<Field id="nome" label="Seu nome" className="uppercase" />);
  expect(screen.getByLabelText("Seu nome")).toHaveClass("uppercase", "rounded-campo");
});

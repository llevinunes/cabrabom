import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ServiceTimeline } from "@/components/ServiceTimeline";

test("in progress: 'Em andamento' is the current step", () => {
  render(<ServiceTimeline status="in_progress" />);
  expect(screen.getByText("Em andamento").closest("li")).toHaveAttribute("aria-current", "step");
  expect(screen.getByText("Finalizado").closest("li")).not.toHaveAttribute("aria-current");
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
});

test("completed: 'Finalizado' is the current step", () => {
  render(<ServiceTimeline status="completed" />);
  expect(screen.getByText("Finalizado").closest("li")).toHaveAttribute("aria-current", "step");
});

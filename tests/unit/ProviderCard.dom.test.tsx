import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { ProviderCard } from "@/components/ui/ProviderCard";

const joao = {
  name: "João Silva",
  neighborhood: "Centro",
  distanceKm: 1.2,
  busy: false,
  categories: ["Eletricista", "Encanador"],
  recommendationCount: 0,
};

const action = <button>Conversar no WhatsApp</button>;

describe("ProviderCard", () => {
  test("shows name, initials, neighborhood, distance, status and categories", () => {
    render(<ProviderCard provider={joao} chatAction={action} />);
    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText("JS")).toBeInTheDocument();
    expect(screen.getByText("Centro · 1,2 km")).toBeInTheDocument();
    expect(screen.getByText("Livre")).toBeInTheDocument();
    expect(screen.getByText("Eletricista")).toBeInTheDocument();
    expect(screen.getByText("Encanador")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Conversar no WhatsApp" })).toBeInTheDocument();
  });

  test("hides the recommendations line when there are none", () => {
    render(<ProviderCard provider={joao} chatAction={action} />);
    expect(screen.queryByText(/recomend/)).toBeNull();
  });

  test("busy and recommended", () => {
    render(<ProviderCard provider={{ ...joao, busy: true, recommendationCount: 12 }} chatAction={action} />);
    expect(screen.getByText("Ocupado")).toBeInTheDocument();
    expect(screen.getByText("12 pessoas recomendam")).toBeInTheDocument();
  });

  test("a single recommendation is singular", () => {
    render(<ProviderCard provider={{ ...joao, recommendationCount: 1 }} chatAction={action} />);
    expect(screen.getByText("1 pessoa recomenda")).toBeInTheDocument();
  });

  test("without a neighborhood shows only the distance", () => {
    render(<ProviderCard provider={{ ...joao, neighborhood: null }} chatAction={action} />);
    expect(screen.getByText("1,2 km")).toBeInTheDocument();
  });
});

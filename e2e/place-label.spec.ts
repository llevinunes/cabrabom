import { expect, test } from "@playwright/test";
import { createCityOnlyProvider } from "./db";
import { loginWithSimulator } from "./helpers";

test.beforeAll(async () => {
  await createCityOnlyProvider("Tantico Teste", "5585977770001");
});

test("without a neighborhood, results and panel show the city and the state", async ({ page, context }) => {
  await page.goto("/resultados?nome=Maria&categoria=pedreiro&detalhes=Muro&lat=-4.305&lng=-38.996&raio=10");
  const card = page.getByRole("article").filter({ hasText: "Tantico Teste" });
  await expect(card.getByText(/^Mulungu - CE · /)).toBeVisible();

  await page.goto("/painel");
  await loginWithSimulator(page, context, "85 97777-0001");
  await page.waitForURL((url) => url.pathname === "/painel", { timeout: 10_000 });
  await expect(page.getByText("Mulungu - CE")).toBeVisible();
});

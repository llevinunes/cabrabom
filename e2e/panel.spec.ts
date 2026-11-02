import { expect, test } from "@playwright/test";
import { JOAO, createRequestForJoao } from "./db";
import { loginWithSimulator } from "./helpers";

// Unique per run: the worker may restart and run beforeAll again.
const TOKEN = `e2ePainel${Date.now().toString(36)}`.padEnd(24, "0").slice(0, 24);
const CLIENT = "Cliente do Painel";

test.beforeAll(async () => {
  await createRequestForJoao(CLIENT, TOKEN);
});

test("the provider sees pending requests, opens one and switches status", async ({ page, context }) => {
  await page.goto("/painel");
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === "/painel", { timeout: 10_000 });

  await expect(page.getByRole("heading", { name: "Olá, João" })).toBeVisible();
  const card = page.getByRole("listitem").filter({ hasText: CLIENT });
  await expect(card.getByText(`${CLIENT} · Eletricista`)).toBeVisible();
  await expect(card.getByText(/expira em (2 dias|1 dia)/)).toBeVisible();

  const status = page.getByRole("switch", { name: "Livre para novos serviços" });
  await expect(status).toHaveAttribute("aria-checked", "true");
  await status.click();
  await expect(page.getByRole("switch", { name: "Ocupado no momento" })).toHaveAttribute("aria-checked", "false");
  await page.getByRole("switch", { name: "Ocupado no momento" }).click();
  await expect(page.getByRole("switch", { name: "Livre para novos serviços" })).toBeVisible();

  await card.getByRole("link", { name: "Ver pedido" }).click();
  await expect(page).toHaveURL(new RegExp(`/s/${TOKEN}$`));
  await expect(page.getByRole("heading", { name: "Nova solicitação" })).toBeVisible();
  await expect(page.getByRole("heading", { name: CLIENT })).toBeVisible();
  await expect(page.getByText("Trocar a fiação da cozinha")).toBeVisible();
  await expect(page.getByText("A cerca de 1,2 km de você")).toBeVisible();
});

test("another number cannot see the request", async ({ page, context }) => {
  await page.goto(`/s/${TOKEN}`);
  await loginWithSimulator(page, context, "83 95555-1212");
  await page.waitForURL((url) => url.pathname === `/s/${TOKEN}`, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Este pedido é de outro prestador" })).toBeVisible();
  await expect(page.getByText(CLIENT)).toHaveCount(0);
  await expect(page.getByText("Trocar a fiação")).toHaveCount(0);
});

test("the provider can change where they work", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: -7.2307, longitude: -35.8811 });
  await page.goto("/painel/localizacao");
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === "/painel/localizacao", { timeout: 10_000 });
  await page.getByRole("button", { name: /Usar minha localização/ }).click();
  await expect(page.getByRole("button", { name: /Localização definida/ })).toBeVisible();
  await page.getByRole("button", { name: "Salvar localização" }).click();
  await page.waitForURL((url) => url.pathname === "/painel", { timeout: 10_000 });
  await expect(page.getByText("Onde você atende")).toBeVisible();
});

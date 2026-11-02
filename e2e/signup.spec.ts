import { expect, test } from "@playwright/test";
import { loginWithSimulator } from "./helpers";

test.use({ geolocation: { latitude: -7.22, longitude: -35.9 }, permissions: ["geolocation"] });

test("a provider signs up with GPS and WhatsApp and lands on the panel", async ({ page, context }) => {
  await page.goto("/prestador");
  await expect(page.getByRole("heading", { name: "Mostre seu trabalho para quem precisa" })).toBeVisible();

  await page.getByLabel("Seu nome").fill("Pedro Teste");
  await page.getByText("Encanador").click();
  await page.getByRole("button", { name: /Usar minha localização/ }).click();
  await expect(page.getByText("Localização definida")).toBeVisible();
  await page.getByText("Aceito que meu WhatsApp apareça").click();
  await page.getByRole("button", { name: "Continuar com WhatsApp" }).click();

  await page.waitForURL(/\/entrar\?/);
  expect(new URL(page.url()).searchParams.get("voltar")).toBe("/prestador/concluir");
  await loginWithSimulator(page, context, "83 98888-7777");

  await expect(page).toHaveURL(/\/painel$/, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Olá, Pedro" })).toBeVisible();

  // A registered provider who opens /prestador again goes straight to the panel
  await page.goto("/prestador");
  await expect(page).toHaveURL(/\/painel$/);
});

test("shows what is missing and keeps what was typed", async ({ page }) => {
  await page.goto("/prestador");
  await page.getByLabel("Seu nome").fill("Pedro");
  await page.getByRole("button", { name: "Continuar com WhatsApp" }).click();

  await expect(page.getByText("Escolha pelo menos uma categoria")).toBeVisible();
  await expect(page.getByText("Informe onde você atende")).toBeVisible();
  await expect(page.getByText("Marque a caixa para continuar")).toBeVisible();
  await expect(page.getByLabel("Seu nome")).toHaveValue("Pedro");
});

test("an unknown CEP is reported on the form", async ({ page }) => {
  await page.goto("/prestador");
  await page.getByLabel("Seu nome").fill("Pedro");
  await page.getByText("Pintor").click();
  await page.getByRole("button", { name: "Informar o CEP" }).click();
  await page.getByLabel("CEP").fill("00000-000");
  await page.getByText("Aceito que meu WhatsApp apareça").click();
  await page.getByRole("button", { name: "Continuar com WhatsApp" }).click();
  await expect(page.getByText("Não encontramos esse CEP. Tente usar sua localização.")).toBeVisible();
});

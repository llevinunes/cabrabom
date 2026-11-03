import { expect, test } from "@playwright/test";
import { JOAO, clearJoaoRecommendations, createCompletedRequestForJoao } from "./db";
import { loginWithSimulator } from "./helpers";

const run = Date.now().toString(36);
const token = (prefix: string) => `${prefix}${run}`.padEnd(24, "0").slice(0, 24);
const DONE = { provider: token("e2eRecP"), client: token("e2eRecC") };
const SOON = { provider: token("e2eCedoP"), client: token("e2eCedoC") };
const COMMENT = `Caprichou muito ${run}`;

test.beforeAll(async () => {
  await clearJoaoRecommendations();
  await createCompletedRequestForJoao(`Maria Recomenda ${run}`, DONE.provider, DONE.client, 120);
  await createCompletedRequestForJoao(`Ana Cedo ${run}`, SOON.provider, SOON.client, 30);
});
test.afterAll(clearJoaoRecommendations);

test("the client recommends João and it shows on his profile", async ({ page, context }) => {
  await page.goto(`/r/${DONE.client}`);
  await page.getByRole("link", { name: "Entrar com WhatsApp" }).click();
  await loginWithSimulator(page, context, "83 98888-7777");
  await page.waitForURL((url) => url.pathname === `/r/${DONE.client}`, { timeout: 15_000 });

  await expect(page.getByRole("heading", { name: "Recomendar João" })).toBeVisible();
  await expect(page.getByText("Eletricista · serviço finalizado")).toBeVisible();
  await page.getByText("Pontual", { exact: true }).click();
  await page.getByText("Caprichoso", { exact: true }).click();
  await page.getByLabel("Comentário (opcional)").fill(COMMENT);
  await expect(page.getByText("Sua recomendação aparece no perfil com seu primeiro nome. Seu número nunca é exibido.")).toBeVisible();
  await page.getByRole("button", { name: "Enviar recomendação" }).click();
  await expect(page.getByRole("heading", { name: "Obrigado pela recomendação!" })).toBeVisible({ timeout: 15_000 });

  await page.goto(`/p/${JOAO.id}`);
  await expect(page.getByText("1 pessoa recomenda · Pontual (1) · Caprichoso (1)")).toBeVisible();
  await expect(page.getByText(COMMENT)).toBeVisible();
  await expect(page.getByText("Maria", { exact: true })).toBeVisible();
});

test("before one hour after confirming, the page says when it opens", async ({ page, context }) => {
  await page.goto(`/entrar?voltar=/r/${SOON.client}`);
  await loginWithSimulator(page, context, "83 98888-7777");
  await page.waitForURL((url) => url.pathname === `/r/${SOON.client}`, { timeout: 15_000 });
  await expect(page.getByText(/Você poderá recomendar a partir das \d{2}:\d{2}/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar recomendação" })).toHaveCount(0);
});

test("another number cannot recommend", async ({ page, context }) => {
  await page.goto(`/entrar?voltar=/r/${SOON.client}`);
  await loginWithSimulator(page, context, "83 97777-6666");
  await page.waitForURL((url) => url.pathname === `/r/${SOON.client}`, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Esta recomendação é de outro número" })).toBeVisible();
});

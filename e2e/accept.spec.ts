import { expect, test } from "@playwright/test";
import { JOAO, createRequestForJoao } from "./db";
import { loginWithSimulator } from "./helpers";

// Unique per run: the worker may restart and run beforeAll again.
const TOKEN = `e2eAceitar${Date.now().toString(36)}`.padEnd(24, "0").slice(0, 24);
const CLIENT = `Maria Aceite ${Date.now().toString(36)}`;

test.beforeAll(async () => {
  await createRequestForJoao(CLIENT, TOKEN);
});

test("the provider accepts a request and gets the link for the client", async ({ page, context }) => {
  await page.goto(`/s/${TOKEN}`);
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === `/s/${TOKEN}`, { timeout: 10_000 });

  await page.getByRole("button", { name: "Aceitar serviço" }).click();
  await expect(page.getByRole("heading", { name: "Serviço aceito!" })).toBeVisible();
  await expect(page.getByText(/\/c\/[A-Za-z0-9_-]{24}$/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Enviar para Maria" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copiar link" })).toBeVisible();

  // The provider may lose the link: opening the request again shows it again.
  await page.reload();
  await expect(page.getByRole("heading", { name: "Serviço aceito!" })).toBeVisible();

  await page.goto("/painel");
  const waiting = page.getByRole("region", { name: "Esperando o cliente confirmar" });
  await expect(waiting.getByText(`${CLIENT} · Eletricista`)).toBeVisible();
  await expect(waiting.getByRole("link", { name: "Reenviar link" })).toHaveAttribute("href", `/s/${TOKEN}`);
});

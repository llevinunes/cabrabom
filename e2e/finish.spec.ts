import { expect, test } from "@playwright/test";
import { JOAO, createInProgressRequestForJoao, requestStatus, setJoaoFree } from "./db";
import { loginWithSimulator } from "./helpers";

const run = Date.now().toString(36);
const token = (prefix: string) => `${prefix}${run}`.padEnd(24, "0").slice(0, 24);
const FINISH = { provider: token("e2eFimP"), client: token("e2eFimC") };
const CANCEL = { provider: token("e2eCanP"), client: token("e2eCanC") };
const FINISHED_CLIENT = `Maria Fim ${run}`;
const CANCELLED_CLIENT = `Pedro Cancela ${run}`;

test.beforeAll(setJoaoFree);
test.afterAll(setJoaoFree);

test("the provider finishes a service and asks for a recommendation", async ({ page, context }) => {
  await createInProgressRequestForJoao(FINISHED_CLIENT, FINISH.provider, FINISH.client);
  await page.goto("/painel");
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === "/painel", { timeout: 10_000 });

  const inProgress = page.getByRole("region", { name: "Em andamento" });
  const card = inProgress.getByRole("listitem").filter({ hasText: FINISHED_CLIENT });
  await expect(card.getByText(`${FINISHED_CLIENT} · Eletricista`)).toBeVisible();
  await expect(card.getByText("confirmado hoje")).toBeVisible();
  await expect(card.getByText("Trocar a fiação da cozinha")).toBeVisible();
  await expect(page.getByRole("switch", { name: "Livre para novos serviços" })).toHaveAttribute("aria-checked", "false");

  await card.getByRole("button", { name: "Finalizar serviço" }).click();
  await expect(card).toHaveCount(0, { timeout: 15_000 });
  const ask = page.getByRole("region", { name: "Peça uma recomendação" });
  await expect(ask.getByText(FINISHED_CLIENT)).toBeVisible();
  await expect(ask.getByRole("link", { name: "Enviar link de recomendação" })).toBeVisible();
  await expect(page.getByRole("switch", { name: "Livre para novos serviços" })).toHaveAttribute("aria-checked", "true");
  expect((await requestStatus(FINISH.provider))!.status).toBe("completed");
});

test("the provider cancels a service in progress and is free again", async ({ page, context }) => {
  await createInProgressRequestForJoao(CANCELLED_CLIENT, CANCEL.provider, CANCEL.client);
  await page.goto("/painel");
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === "/painel", { timeout: 10_000 });

  const card = page.getByRole("region", { name: "Em andamento" }).getByRole("listitem").filter({ hasText: CANCELLED_CLIENT });
  await card.getByRole("button", { name: "Cancelar" }).click();
  await expect(card).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByRole("switch", { name: "Livre para novos serviços" })).toHaveAttribute("aria-checked", "true");
  expect((await requestStatus(CANCEL.provider))!.status).toBe("cancelled");
});

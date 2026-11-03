import { expect, test } from "@playwright/test";
import { JOAO, createAcceptedRequestForJoao, joaoIsBusy, requestStatus, setJoaoFree } from "./db";
import { loginWithSimulator } from "./helpers";

const run = Date.now().toString(36);
const token = (prefix: string) => `${prefix}${run}`.padEnd(24, "0").slice(0, 24);
const CONFIRM = { provider: token("e2eConfP"), client: token("e2eConfC") };
const OWN = { provider: token("e2eOwnP"), client: token("e2eOwnC") };
const CLIENT = `Maria Confirma ${run}`;

test.beforeAll(async () => {
  await createAcceptedRequestForJoao(CLIENT, CONFIRM.provider, CONFIRM.client);
  await createAcceptedRequestForJoao(`Outra ${run}`, OWN.provider, OWN.client);
});

test.afterAll(setJoaoFree);

test.describe.configure({ mode: "serial" });

test("the client confirms in one tap and lands on the service screen", async ({ page, context }) => {
  await page.goto(`/c/${CONFIRM.client}`);
  await expect(page.getByRole("heading", { name: "João aceitou seu pedido!" })).toBeVisible();
  await expect(page.getByText("Trocar a fiação da cozinha")).toBeVisible();

  await page.getByRole("button", { name: "Confirmar com WhatsApp" }).click();
  await page.waitForURL((url) => url.pathname === "/entrar", { timeout: 15_000 });
  await loginWithSimulator(page, context, "83 98888-7777");
  await page.waitForURL((url) => url.pathname === `/c/${CONFIRM.client}`, { timeout: 15_000 });

  await expect(page.getByRole("heading", { name: "Seu serviço" })).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toHaveText(/Em andamento/);
  expect(await requestStatus(CONFIRM.provider)).toEqual({ status: "in_progress", client_phone: "5583988887777" });
  expect(await joaoIsBusy()).toBe(true);
});

test("another number opening the link after confirmation sees it belongs to someone else", async ({ page, context }) => {
  await page.goto(`/entrar?voltar=/c/${CONFIRM.client}`);
  await loginWithSimulator(page, context, "83 97777-6666");
  await page.waitForURL((url) => url.pathname === `/c/${CONFIRM.client}`, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Este serviço é de outro número" })).toBeVisible();
  await expect(page.getByText("Trocar a fiação")).toHaveCount(0);
  expect((await requestStatus(CONFIRM.provider))!.client_phone).toBe("5583988887777");
});

test("the provider cannot confirm their own service", async ({ page, context }) => {
  await page.goto(`/entrar?voltar=/c/${OWN.client}`);
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === `/c/${OWN.client}`, { timeout: 15_000 });
  await page.getByRole("button", { name: "Confirmar com WhatsApp" }).click();
  await expect(page.getByText("Você não pode confirmar o próprio serviço")).toBeVisible({ timeout: 15_000 });
  expect((await requestStatus(OWN.provider))!.status).toBe("accepted");
});

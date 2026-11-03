import { expect, test } from "@playwright/test";
import { JOAO, createAcceptedRequestForJoao, testDb } from "./db";
import { loginWithSimulator } from "./helpers";

test("anyone can report a problem from a provider's profile", async ({ page }) => {
  const description = `Não apareceu no horário ${Date.now().toString(36)}`;
  await page.goto(`/p/${JOAO.id}`);
  await page.getByRole("link", { name: "Relatar problema" }).click();
  await expect(page.getByRole("heading", { name: "Relatar problema" })).toBeVisible();
  await expect(page.getByText("Conte o que aconteceu. Só a equipe do CabraBom vê esta mensagem.")).toBeVisible();
  await page.getByLabel("O que aconteceu?").fill(description);
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText("Recebemos seu relato. Obrigado por avisar.")).toBeVisible({ timeout: 15_000 });

  const { data } = await testDb().from("reports").select("provider_id").eq("description", description).single();
  expect(data!.provider_id).toBe(JOAO.id);
});

test("the service links keep the report link after the service ends", async ({ page, context }) => {
  const run = Date.now().toString(36);
  const providerToken = `e2eRelP${run}`.padEnd(24, "0").slice(0, 24);
  const clientToken = `e2eRelC${run}`.padEnd(24, "0").slice(0, 24);
  await createAcceptedRequestForJoao(`Maria Relata ${run}`, providerToken, clientToken);

  await testDb().from("service_requests").update({ status: "cancelled" }).eq("provider_token", providerToken);
  await page.goto(`/c/${clientToken}`);
  await expect(page.getByRole("heading", { name: "Este serviço foi cancelado" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Relatar problema" })).toHaveAttribute("href", `/relatar?pedido=${clientToken}`);

  await page.goto(`/entrar?voltar=/s/${providerToken}`);
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === `/s/${providerToken}`, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Serviço cancelado" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Relatar problema" })).toHaveAttribute("href", `/relatar?pedido=${providerToken}`);
});

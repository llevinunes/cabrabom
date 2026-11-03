import { expect, test } from "@playwright/test";
import { JOAO, testDb } from "./db";

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

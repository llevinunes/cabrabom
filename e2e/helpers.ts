import { expect, type BrowserContext, type Page } from "@playwright/test";
import { testDb } from "./db";

/** Completes the WhatsApp login on /entrar using the development simulator. */
export async function loginWithSimulator(page: Page, context: BrowserContext, phone: string) {
  // Every login of the suite comes from the same IP: keep it under the per-IP code limit.
  const { error } = await testDb().from("rate_limit_hits").delete().like("key", "code:%");
  if (error) throw error;
  await page.getByRole("button", { name: "Entrar com WhatsApp" }).click();
  const href = (await page.getByRole("link", { name: "Abrir o WhatsApp" }).getAttribute("href"))!;
  const code = href.slice(-5);

  const simulator = await context.newPage();
  await simulator.goto("/dev/whatsapp");
  await simulator.getByLabel("Número").fill(phone);
  await simulator.getByLabel("Mensagem").fill(`ENTRAR ${code}`);
  await simulator.getByRole("button", { name: "Simular envio" }).click();
  await expect(simulator.getByRole("status")).toHaveText("Código confirmado.");
  await simulator.close();
}

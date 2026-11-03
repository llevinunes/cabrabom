import { expect, test, type BrowserContext, type Page } from "@playwright/test";

async function startLogin(page: Page): Promise<string> {
  await page.getByRole("button", { name: "Entrar com WhatsApp" }).click();
  const link = page.getByRole("link", { name: "Abrir o WhatsApp" });
  const href = (await link.getAttribute("href"))!;
  expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=ENTRAR%20[A-Z2-9]{5}$/);
  return href.slice(-5);
}

async function simulate(context: BrowserContext, text: string) {
  const simulator = await context.newPage();
  await simulator.goto("/dev/whatsapp");
  await simulator.getByLabel("Número").fill("83 99999-0000");
  await simulator.getByLabel("Mensagem").fill(text);
  await simulator.getByRole("button", { name: "Simular envio" }).click();
  return simulator;
}

test("logs in with the WhatsApp simulator and returns to the page that asked for it", async ({ page, context }) => {
  await page.goto("/painel");
  await expect(page).toHaveURL(/\/entrar\?voltar=%2Fpainel$/);

  const code = await startLogin(page);
  await expect(page.getByRole("status")).toContainText("Aguardando sua mensagem");
  await expect(page.getByRole("status")).toContainText("Só envie a mensagem se foi você que pediu");

  const simulator = await simulate(context, `ENTRAR ${code}`);
  await expect(simulator.getByRole("status")).toHaveText("Código confirmado.");

  // Back on /painel, which sends a phone that is not a provider yet to the signup page.
  await expect(page).toHaveURL(/\/prestador$/, { timeout: 10_000 });
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "session")?.httpOnly).toBe(true);
});

test("coming back to the page keeps the same code", async ({ page }) => {
  await page.goto("/entrar");
  const first = await startLogin(page);
  await page.reload();
  expect(await startLogin(page)).toBe(first);
});

test("a message with the wrong code does not log in", async ({ page, context }) => {
  await page.goto("/entrar");
  await startLogin(page);

  const simulator = await simulate(context, "ENTRAR ZZZZZ");
  await expect(simulator.getByRole("status")).toHaveText("Nenhum código válido nessa mensagem.");

  await page.waitForTimeout(2500);
  await expect(page).toHaveURL(/\/entrar$/);
});

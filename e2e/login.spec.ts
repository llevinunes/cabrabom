import { expect, test } from "@playwright/test";

test("logs in with the WhatsApp simulator and returns to the protected page", async ({ page, context }) => {
  await context.route("**://wa.me/**", (route) => route.abort());

  await page.goto("/painel");
  await expect(page).toHaveURL(/\/entrar\?voltar=%2Fpainel$/);

  await page.getByRole("button", { name: "Entrar com WhatsApp" }).click();
  const status = page.getByRole("status");
  await expect(status).toContainText("Aguardando sua mensagem");
  const code = (await status.locator("strong").first().textContent())!.replace("ENTRAR ", "");

  const simulator = await context.newPage();
  await simulator.goto(`/dev/whatsapp?codigo=${code}`);
  await simulator.getByLabel("Número").fill("83 99999-0000");
  await simulator.getByRole("button", { name: "Simular envio" }).click();
  await expect(simulator.getByRole("status")).toHaveText("Código confirmado.");

  await expect(page).toHaveURL(/\/painel$/, { timeout: 10_000 });
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "session")?.httpOnly).toBe(true);
});

test("a code sent with the wrong text does not log in", async ({ page, context }) => {
  await context.route("**://wa.me/**", (route) => route.abort());
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Entrar com WhatsApp" }).click();
  await expect(page.getByRole("status")).toContainText("Aguardando sua mensagem");

  const simulator = await context.newPage();
  await simulator.goto("/dev/whatsapp");
  await simulator.getByLabel("Número").fill("83 99999-0000");
  await simulator.getByLabel("Mensagem").fill("ENTRAR ZZZZZ");
  await simulator.getByRole("button", { name: "Simular envio" }).click();
  await expect(simulator.getByRole("status")).toHaveText("Nenhum código válido nessa mensagem.");

  await page.waitForTimeout(2500);
  await expect(page).toHaveURL(/\/entrar$/);
});

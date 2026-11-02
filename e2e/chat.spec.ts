import { expect, test, type BrowserContext } from "@playwright/test";

const JOAO = "00000000-0000-4000-8000-000000000001";

/** Captures the wa.me URL the app redirects to, without leaving for WhatsApp. */
async function captureWhatsApp(context: BrowserContext) {
  let url = "";
  await context.route("**://wa.me/**", (route) => {
    url = route.request().url();
    return route.abort();
  });
  return () => url;
}

test.use({ geolocation: { latitude: -7.2307, longitude: -35.8811 }, permissions: ["geolocation"] });

test("from the results, Conversar opens WhatsApp with the ready-made message", async ({ page, context }) => {
  const whatsapp = await captureWhatsApp(context);
  await page.goto(
    "/resultados?nome=Maria&categoria=eletricista&detalhes=Trocar%20a%20fia%C3%A7%C3%A3o&lat=-7.2307&lng=-35.8811&raio=10",
  );
  await page.getByRole("article").filter({ hasText: "João Silva" }).getByRole("button", { name: "Conversar no WhatsApp" }).click();

  await expect.poll(whatsapp).toContain("https://wa.me/5583900000001?text=");
  const message = decodeURIComponent(whatsapp().split("?text=")[1]);
  expect(message).toContain("Olá, João Silva! Encontrei você no CabraBom.");
  expect(message).toContain("Meu nome é Maria e preciso de um serviço de *Eletricista*.");
  expect(message).toContain("Detalhes: Trocar a fiação");
  expect(message).toMatch(/Para aceitar pelo CabraBom: http:\/\/localhost:3000\/s\/[A-Za-z0-9_-]{24}$/);
});

test("the profile shows the provider and keeps the search for Conversar", async ({ page, context }) => {
  const whatsapp = await captureWhatsApp(context);
  await page.goto(`/p/${JOAO}?nome=Maria&categoria=encanador&detalhes=Vazamento&lat=-7.2307&lng=-35.8811&raio=10`);
  await expect(page.getByRole("heading", { name: "João Silva" })).toBeVisible();
  await expect(page.getByText("Centro · 1,2 km de você")).toBeVisible();
  await expect(page.getByText("Livre agora")).toBeVisible();
  await expect(page.getByText("8 anos")).toBeVisible();
  await page.getByRole("button", { name: "Conversar no WhatsApp" }).click();
  await expect.poll(whatsapp).toContain("Encanador");
});

test("a shared profile link asks for the missing details first", async ({ page, context }) => {
  const whatsapp = await captureWhatsApp(context);
  await page.goto(`/p/${JOAO}`);
  await page.getByRole("link", { name: "Conversar no WhatsApp" }).click();

  await expect(page.getByRole("heading", { name: "Conversar com João" })).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(2);
  await expect(page.getByRole("radio", { name: "Eletricista" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Encanador" })).toBeVisible();

  await page.getByRole("button", { name: "Conversar no WhatsApp" }).click();
  await expect(page.getByText("Informe seu nome")).toBeVisible();

  await page.getByLabel("Seu nome").fill("Ana");
  await page.getByText("Encanador").click();
  await page.getByLabel("Detalhes do serviço").fill("Pia entupida");
  await page.getByRole("button", { name: "Conversar no WhatsApp" }).click();
  await expect.poll(whatsapp).toContain("Meu%20nome%20%C3%A9%20Ana");
});

test("an unknown provider is a 404", async ({ page }) => {
  const response = await page.goto("/p/00000000-0000-4000-8000-000000000099");
  expect(response?.status()).toBe(404);
});

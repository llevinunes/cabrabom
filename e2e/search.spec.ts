import { expect, test } from "@playwright/test";

test.use({ geolocation: { latitude: -7.2307, longitude: -35.8811 }, permissions: ["geolocation"] });

test("a client searches without login and sees free providers first", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Sou prestador" })).toBeVisible();

  await page.getByLabel("Seu nome").fill("Maria");
  await page.getByText("Eletricista", { exact: true }).click();
  await page.getByLabel("Detalhes do serviço").fill("Trocar a fiação da cozinha");
  await page.getByRole("button", { name: /Usar minha localização/ }).click();
  await expect(page.getByRole("button", { name: /Localização definida/ })).toBeVisible();
  await page.getByRole("button", { name: "Buscar prestadores" }).click();

  await page.waitForURL((url) => url.pathname === "/resultados");
  await expect(page.getByRole("heading", { name: "Eletricista" })).toBeVisible();
  await expect(page.getByText("Até 10 km de você · 3 encontrados")).toBeVisible();
  const names = page.getByRole("article").getByRole("heading");
  await expect(names).toHaveText(["João Silva", "Antônio Ferreira", "Raimundo Costa"]);

  await page.getByRole("link", { name: "Só livres" }).click();
  await expect(page.getByRole("link", { name: "Só livres, ativado" })).toBeVisible();
  await expect(names).toHaveText(["João Silva", "Antônio Ferreira"]);
  expect(new URL(page.url()).searchParams.get("lat")).toBe("-7.231");
  await expect(page.getByText("Até 10 km de você · 2 encontrados")).toBeVisible();

  await page.getByRole("link", { name: /Raio de 10 km/ }).click();
  await expect(page.getByText(/Até 25 km de você/)).toBeVisible();
});

test("the search form explains what is missing", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Buscar prestadores" }).click();
  await expect(page.getByText("Informe seu nome")).toBeVisible();
  await expect(page.getByText("Escolha uma categoria")).toBeVisible();
  await expect(page.getByText("Descreva o serviço")).toBeVisible();
  await expect(page.getByText("Informe onde é o serviço")).toBeVisible();
});

test("broken result links go back to the search", async ({ page }) => {
  await page.goto("/resultados?nome=Maria&categoria=eletricista&detalhes=x&raio=10");
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/resultados?nome=Maria&categoria=astronauta&detalhes=x&lat=-7.2&lng=-35.8");
  await expect(page).toHaveURL(/\/$/);
});

test("an empty result suggests a wider radius", async ({ page }) => {
  await page.goto("/resultados?nome=Maria&categoria=pintor&detalhes=x&lat=-7.2307&lng=-35.8811&raio=10");
  await expect(page.getByText("Nenhum prestador encontrado até 10 km. Tente aumentar o raio.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar até 25 km" })).toBeVisible();
});

test("pages tell browsers not to send our URLs to other sites", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.headers()["referrer-policy"]).toBe("same-origin");
});

test("the CEP field formats as it is typed and stops at 8 digits", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Informar o CEP" }).click();
  const cep = page.getByLabel("CEP");
  await expect(cep).toBeFocused();
  await cep.pressSequentially("584000001234");
  await expect(cep).toHaveValue("58400-000");
  await cep.fill("");
  await cep.pressSequentially("58.4a00");
  await expect(cep).toHaveValue("58400");
});

test("tapping anywhere on a provider card opens the profile, except the WhatsApp button", async ({ page }) => {
  const results = "/resultados?nome=Maria&categoria=eletricista&detalhes=x&lat=-7.2307&lng=-35.8811&raio=10";
  await page.goto(results);
  // A real tap at a spot of the card: whatever is on top there receives it.
  const tapOn = async (text: string) => {
    const box = (await page.getByRole("article").filter({ hasText: "João Silva" }).getByText(text).boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  };

  await tapOn("Encanador");
  await expect(page).toHaveURL(/\/p\/00000000-0000-4000-8000-000000000001\?/);

  await page.goto(results);
  await tapOn("JS"); // the avatar
  await expect(page).toHaveURL(/\/p\/00000000-0000-4000-8000-000000000001\?/);
});

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
  await expect(names).toHaveText(["João Silva", "Antônio Ferreira"]);
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

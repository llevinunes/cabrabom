import { test } from "@playwright/test";
import { JOAO, createRequestForJoao } from "./db";
import { loginWithSimulator } from "./helpers";

// Not part of `npm run test:e2e`: `npm run screenshots` regenerates docs/imagens for the README.
test.use({ geolocation: { latitude: -7.2307, longitude: -35.8811 }, permissions: ["geolocation"] });

const SEARCH = "nome=Maria&categoria=eletricista&detalhes=Trocar%20a%20fia%C3%A7%C3%A3o%20da%20cozinha&lat=-7.231&lng=-35.881&raio=10";
const shot = (name: string) => ({ path: `docs/imagens/${name}.png`, fullPage: false });

test("screens for the README", async ({ page, context }) => {
  await context.route("**://wa.me/**", (route) => route.abort());
  const token = `e2eShots${Date.now().toString(36)}`.padEnd(24, "0").slice(0, 24);
  await createRequestForJoao("Maria", token);

  await page.goto("/");
  await page.screenshot(shot("01-busca"));
  await page.goto(`/resultados?${SEARCH}`);
  await page.screenshot(shot("02-resultados"));
  await page.goto(`/p/${JOAO.id}?${SEARCH}`);
  await page.screenshot(shot("03-perfil"));
  await page.goto("/prestador");
  await page.screenshot(shot("07-cadastro"));

  await page.goto("/painel");
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === "/painel");
  await page.screenshot(shot("10-painel"));
  await page.goto(`/s/${token}`);
  await page.screenshot(shot("08-pedido"));
});

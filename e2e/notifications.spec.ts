import { expect, test } from "@playwright/test";
import { JOAO } from "./db";
import { loginWithSimulator } from "./helpers";

test("the provider sees the card to turn notifications on, and the service worker is served", async ({ page, context, request }) => {
  await page.goto("/painel");
  await loginWithSimulator(page, context, JOAO.phone);
  await page.waitForURL((url) => url.pathname === "/painel", { timeout: 10_000 });

  await expect(page.getByRole("heading", { name: "Quer saber quando chegar um pedido?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ativar notificações" })).toBeVisible();

  const worker = await request.get("/sw.js");
  expect(worker.status()).toBe(200);
  expect(worker.headers()["cache-control"]).toBe("no-cache");
  expect(await worker.text()).toContain("showNotification");
});

test("the subscribe endpoint refuses requests without a session", async ({ request }) => {
  const response = await request.post("/api/push/inscrever", {
    data: { endpoint: "https://push.example/x", keys: { p256dh: "p", auth: "a" } },
  });
  expect(response.status()).toBe(401);
});

import { expect, test } from "@playwright/test";

test("a política de privacidade abre sem login e mostra o contato", async ({ page }) => {
  await page.goto("/privacidade");
  await expect(page.getByRole("heading", { name: "Política de privacidade" })).toBeVisible();
  await expect(page.getByRole("link", { name: "llevinsousa@gmail.com" })).toHaveAttribute(
    "href",
    "mailto:llevinsousa@gmail.com",
  );
});

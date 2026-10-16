import { expect, test } from "@playwright/test"

test("abre a home da liga", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Gestão da liga, do mercado à classificação" })).toBeVisible()
})

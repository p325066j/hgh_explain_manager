import { expect, test } from "@playwright/test";

test("home shows staff and patient entry points", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "スタッフ向けコンソール" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "患者向け再生画面" })).toBeVisible();
});

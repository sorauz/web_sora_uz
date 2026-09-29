import { test, expect } from "@playwright/test";

test.describe("FAZA 0: i18n and Foundation Tests", () => {
  test("renders /uz page with Uzbek content", async ({ page }) => {
    await page.goto("/uz");
    await expect(page).toHaveTitle(/Sora\.uz/);
    await expect(page.locator("h1")).toContainText("Sora.uz — Zamonaviy E-Commerce");
    await expect(page.getByText("Kategoriyalar soni")).toBeVisible();
    await expect(page.getByText("Plastik prujinali bog‘lash mashinasi Deli 3871")).toBeVisible();
  });

  test("renders /ru page with Russian content", async ({ page }) => {
    await page.goto("/ru");
    await expect(page).toHaveTitle(/Sora\.uz/);
    await expect(page.locator("h1")).toContainText("Sora.uz — Современная платформа");
    await expect(page.getByText("Количество категорий")).toBeVisible();
    await expect(page.getByText("Машина для скрепления пластиковых пружин Deli 3871")).toBeVisible();
  });

  test("language switcher navigates between uz and ru", async ({ page }) => {
    await page.goto("/uz");
    await expect(page.locator("h1")).toContainText("Zamonaviy");
    
    // Click Russian
    await page.click("text=Русский");
    await page.waitForURL("**/ru");
    await expect(page.locator("h1")).toContainText("Современная");
  });
});

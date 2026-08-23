import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "demo-aday@imeceburada.com", password: "Deneme123!" };

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.fill('input[type="email"]', CANDIDATE.email);
  await page.fill('input[type="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"));
}

test.describe("Favorites", () => {
  test("logged-in candidate sees the account menu and can add/remove a favorite", async ({ page }) => {
    await login(page);

    await page.goto("/");
    await page.getByRole("button", { name: /Hesabım/i }).click();
    await expect(page.getByRole("link", { name: "Favorilerim" })).toBeVisible();

    await page.goto("/jobs");
    const favoriteButton = page.locator('button[aria-label="Favorilere ekle"]').first();
    await favoriteButton.click();
    await expect(page.locator('button[aria-label="Favorilerden çıkar"]').first()).toBeVisible();

    await page.goto("/favorites");
    await expect(page.getByText("Henüz favori ilanın yok")).not.toBeVisible();
    await expect(page.locator("a[href^='/jobs/']").first()).toBeVisible();

    // clean up so the seed account is left in its original state
    await page.locator('button[aria-label="Favorilerden çıkar"]').first().click();
    await expect(page.getByText("Henüz favori ilanın yok")).toBeVisible();
  });
});

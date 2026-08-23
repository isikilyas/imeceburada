import { test, expect } from "@playwright/test";

test.describe("Marketplace smoke", () => {
  test("marketplace homepage loads with the header nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.getByRole("link", { name: "İlanlar" }).first()).toBeVisible();
  });

  test("job listings page renders seeded jobs", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.getByText("Sonuç bulunamadı.")).not.toBeVisible();
    await expect(page.locator("a[href^='/jobs/']").first()).toBeVisible();
  });
});

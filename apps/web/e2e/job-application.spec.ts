import { test, expect } from "@playwright/test";

const CANDIDATE = { email: "demo-aday@bau360.com", password: "Deneme123!" };
// Regression target: this seed job's id previously had a malformed v4 UUID
// (version/variant nibbles in the wrong dash-group), which made class-validator's
// @IsUUID() reject every application to any seeded job with a 400 error.
const SEED_JOB_ID = "00000000-0000-4000-8000-000000000012";

test("applying to a job never fails on UUID validation", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', CANDIDATE.email);
  await page.fill('input[type="password"]', CANDIDATE.password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"));

  await page.goto(`/jobs/${SEED_JOB_ID}`);
  await page.getByRole("button", { name: "Başvur" }).click();

  const success = page.getByText("Başvurun alındı!");
  const alreadyApplied = page.getByText("Bu ilana zaten başvurdunuz");
  await expect(success.or(alreadyApplied)).toBeVisible({ timeout: 10_000 });

  const uuidError = page.getByText(/uuid/i);
  await expect(uuidError).toHaveCount(0);
});

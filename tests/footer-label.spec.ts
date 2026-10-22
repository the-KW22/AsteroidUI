import { expect, test } from "@playwright/test";

for (const route of ["/components/button", "/components/input", "/getting-started"]) {
  test(`${route} footer names the visible license link`, async ({ page }) => {
    await page.goto(route);
    const license = page.locator('footer a[href="/license"]').filter({ hasText: "MIT licensed" });
    await expect(license).toHaveCount(1);
    await expect(license).toHaveAccessibleName("MIT licensed");
  });
}

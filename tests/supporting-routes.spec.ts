import { expect, test } from "@playwright/test";

test("license keeps the distributed legal text accessible in the dark shell", async ({ page }) => {
  await page.goto("/license");
  await expect(page.getByRole("heading", { name: "MIT License", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Third-party notices" })).toBeVisible();
  await expect(page.getByText("GSAP is not licensed under this project's MIT license.", { exact: false })).toBeVisible();
  await expect(page.locator("main")).toHaveCSS("background-color", "rgb(17, 17, 17)");
});

test("unknown pages offer working recovery links", async ({ page }) => {
  const response = await page.goto("/not-a-component-or-guide");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore components" })).toHaveAttribute("href", "/components");
  await expect(page.getByRole("link", { name: "Back home" })).toHaveAttribute("href", "/");
});

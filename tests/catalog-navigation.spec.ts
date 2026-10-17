import { expect, test } from "@playwright/test";
import registry from "../registry.json";

const componentSlugs = ["button", "input", "textarea", "label", "checkbox", "radio-group", "select", "switch", "spinner"];

test("desktop sidebar links to all nine catalog component pages", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/components");
  const navigation = page.getByRole("navigation", { name: "Component navigation" });
  for (const slug of componentSlugs) {
    const item = registry.items.find((entry) => entry.name === slug);
    expect(item, `registry metadata for ${slug}`).toBeDefined();
    const link = navigation.getByRole("link", { name: item!.title, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", `/components/${slug}`);
  }
  await expect(navigation.getByRole("link", { name: "utils", exact: true })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "library-styles", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Components", exact: true })).toHaveAttribute("href", "/components");
});

test("mobile navigation closes on selection and marks the new current page after reload", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components/button");
  const menu = page.getByRole("button", { name: "Components" });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "Button", exact: true })).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: "Input", exact: true }).click();
  await expect(page).toHaveURL(/\/components\/input$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await page.reload();
  await expect(page.getByRole("navigation", { name: "Component navigation" }).locator('a[href="/components/input"]')).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "Components" })).toHaveAttribute("aria-expanded", "false");
});

test("mobile navigation closes on Escape and returns focus to its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components/button");
  const menu = page.getByRole("button", { name: "Components" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(menu).toBeFocused();
});

test("catalog layout fits 320px and the skip link focuses main content", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/components");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#catalog-content")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("home offers catalog and setup paths with real component examples", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /browse catalog/i })).toHaveAttribute("href", "/components");
  await expect(page.getByRole("link", { name: /getting started/i })).toHaveAttribute("href", "/getting-started");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
  await expect(page.getByText("Status feedback", { exact: false })).toBeVisible();
});

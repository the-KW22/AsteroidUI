import { expect, test } from "@playwright/test";
import registry from "../registry.json";

const componentSlugs = ["button", "input", "textarea", "label", "checkbox", "radio-group", "select", "switch", "spinner"];

test("directory navigation links to all nine catalog component pages", async ({ page }) => {
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
  await expect(navigation.getByRole("button", { name: "Particles", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Components" })).toHaveAttribute("href", "/components");
});

test("mobile directory links navigate to details and return through the breadcrumb", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components");
  const navigation = page.getByRole("navigation", { name: "Component navigation" });
  await expect(navigation.getByRole("link", { name: "Button", exact: true })).toBeVisible();
  await navigation.getByRole("link", { name: "Input", exact: true }).click();
  await expect(page).toHaveURL(/\/components\/input$/);
  await expect(page.getByRole("heading", { level: 1, name: /Input/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Input/ })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/components$/);
  await expect(navigation.getByRole("button", { name: "Particles", exact: true })).toHaveAttribute("aria-current", "page");
});

test("mobile directory tier disclosure closes on keyboard activation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components");
  const toggle = page.getByRole("button", { name: "Collapse Particles" });
  await toggle.focus();
  await page.keyboard.press("Enter");
  const expand = page.getByRole("button", { name: "Expand Particles" });
  await expect(expand).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("navigation", { name: "Component navigation" }).getByRole("link", { name: "Button", exact: true })).toBeHidden();
  await expand.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Collapse Particles" })).toHaveAttribute("aria-expanded", "true");
});

test("catalog layout fits 320px and the skip link focuses main content", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/components");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#directory-content")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("home offers catalog and setup paths with real component examples", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: /browse catalog/i })).toHaveAttribute("href", "/components");
  await expect(page.getByRole("link", { name: /getting started/i })).toHaveAttribute("href", "/getting-started");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
  await expect(page.getByText("Status feedback", { exact: false })).toBeVisible();
});

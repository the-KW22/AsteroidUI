import { expect, test } from "@playwright/test";
import registry from "../registry.json";

test.use({ viewport: { width: 1440, height: 1000 } });
const slugs = ["button", "input", "textarea", "label", "checkbox", "radio-group", "select", "switch", "spinner"];

test("directory hover previews demonstrate each control and reset on exit", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/components");
  const cards = page.locator("[data-preview]");
  await expect(page.locator("[data-preview][data-step='0']")).toHaveCount(9);
  for (const slug of slugs) {
    const card = page.locator(`[data-preview='${slug}']`);
    await card.hover();
    await expect(card).not.toHaveAttribute("data-step", "0");
    if (slug === "checkbox" || slug === "switch") await expect(card.locator("[role='checkbox'], [role='switch']")).toHaveAttribute("aria-checked", "true");
    if (slug === "radio-group") await expect(card.locator("[role='radio']").last()).toHaveAttribute("aria-checked", "true");
    if (slug === "label") await expect(card.locator("input")).toHaveCSS("outline-style", "solid");
    if (slug === "spinner") await expect(card.locator("svg").first()).toHaveCSS("animation-play-state", "running");
    if (["button", "input", "textarea", "select"].includes(slug)) {
      await expect(card).toHaveAttribute("data-step", /[4-9]/);
      if (slug === "button") await expect(card.locator("button")).toContainText("Done");
      if (slug === "input") await expect(card.locator("input")).toHaveValue("hello@asteroid.ui");
      if (slug === "textarea") await expect(card.locator("textarea")).toHaveValue("Small pieces.\nA whole new world.");
      if (slug === "select") await expect(card.locator("button")).toContainText("Personal");
    }
    await page.mouse.move(0, 0);
    await expect(card).toHaveAttribute("data-step", "0");
  }
  await page.waitForTimeout(750); // A cancelled click timer must not restart a departed card.
  await expect.poll(() => cards.evaluateAll(elements => elements.filter(element => element.getAttribute("data-step") !== "0").map(element => `${element.getAttribute("data-preview")}:${element.getAttribute("data-step")}`))).toEqual([]);
  expect(errors).toEqual([]);
});

test("directory previews support focus, reduced motion and compact setup navigation", async ({ page }) => {
  await page.goto("/components");
  const setup = page.getByRole("button", { name: "Expand Getting Started" });
  await expect(setup).toHaveAttribute("aria-expanded", "false");
  await setup.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Component navigation" }).getByRole("link", { name: "Next.js", exact: true })).toBeVisible();
  const checkbox = page.locator("[data-preview='checkbox']");
  await checkbox.getByRole("link").focus();
  await expect(checkbox).toHaveAttribute("data-step", "2");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(checkbox).toHaveAttribute("data-step", "0");
  const button = page.locator("[data-preview='button']");
  await button.getByRole("link").focus();
  await button.hover();
  await expect(button).toHaveAttribute("data-step", "0");
  await expect(page.locator("[data-preview='spinner'] svg").first()).toHaveCSS("animation-name", "none");
});

test("directory exposes all nine real Particles and truthful future links", async ({ page }) => {
  await page.goto("/components");
  const directory = page.locator("[data-component-directory]");
  await expect(directory.getByRole("heading", { level: 1, name: "Particles." })).toBeVisible();
  const collection = directory.getByRole("list", { name: "Available components" });
  await expect(collection.getByRole("link")).toHaveCount(9);
  await expect(collection.locator("[inert][aria-hidden='true']")).toHaveCount(9);
  for (const slug of slugs) {
    const title = registry.items.find(item => item.name === slug)!.title;
    await expect(collection.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", `/components/${slug}`);
    await expect(directory.getByRole("navigation", { name: "Component navigation" }).getByRole("link", { name: title, exact: true })).toHaveAttribute("href", `/components/${slug}`);
  }
  for (const tier of ["Asteroid", "Galaxy"]) {
    await directory.getByRole("button", { name: tier, exact: true }).click();
    await expect(directory.getByRole("heading", { level: 1, name: `${tier}.` })).toBeVisible();
    await expect(directory.getByRole("status")).toContainText(`No ${tier} components are available yet.`);
    await expect(directory.getByRole("link", { name: `Explore the ${tier} stage` })).toHaveAttribute("href", `/#stage-${tier.toLowerCase()}`);
  }
  await directory.getByRole("button", { name: "Particles", exact: true }).click();
  await expect(collection.getByRole("link")).toHaveCount(9);
});

test("directory appearance persists through the shared header", async ({ page }) => {
  await page.goto("/components");
  const appearance = page.getByRole("group", { name: "Appearance" });
  await expect(appearance).toBeEnabled();
  await appearance.getByRole("button", { name: "Light", exact: true }).click();
  await expect(appearance.getByRole("button", { name: "Light", exact: true })).toHaveAttribute("aria-pressed", "true");
  await appearance.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(appearance.getByRole("button", { name: "Dark", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(appearance.getByRole("button", { name: "Dark", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#directory-content")).toBeVisible();
});

test("directory keyboard entry reaches an unchanged detail page and returns", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/components");
  const skip = page.getByRole("link", { name: "Skip to content", exact: true });
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#directory-content")).toBeFocused();
  const button = page.getByRole("list", { name: "Available components" }).getByRole("link", { name: "Button", exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/components\/button$/);
  await expect(page.locator("#button-detail-content")).toBeVisible();
  await expect(page.locator("[data-component-directory]")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator("#directory-content")).toBeVisible();
  expect(errors).toEqual([]);
});

test("directory fits small desktop and retains its gallery and navigation on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole("list", { name: "Available components" }).getByRole("link")).toHaveCount(9);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-component-directory]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Particles." })).toBeVisible();
  await page.getByRole("link", { name: "Skip to content", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#directory-content")).toBeFocused();
  const menu = page.locator("[data-site-header]").getByRole("button", { name: "Open navigation" });
  await menu.click();
  await expect(page.locator("[data-site-header]").getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-site-header]").getByRole("button", { name: "Open navigation" })).toBeFocused();
  await expect(page.locator("[data-site-header]").getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

import { expect, test } from "@playwright/test";

test("one shared header covers routes and marks parent sections", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  for (const [route, active] of [["/", "Home"], ["/components", "Components"], ["/components/button", "Components"], ["/getting-started", "Docs"], ["/getting-started/nextjs", "Docs"], ["/license", null], ["/examples/collection", null]]) {
    const routePage = await page.context().newPage();
    routePage.on("pageerror", error => errors.push(error.message));
    await routePage.goto(route!);
    const header = routePage.locator("[data-site-header]");
    await expect(header).toHaveCount(1);
    await expect(routePage.getByRole("navigation", { name: "Main navigation", exact: true })).toHaveCount(1);
    await expect(header.locator("a[aria-current]")).toHaveCount(active ? 1 : 0);
    if (active) await expect(header.getByRole("link", { name: active, exact: true })).toHaveAttribute("aria-current", /page|true/);
    await expect(header.getByRole("link", { name: "GitHub", exact: true })).toHaveAttribute("href", "https://github.com/the-KW22/AsteroidUI");
    await expect(header.locator("a[href*='localhost']")).toHaveCount(0);
    await routePage.evaluate(() => scrollTo(0, 500));
    expect(await header.evaluate(element => element.getBoundingClientRect().top)).toBe(0);
    await routePage.close();
  }
  expect(errors).toEqual([]);
});

test("phone menu supports keyboard, route changes, Back and skip focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/components");
  const header = page.locator("[data-site-header]");
  const menu = header.getByRole("button", { name: /navigation/ });
  const nav = header.getByRole("navigation", { name: "Main navigation" });
  await expect(nav).toBeHidden();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(nav).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await nav.getByRole("link", { name: "Docs", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(nav).toBeHidden();
  await menu.click();
  await nav.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page).toHaveURL(/\/getting-started$/);
  await expect(nav).toBeHidden();
  await expect(header.locator('nav[aria-label="Main navigation"] a[href="/getting-started"]')).toHaveAttribute("aria-current", "page");
  await page.goBack();
  await expect(page).toHaveURL(/\/components$/);
  await expect(nav).toBeHidden();
  await expect(header.locator('nav[aria-label="Main navigation"] a[href="/components"]')).toHaveAttribute("aria-current", "page");
  await header.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#directory-content")).toBeFocused();
  expect(await page.locator("#directory-content").evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(await header.evaluate(element => element.getBoundingClientRect().bottom));
  for (const width of [320, 640, 900, 1024]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test("skip link has a rendered fallback target", async ({ page }) => {
  await page.goto("/getting-started");
  const target = await page.locator("[data-site-header]").getByRole("link", { name: "Skip to content" }).getAttribute("href");
  await expect(page.locator(target!)).toBeVisible();
});

import { expect, test } from "@playwright/test";

// The existing foundation remains the narrow-screen page until the final P7 mobile pass.
test.use({ viewport: { width: 900, height: 900 } });

test("appearance follows the system and remembers the visitor's choice", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const appearance = page.getByRole("group", { name: "Appearance" });
  await expect(appearance.getByRole("button", { name: "Default (follow system)" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await appearance.getByRole("button", { name: "Light", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/light/);
  await page.reload();
  await expect(appearance.getByRole("button", { name: "Light", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("html")).toHaveClass(/light/);
  await appearance.getByRole("button", { name: "Default (follow system)" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveClass(/light/);
  expect(errors).toEqual([]);
});

test("appearance is keyboard accessible and the foundation fits a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  const appearance = page.getByRole("button", { name: "Light", exact: true });
  await expect(appearance).toBeEnabled();
  await appearance.focus();
  await expect(appearance).toBeFocused();
  await expect(appearance).toHaveCSS("outline-style", "solid");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("shared color, font, and radius overrides reach the rendered sample", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Light", exact: true }).click();
  const sample = page.getByRole("region", { name: "Theme tokens in use" }).locator(".rounded-lg");
  await expect(sample).toHaveCSS("border-radius", "14px");
  await page.evaluate(() => {
    const theme = document.documentElement.style;
    theme.setProperty("--primary", "#123456");
    theme.setProperty("--font-sans", "monospace");
    theme.setProperty("--radius", "20px");
  });
  await expect(page.getByText("Primary surface", { exact: true })).toHaveCSS("background-color", "rgb(18, 52, 86)");
  await expect(sample).toHaveCSS("font-family", "monospace");
  await expect(sample).toHaveCSS("border-radius", "20px");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(23, 23, 23)");
  await expect(sample).toHaveCSS("background-color", "rgb(38, 38, 38)");
});

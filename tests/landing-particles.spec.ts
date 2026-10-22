import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", colorScheme: "light" });

test("interaction feel selects maintained Button presets and records real activations", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#first-particle");
  await section.scrollIntoViewIfNeeded();

  await expect(section.getByRole("heading", { name: "Feel the difference." })).toBeVisible();
  await expect(section.locator("pre")).toHaveCount(0);
  await section.getByRole("radio", { name: "Compression Bloom", exact: true }).check();
  const button = section.getByRole("button", { name: "Try the button" });
  await button.click();
  await expect(section.getByRole("status")).toHaveText("Activated 1 time");
  await button.click();
  await expect(section.getByRole("status")).toHaveText("Activated 2 times");
  await expect(section.getByRole("link", { name: "Read the Button docs" })).toHaveAttribute("href", "/components/button");
  await expect(section.getByRole("link", { name: "Explore all 9 Particles" })).toHaveAttribute("href", "/components");
});

test("simulated action blocks repeats while pending, fails once, then succeeds on retry", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#first-particle");
  await section.scrollIntoViewIfNeeded();
  await section.getByRole("radio", { name: "Action feedback" }).check();

  await section.getByRole("button", { name: "Save changes" }).click();
  const pending = section.getByRole("button", { name: "Saving changes" });
  await expect(pending).toBeDisabled();
  await expect(pending).toBeFocused();
  await expect(section.getByText("Simulated interaction", { exact: true })).toBeVisible();
  await expect(section.getByRole("status")).toHaveText("The simulated save failed. Try again to finish.");

  await section.getByRole("button", { name: "Retry save" }).click();
  await expect(section.getByRole("button", { name: "Saving changes" })).toBeDisabled();
  await expect(section.getByRole("status")).toHaveText("Saved in this demonstration.");
});

test("keyboard Select supports typeahead, Escape focus return, and preview-only theme including its portal", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#first-particle");
  await section.scrollIntoViewIfNeeded();

  await section.getByRole("radio", { name: "Keyboard interaction" }).check();
  const trigger = section.getByRole("combobox", { name: "Move this project to" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const option = page.getByRole("option", { name: "Design review" });
  await expect(option).toBeVisible();
  await expect(page.getByRole("listbox").locator("..")).toHaveCSS("background-color", "rgb(243, 244, 246)");
  await page.keyboard.type("des");
  await expect(option).toHaveAttribute("data-highlighted", "");
  await page.keyboard.press("Enter");
  await expect(section.getByRole("status")).toHaveText("Current destination: Design review");
  await expect(page.getByRole("listbox")).toHaveCount(0);

  await trigger.focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();

  const themeSwitch = section.getByRole("switch", { name: "Use dark preview appearance" });
  await themeSwitch.focus();
  await page.keyboard.press("Space");
  await expect(section.locator("[data-preview-theme]")).toHaveAttribute("data-preview-theme", "dark");
  await expect(section.locator("[data-preview-theme]")).toHaveCSS("background-color", "rgb(23, 26, 32)");
  await expect(page.locator("html")).toHaveClass(/\blight\b/);

  await trigger.focus();
  await page.keyboard.press("Enter");
  const darkOption = page.getByRole("option", { name: "Archive" });
  await expect(darkOption).toBeVisible();
  await expect(darkOption).toHaveCSS("color", "rgb(239, 242, 246)");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(section.getByRole("status")).toHaveText("Current destination: Design review");
  await expect(section.getByRole("link", { name: "Read the Select docs" })).toHaveAttribute("href", "/components/select");
});

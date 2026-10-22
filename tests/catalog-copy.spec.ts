import { expect, test } from "@playwright/test";
import { installCommand } from "../src/site/catalog/registry-address";

test("Button agent menu copies installation guidance in both formats", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text: string) => sessionStorage.setItem("agent-brief", text) },
    });
  });
  await page.goto("/components/button");
  const menu = page.locator("summary").filter({ hasText: "Copy for agent" });
  await menu.click();
  await page.getByRole("button", { name: "Copy as Markdown" }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("agent-brief"))).toContain(installCommand("button"));
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("agent-brief"))).toContain("# Install and configure AsteroidUI Button");
  await menu.click();
  await page.getByRole("button", { name: "Copy as plain text" }).click();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("agent-brief"))).toContain("Customization options:");
});

test("clipboard failure leaves installation text accessible and selectable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => { throw new Error("Clipboard denied"); } },
      configurable: true,
    });
  });
  await page.goto("/components/input");
  const block = page.getByLabel("Install command", { exact: true }).locator("..");
  await block.getByRole("button", { name: "Copy Install command", exact: true }).click();
  await expect(block.getByRole("status")).toHaveText("Clipboard unavailable. Select and copy the code below.");
  await expect(block.locator("pre")).toContainText(installCommand("input"));
  await block.locator("pre").focus();
  await expect(block.locator("pre")).toBeFocused();
});

test("Button copied usage follows the selected preview state", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async (text: string) => {
        (window as Window & { copiedText?: string }).copiedText = text;
      } },
      configurable: true,
    });
  });
  await page.goto("/components/button");
  const preview = page.locator("#button-detail-content");
  await preview.getByLabel("Animation").selectOption("light-through-glass");
  await preview.getByLabel("Loading").check();
  const usage = await page.locator("#usage pre code").textContent();
  await page.locator("#usage").getByRole("button", { name: "Copy" }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { copiedText?: string }).copiedText)).toBe(usage);
  await expect(preview.getByRole("button", { name: "Saving changes", exact: true })).toHaveAttribute("data-animation", "light-through-glass");
});

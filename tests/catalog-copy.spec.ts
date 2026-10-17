import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { installCommand } from "../src/catalog/registry-address";

test("Button source copying matches the maintained file exactly", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/components/button");
  const source = page.locator("details").filter({ has: page.locator("summary", { hasText: "src/components/ui/button.tsx" }) });
  await source.locator("summary").click();
  const maintained = await readFile("src/components/ui/button.tsx", "utf8");
  expect((await source.locator("pre code").textContent())?.replace(/\r\n/g, "\n")).toBe(maintained.replace(/\r\n/g, "\n"));
  await source.getByRole("button", { name: "Copy src/components/ui/button.tsx", exact: true }).click();
  await expect.poll(async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, "\n")).toBe(maintained.replace(/\r\n/g, "\n"));
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
  const preview = page.locator("section[aria-labelledby='preview-title']");
  await preview.getByLabel("Animation").selectOption("lift");
  await preview.getByLabel("Loading").check();
  const usage = await preview.locator("pre code").textContent();
  await preview.getByRole("button", { name: "Copy code" }).click();
  await expect.poll(() => page.evaluate(() => (window as Window & { copiedText?: string }).copiedText)).toBe(usage);
  await expect(preview.getByRole("button", { name: "Saving changes", exact: true })).toHaveAttribute("data-animation", "lift");
});

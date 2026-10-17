import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { installCommand } from "../src/catalog/registry-address";

const details = [
  ["input", "Name"],
  ["textarea", "Message"],
  ["label", "Email address"],
  ["checkbox", "Receive product updates"],
  ["radio-group", "Density"],
  ["select", "Favorite fruit"],
  ["switch", "Notifications"],
  ["spinner", "Loading messages"],
] as const;
const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

for (const [slug, previewName] of details) {
  test(`${slug} detail has a working preview, usage, installation, and maintained source`, async ({ page }) => {
    await page.goto(`/components/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(previewName, { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Examples and states" })).toBeVisible();
    await expect(page.getByRole("region", { name: /examples/i }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Usage", exact: true })).toBeVisible();
    await expect(page.getByLabel("Install command", { exact: true })).toContainText(installCommand(slug));
    await expect(page.getByRole("link", { name: "Next.js setup" })).toHaveAttribute("href", "/getting-started/nextjs");
    await expect(page.getByRole("link", { name: "Vite setup" })).toHaveAttribute("href", "/getting-started/vite");
    await expect(page.getByRole("link", { name: "Theme setup" })).toHaveAttribute("href", "/getting-started/theme");
    const sourcePath = path.join(process.cwd(), "src/components/ui", `${slug}.tsx`);
    const maintainedCode = await readFile(sourcePath, "utf8");
    const source = page.locator("details").filter({ hasText: `src/components/ui/${slug}.tsx` });
    await source.locator("summary").click();
    expect(normalizeNewlines(await source.locator("pre code").textContent() ?? "")).toBe(normalizeNewlines(maintainedCode));
    const examplePath = ["input", "textarea", "label"].includes(slug) ? "fields-example" : ["checkbox", "radio-group", "switch"].includes(slug) ? "choices-example" : `${slug}-example`;
    const maintainedExample = await readFile(path.join(process.cwd(), "src/examples", `${examplePath}.tsx`), "utf8");
    const exampleSource = page.locator("details").filter({ hasText: `src/examples/${examplePath}.tsx` });
    await exampleSource.locator("summary").click();
    expect(normalizeNewlines(await exampleSource.locator("pre code").textContent() ?? "")).toBe(normalizeNewlines(maintainedExample));
  });
}

test("detail demos respond to meaningful interaction and code can be copied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text: string) => sessionStorage.setItem("test-clipboard", text) },
    });
  });
  await page.goto("/components/input");
  const preview = page.locator('section[aria-labelledby="detail-preview"]');
  const input = preview.getByRole("textbox", { name: "Name" });
  await input.fill("Ada");
  await expect(input).toHaveValue("Ada");
  const copy = page.getByRole("button", { name: "Copy Input usage", exact: true });
  const visibleUsage = await page.getByLabel("Input usage", { exact: true }).locator("code").textContent();
  await copy.click();
  await expect(page.getByRole("status").filter({ hasText: "Copied" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("test-clipboard"))).toBe(visibleUsage);

  await page.goto("/components/switch");
  const switchPreview = page.locator('section[aria-labelledby="detail-preview"]');
  const toggle = switchPreview.getByRole("switch", { name: "Notifications" });
  await expect(toggle).not.toBeChecked();
  await toggle.press("Space");
  await expect(toggle).toBeChecked();

  await page.goto("/components/select");
  const selectPreview = page.locator('section[aria-labelledby="detail-preview"]');
  const trigger = selectPreview.getByRole("combobox", { name: "Favorite fruit" });
  await trigger.click();
  await page.getByRole("option", { name: "Pear" }).click();
  await expect(trigger).toContainText("Pear");
});

test("unknown component slugs return not found", async ({ page }) => {
  const response = await page.goto("/components/unknown-component");
  expect(response?.status()).toBe(404);
});

test("switch usage is client-ready and companion components are installable", async ({ page }) => {
  await page.goto("/components/switch");
  await expect(page.getByLabel("Switch usage", { exact: true }).locator("code")).toContainText('"use client";');

  await page.goto("/components/input");
  await expect(page.getByRole("heading", { name: "Usage companions" })).toBeVisible();
  await expect(page.getByLabel("Install Label", { exact: true })).toContainText("/registry/label.json");
  await expect(page.getByRole("link", { name: "Label", exact: true }).first()).toHaveAttribute("href", "/components/label");

  await page.goto("/components/label");
  await expect(page.getByLabel("Install Input", { exact: true })).toContainText("/registry/input.json");
});

test("detail pages retain the preview and avoid page-level overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const [slug] of details) {
    await page.goto(`/components/${slug}`);
    await expect(page.getByRole("heading", { name: "Preview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Examples and states" })).toBeVisible();
    const dimensions = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
  }
  await page.goto("/components/textarea");
  await expect(page.getByRole("textbox", { name: "Disabled message" })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "Invalid message" })).toHaveAttribute("aria-invalid", "true");
});

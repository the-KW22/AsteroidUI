import { expect, test } from "@playwright/test";
import { installCommand } from "../src/site/catalog/registry-address";

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
for (const [slug, previewName] of details) {
  test(`${slug} detail uses the shared shell with preview, contract, usage, and installation`, async ({ page }) => {
    await page.goto(`/components/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (slug === "radio-group") await expect(page.locator("#preview").getByRole("radiogroup", { name: previewName })).toBeVisible();
    else await expect(page.getByText(previewName, { exact: true }).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Live preview" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Know the contract." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Take the code." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy as Markdown" })).toBeHidden();
    await page.locator("summary").filter({ hasText: "Copy for agent" }).click();
    await expect(page.getByRole("button", { name: "Copy as Markdown" })).toBeVisible();
    await expect(page.getByLabel("Install command", { exact: true })).toContainText(installCommand(slug));
    await expect(page.getByRole("link", { name: "Next.js guide" })).toHaveAttribute("href", "/getting-started/nextjs");
    await expect(page.getByRole("link", { name: "Vite guide" })).toHaveAttribute("href", "/getting-started/vite");
    await expect(page.getByRole("link", { name: "shared stylesheet" })).toHaveAttribute("href", "/getting-started/theme");
    await page.locator("summary").filter({ hasText: "Explore examples and states" }).click();
    await expect(page.locator("#api details")).toHaveAttribute("open", "");
  });
}

test("all Particle contracts use the comparison-board language with live component samples", async ({ page }) => {
  await page.goto("/components/button");
  await expect(page.locator("#api").getByRole("table")).toBeVisible();
  await expect(page.locator("#api").getByRole("heading", { name: "What happens when you press?" })).toBeVisible();

  for (const [slug] of details) {
    await page.goto(`/components/${slug}`);
    const board = page.locator("#api");
    await expect(board.getByRole("table")).toBeVisible();
    await expect(board.getByRole("columnheader", { name: "Setting" })).toBeVisible();
    await expect(board.getByRole("columnheader", { name: "Use it for" })).toBeVisible();
    await expect(board.getByRole("columnheader", { name: "In context" })).toBeVisible();
    await expect(board.locator("tbody tr").first()).toBeVisible();
    await expect(board.locator("tbody tr").first().locator("td").last()).toBeVisible();
    if (slug === "label") await expect(board.getByRole("heading", { level: 3 })).toHaveCount(0);
    else await expect(board.getByRole("heading", { level: 3 })).toBeVisible();
  }
});

test("contract samples keep field labels uniquely connected and spinner status singular", async ({ page }) => {
  await page.goto("/components/input");
  const connections = await page.locator("#api label[for]").evaluateAll(labels => labels.map(label => {
    const id = label.getAttribute("for");
    return { id, matches: document.querySelectorAll(`[id="${CSS.escape(id ?? "")}"]`).length };
  }));
  expect(connections.length).toBeGreaterThan(0);
  expect(connections.every(connection => connection.matches === 1)).toBe(true);

  await page.goto("/components/spinner");
  await expect(page.locator("#preview [role=status]")).toHaveCount(1);
  await expect(page.locator("#api [role=status]:visible")).toHaveCount(0);
});

test("contract-board samples are real interactive components", async ({ page }) => {
  await page.goto("/components/checkbox");
  const checkbox = page.locator("#api tbody tr").first().getByRole("checkbox");
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  await page.goto("/components/select");
  const trigger = page.locator("#api tbody tr").first().getByRole("combobox");
  await trigger.click();
  await expect(page.getByRole("option", { name: "Pear" })).toBeVisible();
});

test("detail demos respond to meaningful interaction and code can be copied", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (text: string) => sessionStorage.setItem("test-clipboard", text) },
    });
  });
  await page.goto("/components/input");
  const preview = page.locator("#preview");
  const input = preview.getByRole("textbox", { name: "Name" });
  await input.fill("Ada");
  await expect(input).toHaveValue("Ada");
  const copy = page.getByRole("button", { name: "Copy Input usage", exact: true });
  const visibleUsage = await page.getByLabel("Input usage", { exact: true }).locator("code").textContent();
  await copy.click();
  await expect(page.getByRole("status").filter({ hasText: "Copied" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("test-clipboard"))).toBe(visibleUsage);

  await page.goto("/components/switch");
  const switchPreview = page.locator("#preview");
  const toggle = switchPreview.getByRole("switch", { name: "Notifications" });
  await expect(toggle).not.toBeChecked();
  await toggle.press("Space");
  await expect(toggle).toBeChecked();

  await page.goto("/components/select");
  const selectPreview = page.locator("#preview");
  const trigger = selectPreview.getByRole("combobox", { name: "Favorite fruit" });
  await trigger.click();
  await page.getByRole("option", { name: "Pear" }).click();
  await expect(trigger).toContainText("Pear");
});

test("all eight detail workbenches update their preview and usage from labeled options", async ({ page }) => {
  const cases = [
    { slug: "input", controls: [["Variant", "filled"], ["Density", "comfortable"], ["Animation", "focus-wake"]], preview: "#preview input", snippets: ['variant={"filled"}', 'density={"comfortable"}', 'animation={"focus-wake"}'] },
    { slug: "textarea", controls: [["Variant", "filled"], ["Density", "comfortable"], ["Animation", "focus-wake"]], preview: "#preview textarea", snippets: ['variant={"filled"}', 'density={"comfortable"}', 'animation={"focus-wake"}'] },
    { slug: "label", controls: [["Size", "sm"], ["Emphasis", "strong"]], preview: "#preview label", snippets: ['size={"sm"}', 'emphasis={"strong"}'] },
    { slug: "checkbox", controls: [["Size", "lg"], ["Variant", "soft"], ["Animation", "ink-mark"]], preview: "#preview [role=checkbox]", snippets: ['size={"lg"}', 'variant={"soft"}', 'animation={"ink-mark"}'] },
    { slug: "radio-group", controls: [["Size", "lg"], ["Variant", "soft"], ["Animation", "center-fill"]], preview: "#preview [role=radio]", snippets: ['size={"lg"}', 'variant={"soft"}', 'animation={"center-fill"}'] },
    { slug: "select", controls: [["Variant", "filled"], ["Density", "comfortable"], ["Animation", "bounce-open"]], preview: "#preview [role=combobox]", snippets: ['variant={"filled"}', 'density={"comfortable"}', 'animation={"bounce-open"}'] },
    { slug: "switch", controls: [["Size", "lg"], ["Variant", "soft"], ["Animation", "guided-glide"]], preview: "#preview [role=switch]", snippets: ['size={"lg"}', 'variant={"soft"}', 'animation={"guided-glide"}'] },
    { slug: "spinner", controls: [["Size", "24"], ["Stroke width", "2.5"], ["Speed", "calm"], ["Color", "destructive"]], preview: "#preview [role=status] svg", snippets: ["size={24}", "strokeWidth={2.5}", 'speed={"calm"}', 'style={{ color: "var(--destructive)" }}'] },
  ] as const;

  for (const entry of cases) {
    await page.goto(`/components/${entry.slug}`);
    for (const [label, value] of entry.controls) {
      await page.getByRole("combobox", { name: label, exact: true }).selectOption(value);
    }
    const preview = page.locator(entry.preview);
    if (entry.slug === "input" || entry.slug === "textarea") await expect(preview).toHaveClass(/bg-muted/);
    if (entry.slug === "label") await expect(preview.first()).toHaveClass(/text-xs/);
    if (entry.slug === "checkbox" || entry.slug === "radio-group" || entry.slug === "switch") await expect(preview.first()).toHaveClass(/size-5|w-12/);
    if (entry.slug === "select") await expect(preview).toHaveClass(/h-11/);
    if (entry.slug === "spinner") {
      await expect(preview).toHaveAttribute("width", "24");
      await expect(preview).toHaveAttribute("stroke-width", "2.5");
      await expect(preview).toHaveCSS("animation-duration", "2.2s");
    }
    const usage = await page.getByLabel(`${entry.slug === "radio-group" ? "Radio group" : entry.slug[0].toUpperCase() + entry.slug.slice(1)} usage`, { exact: true }).locator("code").textContent();
    for (const snippet of entry.snippets) expect(usage).toContain(snippet);
  }
});

test("choice motion follows committed state and becomes static with reduced motion", async ({ page }) => {
  await page.goto("/components/checkbox");
  await page.getByRole("combobox", { name: "Animation" }).selectOption("ink-mark");
  const checkbox = page.locator("#preview").getByRole("checkbox", { name: "Receive product updates" });
  const checkIndicator = checkbox.locator("span").first();
  await expect(checkIndicator).toHaveCSS("opacity", "0");
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await expect(checkIndicator).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(checkIndicator).toHaveCSS("transition-duration", "0s");

  await page.goto("/components/radio-group");
  await page.getByRole("combobox", { name: "Animation" }).selectOption("center-fill");
  const compact = page.locator("#preview").getByRole("radio", { name: "Compact" });
  const radioIndicator = compact.locator(".choice-radio__center");
  await compact.click();
  await expect(compact).toBeChecked();
  await expect(radioIndicator).toHaveCSS("opacity", "1");
  await expect(radioIndicator).toHaveCSS("transition-duration", "0s");
});

test("contract motion comparisons loop in view without taking focus and stop for reduced motion", async ({ page }) => {
  await page.goto("/components/input");
  const sample = page.locator("#api input.cl-field-focus-wake--input").last();
  await sample.scrollIntoViewIfNeeded();
  await expect(sample.locator("xpath=../..")).toHaveAttribute("data-loop-active", "true");
  await expect(sample).toHaveAttribute("data-preview-focus", "");
  await expect(sample).not.toBeFocused();
  await expect(sample).not.toHaveAttribute("data-preview-focus", "");

  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(sample.locator("xpath=../..")).not.toHaveAttribute("data-loop-active", "true");
  await sample.scrollIntoViewIfNeeded();
  await expect(sample.locator("xpath=../..")).toHaveAttribute("data-loop-active", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(sample.locator("xpath=../..")).not.toHaveAttribute("data-loop-active", "true");
  await expect(sample).toHaveAttribute("data-preview-focus", "");
  await expect(sample).toHaveCSS("animation-name", "none");
  await expect(sample).not.toBeFocused();
});

test("every motion comparison starts its preview only while visible", async ({ page }) => {
  for (const slug of ["input", "textarea", "checkbox", "radio-group", "select", "switch", "spinner"]) {
    await page.goto(`/components/${slug}`);
    const sample = page.locator('#api [aria-hidden="true"][inert]').first();
    await sample.scrollIntoViewIfNeeded();
    await expect(sample).toHaveAttribute("data-loop-active", "true");
  }
});

test("Switch keeps only the slower Guided Glide and becomes static under reduced motion", async ({ page }) => {
  await page.goto("/components/switch");
  const toggle = page.locator("#preview").getByRole("switch", { name: "Notifications" });
  const thumb = toggle.locator(".cl-switch-thumb");
  await page.getByRole("combobox", { name: "Animation" }).selectOption("guided-glide");
  await expect(toggle).toHaveAttribute("data-animation", "guided-glide");
  await expect(thumb).toHaveCSS("transition-duration", "0.6s");
  await expect(page.getByRole("combobox", { name: "Animation" }).locator("option")).toHaveCount(2);
  await toggle.press("Space");
  await expect(toggle).toBeChecked();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(thumb).toHaveCSS("transition-duration", "0s");
});

test("bounce-open Select retains keyboard dismissal with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/components/select");
  await page.getByRole("combobox", { name: "Animation" }).selectOption("bounce-open");
  const trigger = page.locator("#preview").getByRole("combobox", { name: "Favorite fruit" });
  await trigger.click();
  await expect(page.getByRole("option", { name: "Pear" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("option", { name: "Pear" })).toHaveCount(0);
});

test("Select motion previews stay inside their comparison cards", async ({ page }) => {
  await page.goto("/components/select");
  const ghosts = page.locator("#api .cl-select-popup");
  await expect(ghosts).toHaveCount(2);
  for (const ghost of await ghosts.all()) {
    await ghost.locator("xpath=..").scrollIntoViewIfNeeded();
    const bounds = await ghost.evaluate((element) => {
      const popup = element.getBoundingClientRect();
      const stage = element.parentElement!.getBoundingClientRect();
      return { left: popup.left, right: popup.right, bottom: popup.bottom, stageLeft: stage.left, stageRight: stage.right, stageBottom: stage.bottom };
    });
    expect(bounds.left).toBeGreaterThanOrEqual(bounds.stageLeft);
    expect(bounds.right).toBeLessThanOrEqual(bounds.stageRight);
    expect(bounds.bottom).toBeLessThanOrEqual(bounds.stageBottom);
  }
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
    await expect(page.getByRole("heading", { name: "Live preview" })).toBeVisible();
    await expect(page.getByText("Explore examples and states")).toBeVisible();
    const dimensions = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);
  }
  await page.goto("/components/textarea");
  await page.locator("summary").filter({ hasText: "Explore examples and states" }).click();
  await expect(page.getByRole("textbox", { name: "Disabled message" })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "Invalid message" })).toHaveAttribute("aria-invalid", "true");
});

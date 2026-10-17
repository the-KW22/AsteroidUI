import { expect, test } from "@playwright/test";

const preview = (page: import("@playwright/test").Page) => page.locator("section[aria-labelledby='preview-title']");

test.beforeEach(async ({ page }) => {
  await page.goto("/components/button");
});

test("preview starts with no animation and its controls match the usage snippet", async ({ page }) => {
  const area = preview(page);
  const animation = area.getByLabel("Animation");
  const button = area.getByRole("button", { name: "Save changes" });
  const snippet = area.locator("pre code");

  await expect(animation).toHaveValue("none");
  await expect(button).toHaveAttribute("data-animation", "none");
  for (const effect of ["press", "lift", "highlight", "ripple", "inset"]) {
    await animation.selectOption(effect);
    await expect(button).toHaveAttribute("data-animation", effect);
    await expect(snippet).toContainText(`animation=\"${effect}\"`);
  }

  await area.getByLabel("Size").selectOption("icon");
  await expect(area.getByRole("button", { name: "Save changes" })).toBeVisible();
  await expect(snippet).toContainText('import { Heart } from "lucide-react"');
  await expect(snippet).toContainText('import { Button } from "@/components/ui/button"');
  await expect(snippet).not.toContainText('import { Button, Heart } from "@/components/ui/button"');
});

test("native action events, refs, and submit type are preserved", async ({ page }) => {
  const demo = page.getByRole("region", { name: "Native events and application-controlled loading" });
  const action = demo.getByRole("button", { name: "Record action" });
  const actionCount = demo.getByRole("status").filter({ hasText: "Actions:" });

  await expect(action).toHaveAttribute("type", "button");
  await action.click();
  await expect(actionCount).toHaveText("Actions: 1");
  await action.focus();
  await page.keyboard.press("Enter");
  await expect(actionCount).toHaveText("Actions: 2");
  await page.keyboard.press("Space");
  await expect(actionCount).toHaveText("Actions: 3");
  await demo.getByRole("button", { name: "Focus action ref" }).click();
  await expect(action).toBeFocused();

  const form = demo.locator("form");
  await expect(form.getByRole("button", { name: "Default action" })).toHaveAttribute("type", "button");
  await expect(form.getByRole("button", { name: "Submit form" })).toHaveAttribute("type", "submit");
  await form.getByRole("button", { name: "Default action" }).click();
  await expect(form.getByRole("status")).toHaveText("Form submissions: 0");
  await form.getByRole("button", { name: "Submit form" }).click();
  await expect(form.getByRole("status")).toHaveText("Form submissions: 1");

  await demo.getByLabel("Prevent action").check();
  await action.click();
  await expect(actionCount).toHaveText("Actions: 3");
  await expect(action.locator(".cl-button__ripple")).toHaveCount(0);
});

test("loading stays focusable, keeps its name, and blocks repeated activation", async ({ page }) => {
  const demo = page.getByRole("region", { name: "Native events and application-controlled loading" });
  const save = demo.getByRole("button", { name: "Save changes" });

  await save.click();
  const pending = demo.getByRole("button", { name: "Saving changes" });
  await expect(pending).toBeFocused();
  await expect(pending).toHaveAttribute("aria-busy", "true");
  await expect(pending.locator(".cl-button__pending svg")).toBeVisible();
  await expect(demo.getByRole("status").filter({ hasText: "Saving changes" })).toHaveText("Saving changes");
  await page.keyboard.press("Space");
  await expect(pending).toBeFocused();
  await expect(demo.getByRole("status").filter({ hasText: "Saving changes" })).toHaveText("Saving changes");

  await demo.getByRole("button", { name: "Finish save" }).click();
  await expect(demo.getByRole("button", { name: "Save changes" })).toBeEnabled();
  await expect(demo.getByRole("status").filter({ hasText: "Save finished" })).toHaveText("Save finished");
});

test("Ripple starts after activation, uses pointer or keyboard origin, and stays bounded", async ({ page }) => {
  const demo = page.getByRole("region", { name: "Native events and application-controlled loading" });
  const action = demo.getByRole("button", { name: "Record action" });
  const count = demo.getByRole("status").filter({ hasText: "Actions:" });

  await action.scrollIntoViewIfNeeded();
  const box = await action.boundingBox();
  if (!box) throw new Error("Ripple action button has no layout box");
  const point = { x: box.x + 8, y: box.y + box.height / 2 };
  await page.mouse.click(point.x, point.y);
  await expect(count).toHaveText("Actions: 1");
  const ripple = action.locator(".cl-button__ripple");
  await expect(ripple).toHaveCount(1);
  expect(Number.parseFloat((await ripple.getAttribute("style"))?.match(/--ripple-x: ([\d.]+)px/)?.[1] ?? "NaN")).toBeCloseTo(8, 0);

  await action.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(count).toHaveText("Actions: 3");
  await expect(ripple).toHaveCount(1);
  const dimensions = await action.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  const style = await ripple.getAttribute("style");
  expect(Number.parseFloat(style?.match(/--ripple-x: ([\d.]+)px/)?.[1] ?? "NaN")).toBeCloseTo(dimensions.width / 2, 0);
  expect(Number.parseFloat(style?.match(/--ripple-y: ([\d.]+)px/)?.[1] ?? "NaN")).toBeCloseTo(dimensions.height / 2, 0);
  await expect(ripple).toHaveCount(0, { timeout: 1000 });
});

test("cancelled pointer presses do not activate or leave a Ripple", async ({ page }) => {
  const demo = page.getByRole("region", { name: "Native events and application-controlled loading" });
  const action = demo.getByRole("button", { name: "Record action" });
  const count = demo.getByRole("status").filter({ hasText: "Actions:" });
  await action.scrollIntoViewIfNeeded();
  const box = await action.boundingBox();
  if (!box) throw new Error("Ripple action button has no layout box");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + 40, box.y + box.height + 40);
  await page.mouse.up();
  await expect(count).toHaveText("Actions: 0");
  await expect(action.locator(".cl-button__ripple")).toHaveCount(0);
});

test("disabled and loading preview states suppress effects while preserving icon names", async ({ page }) => {
  const area = preview(page);
  await area.getByLabel("Animation").selectOption("ripple");
  await area.getByLabel("Size").selectOption("icon");
  const iconButton = area.getByRole("button", { name: "Save changes" });

  await iconButton.click();
  await expect(iconButton.locator(".cl-button__ripple")).toHaveCount(1);
  await area.getByLabel("Loading").check();
  const loadingButton = area.getByRole("button", { name: "Save changes" });
  await expect(loadingButton).toHaveAttribute("aria-busy", "true");
  await expect(loadingButton.locator(".cl-button__pending svg")).toBeVisible();
  await expect(loadingButton.locator(".cl-button__ripple")).toHaveCount(0);
  await area.getByLabel("Loading").uncheck();
  await area.getByLabel("Disabled").check();
  await expect(iconButton).toBeDisabled();
  await iconButton.click({ force: true });
  await expect(iconButton.locator(".cl-button__ripple")).toHaveCount(0);
});

test("reduced motion leaves static interaction cues and stops Spinner rotation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const area = preview(page);
  await area.getByLabel("Animation").selectOption("ripple");
  const button = area.getByRole("button", { name: "Save changes" });
  await button.click();
  await expect(button.locator(".cl-button__ripple")).toHaveCount(0);

  const spinnerSection = page.locator("section[aria-labelledby='spinner-title']");
  const spinner = spinnerSection.getByRole("status").filter({ hasText: "Loading messages" }).locator("svg");
  await expect(spinner).toBeVisible();
  await expect(spinner).toHaveCSS("animation-name", "none");
  await expect(spinnerSection.getByRole("status").filter({ hasText: "Uploading" })).toBeVisible();
  for (const size of [16, 20, 24]) {
    const example = page.getByText(`${size}px`).locator("xpath=..").locator("svg");
    await expect(example).toHaveAttribute("width", String(size));
    await expect(example).toHaveAttribute("height", String(size));
  }
  const animation = area.getByLabel("Animation");
  await animation.selectOption("press");
  await animation.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-style", "solid");
  await page.keyboard.down("Space");
  await expect(button).toHaveCSS("transform", "none");
  await expect.poll(() => button.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  await page.keyboard.up("Space");
});

test("switching to reduced motion stops an active Ripple", async ({ page }) => {
  const demo = page.getByRole("region", { name: "Native events and application-controlled loading" });
  const action = demo.getByRole("button", { name: "Record action" });
  await page.addStyleTag({ content: ".cl-button__ripple::after { animation-play-state: paused !important; }" });
  await action.click();
  await expect(action.locator(".cl-button__ripple")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => action.evaluate((button) => {
    const ripple = button.querySelector(".cl-button__ripple");
    return ripple ? getComputedStyle(ripple, "::after").animationName : "none";
  })).toBe("none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(action.locator(".cl-button__ripple")).toHaveCount(0);
});

test("touch activation does not depend on hover", async ({ browser }) => {
  const context = await browser.newContext({ baseURL: "http://127.0.0.1:3000", hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/components/button");
  const demo = page.getByRole("region", { name: "Native events and application-controlled loading" });
  const action = demo.getByRole("button", { name: "Record action" });
  await action.tap();
  await expect(demo.getByRole("status").filter({ hasText: "Actions:" })).toHaveText("Actions: 1");
  await expect(action).toHaveAttribute("data-animation", "ripple");
  await context.close();
});

test("all variants, sizes, and Inset states remain visible in light and dark appearance", async ({ page }) => {
  const area = preview(page);
  await page.getByLabel("Appearance").selectOption("light");
  for (const appearance of ["light", "dark"]) {
    await page.getByLabel("Appearance").selectOption(appearance);
    for (const variant of ["default", "secondary", "outline", "ghost", "destructive", "link"]) {
      await area.getByLabel("Style").selectOption(variant);
      await area.getByLabel("Animation").selectOption("inset");
      const button = area.getByRole("button", { name: "Save changes" });
      await expect(button).toBeVisible();
      await button.focus();
      await expect.poll(() => button.evaluate((element) => getComputedStyle(element).color)).not.toBe("rgba(0, 0, 0, 0)");
      await expect.poll(() => button.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");

      for (const size of ["sm", "default", "lg", "icon-sm", "icon", "icon-lg"]) {
        await area.getByLabel("Size").selectOption(size);
        const namedButton = area.getByRole("button", { name: "Save changes" });
        await expect(namedButton).toBeVisible();
        await expect(namedButton).toHaveAttribute("data-animation", "inset");
      }
    }
  }
});

test("keyboard focus outline remains visible with Inset and reduced-motion effects", async ({ page }) => {
  const area = preview(page);
  const animation = area.getByLabel("Animation");
  for (const effect of ["inset", "press", "lift"]) {
    await animation.selectOption(effect);
    await animation.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const button = area.getByRole("button", { name: "Save changes" });
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "solid");
    await expect(button).toHaveCSS("outline-width", "2px");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const effect of ["press", "lift"]) {
    await animation.selectOption(effect);
    await animation.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const button = area.getByRole("button", { name: "Save changes" });
    await expect(button).toBeFocused();
    await expect(button).toHaveCSS("outline-style", "solid");
    await expect(button).toHaveCSS("outline-width", "2px");
  }
});

test("Inset shadows remain nontransparent on light solid and dark ghost buttons", async ({ page }) => {
  const area = preview(page);
  const animation = area.getByLabel("Animation");
  for (const [appearance, variant] of [["light", "default"], ["dark", "ghost"]]) {
    await page.getByLabel("Appearance").selectOption(appearance);
    await area.getByLabel("Style").selectOption(variant);
    await animation.selectOption("inset");
    await animation.focus();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const button = area.getByRole("button", { name: "Save changes" });
    await expect(button).toBeFocused();
    const shadow = await button.evaluate((element) => getComputedStyle(element).boxShadow);
    expect(shadow).not.toBe("none");
    expect(shadow).not.toContain("transparent");
  }
});

test("sizes retain their heights, customization reaches Button, and the page fits narrow screens", async ({ page }) => {
  const area = preview(page);
  for (const [size, height] of [["sm", "32px"], ["default", "36px"], ["lg", "40px"]]) {
    await area.getByLabel("Size").selectOption(size);
    await expect(area.getByRole("button", { name: "Save changes" })).toHaveCSS("height", height);
  }

  await area.getByLabel("Size").selectOption("default");
  await page.evaluate(() => {
    document.documentElement.style.setProperty("--primary", "#123456");
    document.documentElement.style.setProperty("--font-sans", "monospace");
    document.documentElement.style.setProperty("--radius", "20px");
  });
  const button = area.getByRole("button", { name: "Save changes" });
  await expect(button).toHaveCSS("background-color", "rgb(18, 52, 86)");
  await expect(button).toHaveCSS("font-family", "monospace");
  await expect(button).toHaveCSS("border-radius", "16px");

  await page.setViewportSize({ width: 320, height: 740 });
  await expect(button).toHaveCSS("white-space", "normal");
  await expect(button).toHaveCSS("overflow-wrap", "anywhere");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

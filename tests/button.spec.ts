import { expect, test } from "@playwright/test";

const preview = (page: import("@playwright/test").Page) => page.locator("#button-detail-content");

test.beforeEach(async ({ page }) => {
  await page.goto("/components/button");
});

test("detail page omits contextual examples and the source section", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "See it in context." })).toHaveCount(0);
  await expect(page.locator("#examples")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Examples" })).toHaveCount(0);
  await expect(page.locator("#source")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Source" })).toHaveCount(0);
  await expect(page.locator("#api").getByRole("link", { name: "Read guide" })).toHaveAttribute("href", "/getting-started/nextjs");
});

test("comparison board appears before usage with all variants and motion previews", async ({ page }) => {
  const contract = page.locator("#api");
  await expect(contract.getByRole("table").getByRole("row")).toHaveCount(7);
  await expect(contract.getByRole("heading", { name: "What happens when you press?" })).toBeVisible();
  await expect(contract.getByRole("button", { name: "Press to try" })).toHaveCount(3);
  await expect(page.getByRole("navigation", { name: "Contract layout previews" })).toHaveCount(0);
  expect(await contract.evaluate((element) => {
    const usage = document.querySelector("#usage");
    return usage ? Boolean(element.compareDocumentPosition(usage) & Node.DOCUMENT_POSITION_FOLLOWING) : false;
  })).toBe(true);
});

test("preview starts with no animation and its controls match the usage snippet", async ({ page }) => {
  const area = preview(page);
  const animation = area.getByLabel("Animation");
  const button = area.getByRole("button", { name: "Save changes" });
  const snippet = page.locator("#usage pre code");

  await expect(animation).toHaveValue("none");
  await expect(button).toHaveAttribute("data-animation", "none");
  for (const effect of ["compression-bloom", "light-through-glass", "precision-snap"]) {
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

test("Bloom squashes wide while Snap presses evenly", async ({ page }) => {
  const animation = preview(page).getByLabel("Animation");
  const action = page.locator("#preview").getByRole("button", { name: "Save changes" });
  await action.scrollIntoViewIfNeeded();
  const box = await action.boundingBox();
  if (!box) throw new Error("Preview Button has no layout box");
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };

  await animation.selectOption("compression-bloom");
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await expect.poll(() => action.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeGreaterThan(1);
  await page.mouse.up();

  await animation.selectOption("precision-snap");
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await expect.poll(() => action.evaluate((element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a)).toBeLessThan(1);
  await page.mouse.up();
});

test("Compression Bloom squeezes on hold and releases a bounded wave", async ({ page }) => {
  await preview(page).getByLabel("Animation").selectOption("compression-bloom");
  const action = page.locator("#preview").getByRole("button", { name: "Save changes" });

  await action.scrollIntoViewIfNeeded();
  const box = await action.boundingBox();
  if (!box) throw new Error("Bloom action button has no layout box");
  const point = { x: box.x + 8, y: box.y + box.height / 2 };
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await expect.poll(() => action.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
  await page.mouse.up();
  const wave = action.locator(".cl-button__wave");
  await expect(wave).toHaveCount(1);

  await action.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(wave).toHaveCSS("opacity", "0", { timeout: 1000 });
});

test("cancelled pointer presses do not play a release wave", async ({ page }) => {
  await preview(page).getByLabel("Animation").selectOption("compression-bloom");
  const action = page.locator("#preview").getByRole("button", { name: "Save changes" });
  await action.scrollIntoViewIfNeeded();
  const box = await action.boundingBox();
  if (!box) throw new Error("Bloom action button has no layout box");

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + 40, box.y + box.height + 40);
  await page.mouse.up();
  await expect(action.locator(".cl-button__wave")).toHaveCSS("opacity", "0");
  await expect(action).toHaveCSS("transform", "none");
});

test("disabled and loading preview states suppress effects while preserving icon names", async ({ page }) => {
  const area = preview(page);
  await area.getByLabel("Animation").selectOption("compression-bloom");
  await area.getByLabel("Size").selectOption("icon");
  const iconButton = area.getByRole("button", { name: "Save changes" });

  await iconButton.click();
  await expect(iconButton.locator(".cl-button__wave")).toHaveCount(1);
  await area.getByLabel("Loading").check();
  const loadingButton = area.getByRole("button", { name: "Save changes" });
  await expect(loadingButton).toHaveAttribute("aria-busy", "true");
  await expect(loadingButton.locator(".cl-button__pending svg")).toBeVisible();
  await expect(loadingButton.locator(".cl-button__wave")).toHaveCSS("opacity", "0");
  await area.getByLabel("Loading").uncheck();
  await area.getByLabel("Disabled").check();
  await expect(iconButton).toBeDisabled();
  await iconButton.click({ force: true });
  await expect(iconButton.locator(".cl-button__wave")).toHaveCSS("opacity", "0");
});

test("reduced motion leaves static interaction cues", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const area = preview(page);
  await area.getByLabel("Animation").selectOption("compression-bloom");
  const button = area.getByRole("button", { name: "Save changes" });
  await button.click();
  await expect(button.locator(".cl-button__effects")).toHaveCSS("display", "none");

  const animation = area.getByLabel("Animation");
  await animation.selectOption("precision-snap");
  await page.keyboard.press("Tab");
  await button.focus();
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("outline-style", "solid");
  await page.keyboard.down("Space");
  await expect(button).toHaveCSS("transform", "none");
  await expect.poll(() => button.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
  await page.keyboard.up("Space");
});

test("switching to reduced motion stops an active preset", async ({ page }) => {
  await preview(page).getByLabel("Animation").selectOption("compression-bloom");
  const action = page.locator("#preview").getByRole("button", { name: "Save changes" });
  await action.scrollIntoViewIfNeeded();
  const box = await action.boundingBox();
  if (!box) throw new Error("Bloom action button has no layout box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect.poll(() => action.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(action).toHaveCSS("transform", "none");
  await expect(action.locator(".cl-button__effects")).toHaveCSS("display", "none");
  await page.mouse.up();
});

test("touch activation does not depend on hover", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, hasTouch: true, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/components/button");
  await preview(page).getByLabel("Animation").selectOption("compression-bloom");
  const action = page.locator("#preview").getByRole("button", { name: "Save changes" });
  await action.tap();
  await expect(action).toHaveAttribute("data-animation", "compression-bloom");
  await context.close();
});

test("all variants and sizes remain visible in both preview appearances", async ({ page }) => {
  const area = preview(page);
  for (const appearance of ["light", "dark"]) {
    await page.getByRole("group", { name: "Preview appearance" }).getByRole("button", { name: appearance === "light" ? "Light" : "Dark", exact: true }).click();
    for (const variant of ["default", "secondary", "outline", "ghost", "destructive", "link"]) {
      await area.getByLabel("Style").selectOption(variant);
      await area.getByLabel("Animation").selectOption("light-through-glass");
      const button = area.getByRole("button", { name: "Save changes" });
      await expect(button).toBeVisible();
      await expect.poll(() => button.evaluate((element) => getComputedStyle(element).color)).not.toBe("rgba(0, 0, 0, 0)");

      for (const size of ["sm", "default", "lg", "icon-sm", "icon", "icon-lg"]) {
        await area.getByLabel("Size").selectOption(size);
        const namedButton = area.getByRole("button", { name: "Save changes" });
        await expect(namedButton).toBeVisible();
        await expect(namedButton).toHaveAttribute("data-animation", "light-through-glass");
      }
    }
  }
});

test("keyboard focus outline remains visible with every preset and reduced motion", async ({ page }) => {
  const area = preview(page);
  const animation = area.getByLabel("Animation");
  for (const effect of ["compression-bloom", "light-through-glass", "precision-snap"]) {
    await animation.selectOption(effect);
    const button = area.getByRole("button", { name: "Save changes" });
    await button.focus();
    await expect(button).toHaveCSS("outline-style", "solid");
    await expect(button).toHaveCSS("outline-width", "2px");
  }

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const effect of ["compression-bloom", "light-through-glass", "precision-snap"]) {
    await animation.selectOption(effect);
    const button = area.getByRole("button", { name: "Save changes" });
    await button.focus();
    await expect(button).toHaveCSS("outline-style", "solid");
    await expect(button).toHaveCSS("outline-width", "2px");
  }
});

test("preset layers are bounded on light solid and dark ghost buttons", async ({ page }) => {
  const area = preview(page);
  const animation = area.getByLabel("Animation");
  for (const [appearance, variant] of [["light", "default"], ["dark", "ghost"]]) {
    await page.getByRole("group", { name: "Preview appearance" }).getByRole("button", { name: appearance === "light" ? "Light" : "Dark", exact: true }).click();
    await area.getByLabel("Style").selectOption(variant);
    await animation.selectOption("compression-bloom");
    const button = area.getByRole("button", { name: "Save changes" });
    await expect(button.locator(".cl-button__effects")).toHaveCSS("overflow", "hidden");
    await expect(button).toHaveCSS("overflow", "visible");
  }
});

test("sizes retain their heights, customization reaches Button, and the page fits narrow screens", async ({ page }) => {
  const area = preview(page);
  for (const [size, height] of [["sm", "32px"], ["default", "36px"], ["lg", "40px"]]) {
    await area.getByLabel("Size").selectOption(size);
    await expect(area.getByRole("button", { name: "Save changes" })).toHaveCSS("height", height);
  }

  await area.getByLabel("Size").selectOption("default");
  await expect(area.getByRole("button", { name: "Save changes" })).toHaveCSS("border-radius", "11.2px");
  await page.evaluate(() => {
    const preview = document.querySelector<HTMLElement>("#preview")!;
    preview.style.setProperty("--primary", "#123456");
    preview.style.setProperty("--font-sans", "monospace");
    preview.style.setProperty("--radius", "20px");
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

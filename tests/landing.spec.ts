import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

test("desktop opening provides immediate component access and truthful availability", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Small pieces. Complete interfaces." })).toBeVisible();
  const explore = page.getByRole("link", { name: "Explore components", exact: true });
  await expect(explore).toBeInViewport();
  await expect(page.locator("[data-tier='asteroid']").getByText("Coming soon · composed UI")).toBeVisible();
  await expect(page.locator("[data-tier='galaxy']").getByText("Coming soon · complete interfaces")).toBeVisible();
  await explore.click();
  await expect(page).toHaveURL(/\/components$/);
  await expect(page.getByRole("heading", { name: "Particles.", exact: true, level: 1 })).toBeVisible();
});

test("the initial galaxy entrance completes without a pause control or saved pause", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("asteroidui:motion-paused:v1", "true");
    const browserWindow = window as unknown as Window & { entranceSamples: number[] };
    browserWindow.entranceSamples = [];
    new MutationObserver(records => {
      for (const record of records) {
        const value = Number((record.target as HTMLCanvasElement).dataset.entrance);
        if (Number.isFinite(value)) browserWindow.entranceSamples.push(value);
      }
    }).observe(document, { attributes: true, attributeFilter: ["data-entrance"], subtree: true });
  });
  await page.goto("/");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.getByRole("button", { name: /Pause motion|Resume motion/ })).toHaveCount(0);
  await expect.poll(async () => Number(await canvas.getAttribute("data-entrance"))).toBeGreaterThan(0);
  await expect.poll(async () => Number(await canvas.getAttribute("data-entrance"))).toBeGreaterThan(0.999);
  expect(Number(await canvas.getAttribute("data-entrance"))).toBeLessThanOrEqual(1);
  const entranceSamples = await page.evaluate(() => (window as unknown as Window & { entranceSamples: number[] }).entranceSamples);
  expect(entranceSamples[0]).toBe(0);
  expect(entranceSamples.every(value => value >= 0 && value <= 1)).toBe(true);
});

test("reduced motion keeps the still and links, including live preference changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const scripts: Promise<boolean>[] = [];
  page.on("response", response => {
    if (response.url().split("?")[0].endsWith(".js")) {
      scripts.push(response.text().then(text => text.includes("THREE.WebGLRenderer")).catch(() => false));
    }
  });
  await page.goto("/");
  await expect(page.getByText(/Reduced motion|Still view/, { exact: true })).toHaveCount(0);
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "still");
  expect((await Promise.all(scripts)).some(Boolean)).toBe(false);
  await expect(page.getByRole("link", { name: "Explore components", exact: true })).toBeInViewport();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "still");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
});

test("WebGL failure retains the poster and immediate navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).startsWith("webgl")) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByText("Still view", { exact: true })).toHaveCount(0);
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "fallback");
  await page.getByRole("link", { name: "Explore components", exact: true }).click();
  await expect(page).toHaveURL(/\/components$/);
});

test("native scroll disperses stars and returning from catalog restores a single scene", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  await page.mouse.wheel(0, 650);
  await expect.poll(async () => Number(await canvas.getAttribute("data-progress"))).toBeGreaterThan(0.5);
  await page.getByRole("link", { name: "Read the Button docs", exact: true }).click();
  await expect(page).toHaveURL(/\/components\/button$/);
  await page.goBack();
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  await expect(canvas).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("hero hover does not deflect the galaxy or rotate it", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const rotation = await canvas.getAttribute("data-rotation");
  await page.mouse.move(1050, 450);
  await page.mouse.move(1100, 420, { steps: 8 });
  await expect(canvas).toHaveAttribute("data-disturbance", "0.000");
  await expect(canvas).toHaveAttribute("data-rotation", rotation!);
});

test("inward flow animates without pointer input", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const time = Number(await canvas.getAttribute("data-flow-time"));
  const before = await canvas.screenshot();
  await expect.poll(async () => Number(await canvas.getAttribute("data-flow-time"))).toBeGreaterThan(time + 0.6);
  expect((await canvas.screenshot()).equals(before)).toBe(false);
});

test("drag rotates on both axes and releases capture", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const start = await canvas.getAttribute("data-rotation");
  await page.mouse.move(1100, 450);
  await page.mouse.down();
  await expect(canvas).toHaveAttribute("data-dragging", "true");
  await page.mouse.move(1200, 450, { steps: 10 });
  await expect(canvas).not.toHaveAttribute("data-rotation", start!);
  const horizontal = await canvas.getAttribute("data-rotation");
  await page.mouse.move(1200, 300, { steps: 10 });
  await expect(canvas).not.toHaveAttribute("data-rotation", horizontal!);
  await page.mouse.up();
  await expect(canvas).toHaveAttribute("data-dragging", "false");
});

test("scroll blast reverses into the same galaxy orientation", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const rotation = await canvas.getAttribute("data-rotation");
  await page.mouse.wheel(0, 600);
  await expect.poll(async () => Number(await canvas.getAttribute("data-progress"))).toBeGreaterThan(0.6);
  await page.mouse.wheel(0, -900);
  await expect.poll(async () => Number(await canvas.getAttribute("data-progress"))).toBeLessThan(0.002);
  await expect(canvas).toHaveAttribute("data-rotation", rotation!);
});

test("a GPU upload failure falls back without an unhandled error", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(() => {
    WebGL2RenderingContext.prototype.bufferData = () => { throw new Error("Simulated GPU upload failure"); };
  });
  await page.goto("/");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "fallback");
  await page.locator("#first-particle").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Try the button", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard skip, loading demo and dark presentation work without changing catalog theme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const skip = page.getByRole("link", { name: "Skip to content", exact: true });
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#landing-content")).toBeFocused();
  await expect(page.locator("[data-desktop-landing]")).toHaveCSS("background-color", "rgb(17, 17, 17)");
  await expect(page.locator("html")).toHaveClass(/light/);
  const showcase = page.locator("#first-particle");
  await showcase.scrollIntoViewIfNeeded();
  await showcase.getByRole("radio", { name: "Action feedback", exact: true }).check();
  await showcase.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(showcase.getByText("The simulated save failed. Try again to finish.", { exact: true })).toBeVisible();
  await showcase.getByRole("button", { name: "Retry save", exact: true }).click();
  await expect(showcase.getByText("Saved in this demonstration.", { exact: true })).toBeVisible();
});

test("dispersed stars visibly animate and respond below the hero", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  await page.locator("#first-particle").evaluate(node => node.scrollIntoView({ block: "start" }));
  await page.evaluate(() => window.scrollBy(0, 100));
  await expect.poll(async () => Number(await canvas.getAttribute("data-progress"))).toBeGreaterThan(0.99);
  await page.mouse.move(10, 20);
  const clip = { x: 1380, y: 100, width: 32, height: 650 };
  const before = await page.screenshot({ clip });
  const time = Number(await canvas.getAttribute("data-ambient-time"));
  await expect.poll(async () => Number(await canvas.getAttribute("data-ambient-time"))).toBeGreaterThan(time + 0.7);
  expect((await page.screenshot({ clip })).equals(before)).toBe(false);
  await page.mouse.move(1400, 320, { steps: 6 });
  await expect.poll(async () => Number(await canvas.getAttribute("data-disturbance"))).toBeGreaterThan(0.4);
  await page.mouse.move(800, 500);
  await expect.poll(async () => Number(await canvas.getAttribute("data-disturbance"))).toBeLessThan(0.002);
});

test("narrow screens retain the existing page and do not initialize desktop rendering", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "A shared visual foundation" })).toBeVisible();
  await expect(page.locator("[data-desktop-landing]")).toBeHidden();
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "still");
});

test("desktop renderer can resume after crossing the deferred mobile boundary", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "still");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  await expect(page.locator("[data-desktop-landing] canvas")).toHaveCount(1);
});

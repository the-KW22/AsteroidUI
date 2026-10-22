import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

async function scrollStory(page: import("@playwright/test").Page, position: number) {
  await page.locator("[data-horizontal-journey]").evaluate((journey, value) => {
    window.scrollTo(0, window.scrollY + journey.getBoundingClientRect().top + (journey.clientHeight - innerHeight) * value);
  }, position);
}

test("the complete desktop story distinguishes future tiers and reaches real setup guides", async ({ page }) => {
  await page.goto("/");
  const landing = page.locator("[data-desktop-landing]");
  await expect(landing.locator("main > section")).toHaveCount(4);
  const tiers = page.locator("#tiers");
  await expect(tiers.getByRole("heading", { name: "Particles", exact: true })).toBeVisible();
  await expect(tiers.getByRole("heading", { name: "Asteroid", exact: true })).toBeVisible();
  await expect(tiers.getByRole("heading", { name: "Galaxy", exact: true })).toBeVisible();
  await expect(tiers.getByText("Available now · 9 components", { exact: true })).toBeVisible();
  await expect(tiers.getByText("Coming soon · composed UI", { exact: true })).toBeVisible();
  await expect(tiers.getByText("Coming soon · complete interfaces", { exact: true })).toBeVisible();
  await expect(page.locator("#start-building").getByRole("link", { name: "View source on GitHub" })).toHaveAttribute("href", "https://github.com/the-KW22/AsteroidUI");
  // Future interface studies must not expose pretend form or navigation actions.
  await expect(tiers.getByRole("button")).toHaveCount(0);
  await expect(page.locator("#make-it-yours")).toHaveCount(0);
  await expect(tiers.locator("article")).toHaveCount(3);
  await expect(tiers.locator("article").first().getByRole("link", { name: "Explore Particles" })).toHaveAttribute("href", "/components");
  await page.locator("#start-building").getByRole("link", { name: "Next.js App Router setup" }).click();
  await expect(page).toHaveURL(/\/getting-started\/nextjs$/);
  await page.goBack();
  await page.locator("#start-building").getByRole("link", { name: "Vite React setup" }).click();
  await expect(page).toHaveURL(/\/getting-started\/vite$/);
});

test("the Particles chapter has a clearly visible animated foreground", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(canvas).toHaveAttribute("data-story-body-count", "0");
  await scrollStory(page, 0);
  await expect(canvas).toHaveAttribute("data-story-body-count", "0");
  await scrollStory(page, 0.1);
  await expect.poll(async () => Number(await canvas.getAttribute("data-story-body-count"))).toBeGreaterThan(0);
  await expect(canvas).toHaveAttribute("data-story-presence", "1.000");
  await expect(canvas).toHaveAttribute("data-progress", "1.000");
  await expect.poll(async () => Number((await canvas.getAttribute("data-formation"))!.split(",")[0])).toBeLessThan(0.002);
  const clip = { x: 800, y: 120, width: 560, height: 600 };
  const image = await page.screenshot({ clip });
  const brightPixels = await page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const surface = document.createElement("canvas");
    surface.width = image.width;
    surface.height = image.height;
    const context = surface.getContext("2d")!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, image.width, image.height).data;
    let count = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 300) count++;
    }
    return count;
  }, image.toString("base64"));
  await testInfo.attach("particle-visibility", { body: JSON.stringify({ brightPixels }), contentType: "application/json" });
  expect(brightPixels).toBeGreaterThan(1000);
  const time = Number(await canvas.getAttribute("data-ambient-time"));
  await expect.poll(async () => Number(await canvas.getAttribute("data-ambient-time"))).toBeGreaterThan(time + 0.4);
  expect((await page.screenshot({ clip })).equals(image)).toBe(false);
});

test("the same scene forms an asteroid and galaxy and reverses with native scrolling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const canvas = page.locator("[data-desktop-landing] canvas");
  async function chapter(name: string) { await scrollStory(page, name === "particles" ? 0.1 : name === "asteroid" ? 0.5 : 0.73); }
  const formation = async () => (await canvas.getAttribute("data-formation"))!.split(",").map(Number);
  await chapter("asteroid");
  await expect.poll(async () => (await formation())[0]).toBeGreaterThan(0.95);
  await expect.poll(async () => (await formation())[1]).toBeLessThan(0.4);
  const asteroid = await canvas.screenshot();
  await page.mouse.move(1350, 350);
  await expect.poll(async () => Number(await canvas.getAttribute("data-disturbance"))).toBeGreaterThan(0.2);
  await page.locator("[data-tier='asteroid'] [data-reading-surface]").hover();
  await expect.poll(async () => Number(await canvas.getAttribute("data-disturbance"))).toBeLessThan(0.002);
  await chapter("galaxy");
  await expect.poll(async () => (await formation())[1]).toBeGreaterThan(0.85);
  expect((await canvas.screenshot()).equals(asteroid)).toBe(false);
  await chapter("particles");
  await expect.poll(async () => (await formation())[0]).toBeLessThan(0.2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect.poll(async () => (await formation())[0]).toBeLessThan(0.002);
  await expect(page.locator("[data-desktop-landing] canvas")).toHaveCount(1);
});

test("fragments assemble the asteroid before the hero stellar galaxy returns", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready");
  const state = async () => (await canvas.getAttribute("data-formation"))!.split(",").map(Number);
  const clip = { x: 700, y: 140, width: 650, height: 580 };
  await scrollStory(page, 0.1);
  await expect(canvas).toHaveAttribute("data-progress", "1.000");
  const particles = await page.screenshot({ clip });
  await scrollStory(page, 0.24);
  await expect.poll(async () => (await state())[0]).toBeGreaterThan(0.4);
  await expect.poll(async () => (await state())[0]).toBeLessThan(0.9);
  const assembling = await page.screenshot({ clip });
  await expect.poll(async () => Number(await canvas.getAttribute("data-story-assembly"))).toBeGreaterThan(0.1);
  await expect.poll(async () => Number(await canvas.getAttribute("data-story-assembly"))).toBeLessThan(0.9);
  expect(assembling.equals(particles)).toBe(false);
  await testInfo.attach("assembling-rock", { body: assembling, contentType: "image/png" });
  await scrollStory(page, 0.5);
  await expect.poll(async () => (await state())[0]).toBeGreaterThan(0.995);
  await expect.poll(async () => Number(await canvas.getAttribute("data-story-locked-fragments"))).toBeGreaterThan(60);
  const asteroid = await page.screenshot({ clip });
  expect(asteroid.equals(assembling)).toBe(false);
  await scrollStory(page, 0.58);
  await expect.poll(async () => (await state())[1]).toBeGreaterThan(0.3);
  await expect.poll(async () => (await state())[1]).toBeLessThan(0.95);
  await expect.poll(async () => Number(await canvas.getAttribute("data-star-morph"))).toBeGreaterThan(0.3);
  await expect.poll(async () => Number(await canvas.getAttribute("data-star-morph"))).toBeLessThan(0.95);
  await expect.poll(async () => Number(await canvas.getAttribute("data-asteroid-fracture"))).toBeGreaterThan(0.1);
  await expect(canvas).toHaveAttribute("data-story-body-count", "200");
  await testInfo.attach("returning-stellar-galaxy", { body: await page.screenshot({ clip }), contentType: "image/png" });
  await scrollStory(page, 0.73);
  await expect.poll(async () => (await state())[1]).toBeGreaterThan(0.995);
  await expect(canvas).toHaveAttribute("data-story-body-count", "0");
  await expect(canvas).toHaveAttribute("data-story-orbit-body-count", "0");
  await expect(canvas).toHaveAttribute("data-story-star-count", "28000");
  await expect.poll(async () => Number(await canvas.getAttribute("data-galaxy-opacity"))).toBeGreaterThan(0.995);
  await expect(canvas).toHaveAttribute("data-star-dispersion", "1.000");
  const flowTime = Number(await canvas.getAttribute("data-flow-time"));
  await expect.poll(async () => Number(await canvas.getAttribute("data-flow-time"))).toBeGreaterThan(flowTime + 0.2);
  expect((await page.screenshot({ clip })).equals(asteroid)).toBe(false);
});

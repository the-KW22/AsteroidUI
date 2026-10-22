import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "no-preference" });

async function scrollStory(page: import("@playwright/test").Page, position: number) {
  await page.locator("[data-horizontal-journey]").evaluate((journey, value) => {
    window.scrollTo(0, window.scrollY + journey.getBoundingClientRect().top + (journey.clientHeight - innerHeight) * value);
  }, position);
}

test("story foreground waits for Particles and disappears at the Galaxy boundary", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready", { timeout: 15000 });
  await page.locator("#tiers-title").evaluate(node => node.scrollIntoView({ block: "center" }));
  const introTime = Number(await canvas.getAttribute("data-ambient-time"));
  await expect.poll(async () => Number(await canvas.getAttribute("data-ambient-time"))).toBeGreaterThan(introTime + 0.4);
  await expect(canvas).toHaveAttribute("data-story-body-count", "0");
  await scrollStory(page, 0.04);
  await expect(canvas).toHaveAttribute("data-story-body-count", "200");
  await scrollStory(page, 0.5);
  await expect.poll(async () => Number(await canvas.getAttribute("data-story-locked-fragments"))).toBe(80);
  await scrollStory(page, 0.7);
  await expect(canvas).toHaveAttribute("data-story-body-count", "0");
  await scrollStory(page, 0.73);
  await expect(canvas).toHaveAttribute("data-story-body-count", "0");
  await expect(canvas).toHaveAttribute("data-story-star-count", "28000");
  await scrollStory(page, 0.5);
  await expect(canvas).toHaveAttribute("data-story-body-count", "200");
});

test("Start building restores the dispersed background without another explosion", async ({ page }) => {
  await page.goto("/");
  const canvas = page.locator("[data-desktop-landing] canvas");
  await expect(page.locator("[data-scene-state]")).toHaveAttribute("data-scene-state", "ready", { timeout: 15000 });
  await scrollStory(page, 0.73);
  await expect(canvas).toHaveAttribute("data-story-star-count", "28000");
  await expect(canvas).toHaveAttribute("data-star-dispersion", "1.000");
  const galaxyBottom = await page.locator("[data-tier='galaxy']").evaluate(node => scrollY + node.getBoundingClientRect().bottom);
  for (const offset of [-300, -150, 0, 150, 300]) {
    await page.evaluate(y => window.scrollTo(0, y), galaxyBottom - 450 + offset);
    await expect(canvas).toHaveAttribute("data-star-dispersion", "1.000");
    await expect(canvas).toHaveAttribute("data-story-body-count", "0");
  }
  await page.locator("#start-building").evaluate(node => node.scrollIntoView({ block: "center" }));
  await expect(canvas).toHaveAttribute("data-galaxy-opacity", "0.000");
});

test("reduced-motion story uses vertical chapters and direct stage anchors", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const timeline = page.getByRole("navigation", { name: "Story stages" });
  await expect(timeline).toBeHidden();
  for (const stage of ["galaxy", "asteroid", "particles"]) {
    await page.goto(`/#stage-${stage}`);
    await expect(page).toHaveURL(new RegExp(`#stage-${stage}$`));
    await expect(page.locator(`[data-tier='${stage}']`).getByRole("heading", { name: stage[0].toUpperCase() + stage.slice(1), exact: true })).toBeVisible();
  }
});

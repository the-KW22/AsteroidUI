import { expect, test } from "@playwright/test";

test("all nine basics compose and serialize native form values", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/examples/collection");
  const form = page.getByRole("region", { name: "Collection form", exact: true });
  await form.getByLabel("Name", { exact: true }).fill("Sam");
  await form.getByLabel("Notes", { exact: true }).fill("Works together");
  await form.getByRole("combobox", { name: "Topic" }).click();
  await page.getByRole("option", { name: "Engineering", exact: true }).click();
  await form.getByRole("radio", { name: "Monthly", exact: true }).check();
  await form.getByRole("checkbox", { name: "Accept terms" }).uncheck();
  await form.getByRole("button", { name: "Submit preferences" }).click();
  await expect(form.getByRole("status")).toHaveText(JSON.stringify({ name: "Sam", notes: "Works together", topic: "engineering", delivery: "monthly", updates: "enabled" }));
  await expect(form.getByRole("button", { name: "Submitting", exact: true })).toHaveAttribute("aria-busy", "true");
  await form.getByRole("button", { name: "Finish submission" }).click();
  await expect(form.getByRole("button", { name: "Submit preferences" })).not.toHaveAttribute("aria-busy", "true");
  expect(errors).toEqual([]);
});

test("collection inherits shared settings and fits light/dark narrow layouts", async ({ page }) => {
  await page.goto("/examples/collection");
  const form = page.getByRole("region", { name: "Collection form", exact: true });
  for (const appearance of ["light", "dark"]) {
    await page.getByRole("group", { name: "Appearance" }).getByRole("button", { name: appearance === "light" ? "Light" : "Dark", exact: true }).click();
    await page.keyboard.press("Tab");
    for (const control of [form.getByLabel("Name", { exact: true }), form.getByLabel("Notes", { exact: true }), form.getByRole("combobox", { name: "Topic" })]) {
      await expect(control).toBeVisible();
      await control.focus();
      await expect(control).toHaveCSS("outline-style", "solid");
    }
  }
  await page.evaluate(() => {
    const root = document.documentElement.style;
    root.setProperty("--font-sans", "monospace");
    root.setProperty("--radius", "20px");
    root.setProperty("--primary", "#123456");
    root.setProperty("--primary-foreground", "#ffffff");
  });
  await expect(form.getByLabel("Name", { exact: true })).toHaveCSS("font-family", "monospace");
  await expect(form.getByLabel("Name", { exact: true })).toHaveCSS("border-radius", "16px");
  await expect(form.getByRole("button", { name: "Submit preferences" })).toHaveCSS("background-color", "rgb(18, 52, 86)");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await form.getByRole("combobox", { name: "Topic" }).click();
  const popup = page.getByRole("listbox");
  await expect(popup).toBeVisible();
  expect(await popup.evaluate((element) => { const r = element.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })).toBe(true);
});

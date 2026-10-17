import { expect, test } from "@playwright/test";

test("installed actions keep focus and block repeat activation during loading", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const action = page.getByTestId("installed-button");
  await expect(action).toHaveAccessibleName("Save changes");
  await action.focus();
  await page.keyboard.press("Enter");
  await expect(action).toBeFocused();
  await expect(action).toHaveAttribute("aria-busy", "true");
  await expect(page.getByTestId("installed-status")).toHaveText("Saving");
  await expect(page.getByTestId("installed-count")).toHaveText("1");
  await page.keyboard.press("Space");
  await action.dispatchEvent("click");
  await expect(page.getByTestId("installed-count")).toHaveText("1");
  await page.getByRole("button", { name: "Finish saving", exact: true }).click();
  await expect(action).not.toHaveAttribute("aria-busy", "true");
  await expect(page.getByTestId("installed-status")).toHaveText("Saved");
  await action.click();
  await expect(page.getByTestId("installed-count")).toHaveText("2");
  expect(errors).toEqual([]);
});

test("installed theme settings and reduced-motion Spinner work independently", async ({ page }) => {
  await page.goto("/");
  const action = page.getByTestId("installed-button");
  await page.getByLabel("Dark appearance").check();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(23, 23, 23)");
  await page.getByLabel("Dark appearance").uncheck();
  await page.getByRole("button", { name: "Customize theme", exact: true }).click();
  await page.mouse.move(0, 0);
  await expect(action).toHaveCSS("background-color", "rgb(18, 52, 86)");
  await expect(action).toHaveCSS("font-family", "monospace");
  await expect(action).toHaveCSS("border-radius", "16px");
  const form = page.getByRole("region", { name: "Collection form", exact: true });
  for (const control of [form.getByLabel("Name", { exact: true }), form.getByLabel("Notes", { exact: true }), form.getByRole("combobox", { name: "Topic" })]) {
    await expect(control).toHaveCSS("font-family", "monospace");
    await expect(control).toHaveCSS("border-radius", "16px");
  }
  const spinner = page.getByTestId("installed-spinner").locator("svg");
  await expect(spinner).toHaveCSS("animation-name", "spin");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(spinner).toHaveCSS("animation-name", "none");
  await expect(page.getByTestId("installed-spinner")).toContainText("Loading preview");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("installed collection preserves labels, choices, form values and composition", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const form = page.getByRole("region", { name: "Collection form", exact: true });
  await form.locator('label[for="collection-name"]').click();
  const name = form.getByLabel("Name", { exact: true });
  await expect(name).toBeFocused();
  await name.fill("Sam");
  await form.getByLabel("Notes", { exact: true }).fill("Installed together");
  const topic = form.getByRole("combobox", { name: "Topic" });
  await topic.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(topic).toBeFocused();
  await topic.click();
  await page.getByRole("option", { name: "Engineering", exact: true }).click();
  const weekly = form.getByRole("radio", { name: "Weekly", exact: true });
  await weekly.focus();
  await page.keyboard.press("ArrowRight");
  await expect(form.getByRole("radio", { name: "Monthly", exact: true })).toBeChecked();
  await form.getByRole("checkbox", { name: "Accept terms" }).uncheck();
  const updates = form.getByRole("switch", { name: "Email updates" });
  await updates.focus();
  await page.keyboard.press("Space");
  await expect(updates).not.toBeChecked();
  await form.getByRole("button", { name: "Submit preferences" }).click();
  await expect(form.getByRole("status")).toHaveText(JSON.stringify({ name: "Sam", notes: "Installed together", topic: "engineering", delivery: "monthly" }));
  await expect(form.getByRole("button", { name: "Submitting", exact: true })).toHaveAttribute("aria-busy", "true");
  await form.getByRole("button", { name: "Finish submission" }).click();
  await expect(form.getByRole("button", { name: "Submit preferences" })).not.toHaveAttribute("aria-busy", "true");
  expect(errors).toEqual([]);
});

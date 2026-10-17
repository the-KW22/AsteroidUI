import { expect, test } from "@playwright/test";

const examples = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Select examples" });

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/collection");
});

test("renders associated labels, placeholders, and initial form values", async ({ page }) => {
  const area = examples(page);
  await expect(area.getByRole("combobox", { name: "Favorite fruit" })).toContainText("Apple");
  await expect(area.getByRole("combobox", { name: "Controlled fruit" })).toContainText("Pear");
  await expect(area.locator('input[name="fruit"]')).toHaveValue("apple");
  await expect(area.locator('input[name="controlledFruit"]')).toHaveValue("pear");
  await expect(area.getByRole("status", { name: "Controlled value" })).toHaveText("pear");
});

test("pointer selection updates uncontrolled and controlled values and form values", async ({ page }) => {
  const area = examples(page);
  await area.getByRole("combobox", { name: "Favorite fruit" }).click();
  await page.getByRole("option", { name: "Orange" }).click();
  await expect(area.locator('input[name="fruit"]')).toHaveValue("orange");

  const controlled = area.getByRole("combobox", { name: "Controlled fruit" });
  await expect(controlled).toHaveClass(/callback-closed/);
  await controlled.click();
  await expect(controlled).toHaveClass(/callback-open/);
  await page.getByRole("option", { name: "Grape" }).click();
  await expect(controlled).toHaveClass(/callback-closed/);
  await expect(controlled).toContainText("Grape");
  await expect(area.locator('input[name="controlledFruit"]')).toHaveValue("grape");
  await expect(area.getByRole("status", { name: "Controlled value" })).toHaveText("grape");
});

test("keyboard selection supports typeahead and Escape returns focus", async ({ page }) => {
  const area = examples(page);
  const trigger = area.getByRole("combobox", { name: "Favorite fruit" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("o");
  await page.keyboard.press("Enter");
  await expect(area.locator('input[name="fruit"]')).toHaveValue("orange");

  await trigger.focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("disabled roots and items cannot be selected", async ({ page }) => {
  const area = examples(page);
  const disabled = area.getByRole("combobox", { name: "Disabled select" });
  await expect(disabled).toBeDisabled();
  await disabled.click({ force: true });
  await expect(page.getByRole("listbox")).toHaveCount(0);

  const trigger = area.getByRole("combobox", { name: "Disabled option" });
  await trigger.click();
  const option = page.getByRole("option", { name: "Unavailable" });
  await expect(option).toHaveAttribute("aria-disabled", "true");
  await option.click({ force: true });
  await expect(trigger).toContainText("Available");
});

test("long option text stays within a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 300 });
  const area = examples(page);
  const trigger = area.getByRole("combobox", { name: "Favorite fruit" });
  await trigger.evaluate((element) => element.scrollIntoView({ block: "end" }));
  await trigger.click();
  const option = page.getByRole("option", {
    name: "A very long fruit option that must remain inside the available viewport width",
  });
  await expect(option).toBeVisible();
  const bounds = await page.getByRole("listbox").evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width, viewport: window.innerWidth };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport);
  expect(bounds.width).toBeLessThanOrEqual(bounds.viewport);

  const listbox = page.getByRole("listbox");
  const verticalBounds = await listbox.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewport: window.innerHeight,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    };
  });
  expect(verticalBounds.top).toBeGreaterThanOrEqual(0);
  expect(verticalBounds.bottom).toBeLessThanOrEqual(verticalBounds.viewport);
  expect(verticalBounds.scrollHeight).toBeGreaterThan(verticalBounds.clientHeight);

  const lastOption = page.getByRole("option", { name: "Watermelon" });
  await lastOption.scrollIntoViewIfNeeded();
  await expect(lastOption).toBeVisible();
});

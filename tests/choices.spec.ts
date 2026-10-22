import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/collection");
});

test("choice examples expose labels, state changes, and submitted values", async ({ page }) => {
  const region = page.getByRole("region", { name: "Choices examples" });
  const form = region.locator("form");
  const updates = form.getByRole("checkbox", { name: "Receive updates (controlled)" });
  const terms = form.getByRole("checkbox", { name: "Accept terms (uncontrolled)" });
  const notify = form.getByRole("switch", { name: "Notifications (controlled)" });
  const sync = form.getByRole("switch", { name: "Sync settings (uncontrolled)" });

  await expect(updates).toBeChecked();
  await expect(updates).toHaveClass(/shadow-md/);
  await updates.uncheck();
  await expect(updates).not.toBeChecked();
  await expect(updates).toHaveClass(/shadow-none/);
  await expect(terms).toBeChecked();
  await terms.uncheck();

  await expect(notify).not.toBeChecked();
  await notify.focus();
  await page.keyboard.press("Space");
  await expect(notify).toBeChecked();
  await expect(sync).toBeChecked();

  const group = form.getByRole("radiogroup", { name: "Density" });
  const comfortable = group.getByRole("radio", { name: "Comfortable" });
  await expect(comfortable).toBeChecked();
  await comfortable.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(group.getByRole("radio", { name: "Compact" })).toBeChecked();
  await expect(group.getByRole("radio", { name: "Spacious (unavailable)" })).toBeDisabled();

  await expect(form.getByRole("checkbox", { name: "Partially selected items" })).toHaveAttribute("aria-checked", "mixed");
  const disabledCheckbox = form.getByRole("checkbox", { name: "Disabled checkbox" });
  await expect(disabledCheckbox).toBeDisabled();
  await disabledCheckbox.click({ force: true });
  await expect(disabledCheckbox).toBeChecked();
  const disabledRadio = group.getByRole("radio", { name: "Spacious (unavailable)" });
  await expect(disabledRadio).toBeDisabled();
  await disabledRadio.click({ force: true });
  await expect(group.getByRole("radio", { name: "Compact" })).toBeChecked();
  const disabledSwitch = form.getByRole("switch", { name: "Unavailable option" });
  await expect(disabledSwitch).toBeDisabled();
  await disabledSwitch.click({ force: true });
  await expect(disabledSwitch).not.toBeChecked();

  await form.getByRole("button", { name: "Submit values" }).click();
  await expect(form.getByRole("status", { name: "Submitted values" })).toHaveText("density=compact&notifications=enabled&sync=enabled");
});

test("checkbox, radio, and switch show independent keyboard focus outlines", async ({ page }) => {
  const region = page.getByRole("region", { name: "Choices examples" });
  const checkbox = region.getByRole("checkbox", { name: "Receive updates (controlled)" });
  const radio = region.getByRole("radio", { name: "Comfortable" });
  const toggle = region.getByRole("switch", { name: "Notifications (controlled)" });

  for (const control of [checkbox, radio, toggle]) {
    await control.focus();
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS("outline-style", "solid");
    await expect(control).toHaveCSS("outline-width", "2px");
  }
});

test("choice defaults retain their static dimensions and update without waiting for motion", async ({ page }) => {
  const region = page.getByRole("region", { name: "Choices examples" });
  const checkbox = region.getByRole("checkbox", { name: "Accept terms (uncontrolled)" });
  const radio = region.getByRole("radio", { name: "Comfortable" });
  const toggle = region.getByRole("switch", { name: "Sync settings (uncontrolled)" });

  await expect(checkbox).toHaveCSS("width", "16px");
  await expect(checkbox).toHaveCSS("height", "16px");
  await expect(radio).toHaveCSS("width", "16px");
  await expect(radio).toHaveCSS("height", "16px");
  await expect(radio.locator("svg")).toBeVisible();
  await expect(toggle).toHaveCSS("width", "40px");
  await expect(toggle).toHaveCSS("height", "24px");

  await toggle.uncheck();
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(toggle).toBeChecked();
});

test("choice selection state commits immediately through rapid pointer and keyboard changes", async ({ page }) => {
  const region = page.getByRole("region", { name: "Choices examples" });
  const checkbox = region.getByRole("checkbox", { name: "Accept terms (uncontrolled)" });
  const group = region.getByRole("radiogroup", { name: "Density" });
  const compact = group.getByRole("radio", { name: "Compact" });
  const comfortable = group.getByRole("radio", { name: "Comfortable" });

  await checkbox.uncheck();
  await checkbox.check();
  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();

  await compact.click();
  await comfortable.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(compact).toBeChecked();
  await expect(comfortable).not.toBeChecked();
});

test("read-only choices ignore pointer and keyboard changes", async ({ page }) => {
  const region = page.getByRole("region", { name: "Choices examples" });
  const checkbox = region.getByRole("checkbox", { name: "Read-only checkbox" });
  const radioGroup = region.getByRole("radiogroup", { name: "Read-only preference" });
  const first = radioGroup.getByRole("radio", { name: "First option" });
  const second = radioGroup.getByRole("radio", { name: "Second option" });
  const toggle = region.getByRole("switch", { name: "Read-only switch" });

  await checkbox.click();
  await expect(checkbox).toBeChecked();
  await checkbox.focus();
  await page.keyboard.press("Space");
  await expect(checkbox).toBeChecked();

  await expect(first).toBeChecked();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(first).toBeChecked();
  await expect(second).not.toBeChecked();

  await expect(toggle).toBeChecked();
  await toggle.click();
  await expect(toggle).toBeChecked();
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
});

test("root and hidden input refs point to the checkbox elements", async ({ page }) => {
  const region = page.getByRole("region", { name: "Choices examples" });
  const checkbox = region.getByRole("checkbox", { name: "Receive updates (controlled)" });

  await region.getByRole("button", { name: "Focus checkbox and inspect input ref" }).click();
  await expect(checkbox).toBeFocused();
  await expect(region.getByRole("status", { name: "Checkbox ref result" })).toHaveText("checkbox input named updates");
});

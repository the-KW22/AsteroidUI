import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/examples/collection");
});

test("labels focus associated fields and describe input and textarea", async ({ page }) => {
  const fields = page.getByRole("region", { name: "Fields examples" });
  const name = fields.getByRole("textbox", { name: "Name" });
  const message = fields.getByRole("textbox", { name: "Message", exact: true });

  await expect(name).toHaveAttribute("aria-describedby", "fields-name-help");
  await expect(message).toHaveAttribute("aria-describedby", "fields-message-help");
  await fields.getByText("Name", { exact: true }).click();
  await expect(name).toBeFocused();
  await fields.getByRole("button", { name: "Focus message field" }).click();
  await expect(message).toBeFocused();
  await fields.getByRole("button", { name: "Focus name field" }).click();
  await expect(name).toBeFocused();
  await name.fill("Ada");
  await expect(name).toHaveValue("Ada");
  await expect(message).toHaveValue("Hello");
  await expect(message).toHaveCSS("min-height", "80px");
  await expect(message).toHaveCSS("resize", "vertical");
});

test("native read-only, disabled, invalid and form serialization behavior is preserved", async ({ page }) => {
  const fields = page.getByRole("region", { name: "Fields examples" });
  const readonly = fields.getByRole("textbox", { name: "Read-only value" });
  const readonlyMessage = fields.getByRole("textbox", { name: "Read-only message" });
  const disabled = fields.getByRole("textbox", { name: "Disabled value" });
  const invalid = fields.getByRole("textbox", { name: "Invalid value" });

  await expect(readonly).toHaveAttribute("readonly", "");
  await expect(readonly).toHaveValue("Cannot edit");
  await expect(readonlyMessage).toHaveAttribute("readonly", "");
  await expect(readonlyMessage).toHaveValue("Cannot edit this message");
  await readonly.focus();
  await page.keyboard.type("changed");
  await expect(readonly).toHaveValue("Cannot edit");
  await readonlyMessage.focus();
  await page.keyboard.type("changed");
  await expect(readonlyMessage).toHaveValue("Cannot edit this message");
  await expect(disabled).toBeDisabled();
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  await expect(invalid).toHaveAttribute("aria-describedby", "fields-error");

  await fields.getByRole("textbox", { name: "Name" }).fill("Ada");
  await fields.getByRole("button", { name: "Submit fields" }).click();
  await expect(fields.getByLabel("Submitted fields")).toHaveText('{"name":"Ada","message":"Hello","readonly":"Cannot edit","readonlyMessage":"Cannot edit this message"}');
});

test("fields expose visible keyboard focus and shared token styling", async ({ page }) => {
  const fields = page.getByRole("region", { name: "Fields examples" });
  const name = fields.getByRole("textbox", { name: "Name" });

  await name.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(name).toHaveCSS("outline-style", "solid");
  await expect(name).toHaveCSS("height", "36px");
  await expect(name).toHaveCSS("border-radius", "8px");
  expect(await fields.getByText("Name", { exact: true }).evaluate((element) => getComputedStyle(element).fontFamily)).toContain("ui-sans-serif");
});

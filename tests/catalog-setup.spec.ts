import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { installCommand, isLocalRegistry, isLoopbackOrigin, registryOrigin } from "../src/catalog/registry-address";

test("registry items are served under the full registry path", async ({ request }) => {
  const response = await request.get("/registry/registry.json");
  expect(response.ok()).toBe(true);
  const catalog = await response.json();
  expect(catalog.items).toHaveLength(11);
  for (const item of catalog.items) {
    const payload = await request.get(`/registry/${item.name}.json`);
    expect(payload.ok()).toBe(true);
    expect((await payload.json()).name).toBe(item.name);
  }
  expect((await request.get("/r/button.json")).status()).toBe(404);
});

test("configured loopback origins keep the local registry instructions", () => {
  for (const origin of ["http://localhost:3000", "http://127.0.0.2:3000", "http://preview.localhost:3000", "http://[::1]:3000"]) {
    expect(isLoopbackOrigin(origin)).toBe(true);
  }
  expect(isLoopbackOrigin("https://asteroidui.example.test")).toBe(false);
});

test("AsteroidUI links its selected source and actual distributed MIT license", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByText("AsteroidUI", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "GitHub source", exact: true })).toHaveAttribute("href", "https://github.com/the-KW22/AsteroidUI");
  await page.getByRole("link", { name: "MIT License", exact: true }).click();
  await expect(page.getByRole("heading", { name: "MIT License", exact: true })).toBeVisible();
  const license = await readFile("LICENSE", "utf8");
  expect((await page.locator("pre").textContent())?.replace(/\r\n/g, "\n")).toBe(license.replace(/\r\n/g, "\n"));
  await expect(page.locator("pre")).toContainText("Copyright (c) 2026 Leow Kai Wen");
  const response = await request.get("/registry/utils.json");
  expect(response.ok()).toBe(true);
  const item = await response.json();
  expect(item.files.find((file: { path: string }) => file.path === "LICENSE").content.replace(/\r\n/g, "\n")).toBe(license.replace(/\r\n/g, "\n"));
  await page.goto("/components/input");
  await expect(page.getByRole("link", { name: "MIT License", exact: true })).toHaveAttribute("href", "/license");
});

test("getting started links framework guides, styling, and component installation", async ({ page }) => {
  await page.goto("/getting-started");
  await page.setViewportSize({ width: 320, height: 740 });
  await expect(page.getByRole("heading", { name: "Install components in your app" })).toBeVisible();
  await expect(page.getByText("not a public registry URL")).toHaveCount(isLocalRegistry ? 1 : 0);
  await expect(page.getByRole("link", { name: "Next.js App Router" })).toHaveAttribute("href", "/getting-started/nextjs");
  await expect(page.getByRole("link", { name: "Vite React" })).toHaveAttribute("href", "/getting-started/vite");
  await expect(page.getByRole("link", { name: "Button installation" })).toHaveAttribute("href", "/components/button#installation");
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("framework guides show configured install commands and correct CSS paths", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { copiedSetupText?: string }).copiedSetupText = text;
        },
      },
    });
  });
  const command = installCommand("button");
  for (const [route, cssLabel] of [["/getting-started/nextjs", "src/app/globals.css"], ["/getting-started/vite", "src/index.css"]]) {
    await page.goto(route);
    await page.setViewportSize({ width: 320, height: 740 });
    await expect(page.getByRole("heading", { name: cssLabel === "src/index.css" ? "Vite React" : "Next.js App Router" })).toBeVisible();
    await expect(page.getByText("The registry is not publicly hosted yet")).toHaveCount(isLocalRegistry ? 1 : 0);
    await expect(page.getByText(registryOrigin, { exact: true }).first()).toBeVisible();
    const commandBlock = page.getByLabel("Install Button from the registry", { exact: true });
    await expect(commandBlock).toContainText(command);
    await page.getByRole("button", { name: "Copy Install Button from the registry" }).click();
    await expect(commandBlock.locator("xpath=..").getByRole("status")).toHaveText("Copied");
    await expect.poll(() => page.evaluate(() => (window as Window & { copiedSetupText?: string }).copiedSetupText)).toBe(command);
    await expect(page.getByLabel(cssLabel, { exact: true })).toContainText(cssLabel === "src/index.css" ? "./components/ui/library.css" : "../components/ui/library.css");
    await expect(page.getByText("@/components/ui/button", { exact: false }).first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("framework guides include fresh project commands and complete component imports", async ({ page }) => {
  await page.goto("/getting-started/nextjs");
  await expect(page.getByLabel("Create a Next.js project", { exact: true })).toContainText("create-next-app@16.4.0");
  await expect(page.getByLabel("components.json", { exact: true })).toContainText('"style": "base-nova"');
  await expect(page.getByLabel("postcss.config.mjs", { exact: true })).toContainText('"@tailwindcss/postcss"');
  await expect(page.getByLabel("Button usage", { exact: true })).toContainText('"use client";');
  await expect(page.getByLabel("Button usage", { exact: true })).toContainText('import { Spinner } from "@/components/ui/spinner";');

  await page.goto("/getting-started/vite");
  await expect(page.getByLabel("Create a Vite project", { exact: true })).toContainText("npm init -y");
  await expect(page.getByLabel("vite.config.ts", { exact: true })).toContainText("tailwindcss()");
  await expect(page.getByLabel("Button usage", { exact: true })).not.toContainText('"use client"');
  await expect(page.getByLabel("Button usage", { exact: true })).toContainText('import { Button } from "@/components/ui/button";');
});

test("shared styling guide explains font, radius, colors, and host-owned dark mode", async ({ page }) => {
  await page.goto("/getting-started/theme");
  await expect(page.getByRole("heading", { name: "Shared styles and themes" })).toBeVisible();
  await expect(page.getByLabel("Application theme overrides", { exact: true })).toContainText("--font-sans");
  await expect(page.getByLabel("Application theme overrides", { exact: true })).toContainText("--radius");
  await expect(page.getByLabel("Application theme overrides", { exact: true })).toContainText("--primary");
  await expect(page.getByLabel("Application theme overrides", { exact: true })).toContainText("@font-face");
  await expect(page.getByLabel("Application theme overrides", { exact: true })).toContainText("--destructive-foreground");
  await expect(page.getByLabel("Application theme overrides", { exact: true })).toContainText("--card-foreground");
  await expect(page.getByText("The host application owns appearance selection and persistence.")).toBeVisible();
  await expect(page.getByText("The library does not install a theme provider.")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 740 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

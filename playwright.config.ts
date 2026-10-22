import { defineConfig } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { existsSync } from "node:fs";
import path from "node:path";

loadEnvConfig(process.cwd());
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const serverPort = new URL(baseURL).port || "3000";

const chromiumExecutablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const chromeInstallRoots = [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"]].filter(
  (root): root is string => Boolean(root),
);
const chromeAvailable = chromeInstallRoots.some((root) =>
  existsSync(path.join(root, "Google", "Chrome", "Application", "chrome.exe")),
);
const chromiumProject = chromiumExecutablePath
  ? {
      name: "chromium",
      use: { browserName: "chromium" as const, launchOptions: { executablePath: chromiumExecutablePath } },
    }
  : {
      name: chromeAvailable ? "chrome" : "chromium",
      use: {
        browserName: "chromium" as const,
        ...(chromeAvailable ? { channel: "chrome" as const } : {}),
      },
    };

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL,
  },
  projects: [
    chromiumProject,
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 -p ${serverPort}`,
    url: baseURL,
    reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVER === "1",
    timeout: 30_000,
  },
});

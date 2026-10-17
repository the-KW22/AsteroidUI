import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./verification",
  testMatch: "installed.spec.ts",
  fullyParallel: true,
  use: {
    browserName: "chromium",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH },
  },
  projects: [
    { name: "next", use: { baseURL: "http://127.0.0.1:3100" } },
    { name: "vite", use: { baseURL: "http://127.0.0.1:3200" } },
  ],
  webServer: [
    {
      command: "npm --prefix verification/next run start",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: "npm --prefix verification/vite run preview -- --host 127.0.0.1",
      url: "http://127.0.0.1:3200",
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    ".npm-cache/**",
    ".playwright-browsers/**",
    ".taste-skill/**",
    "docs/design/p7/s1/identity/*.cjs",
    "out/**",
    "build/**",
    "dist/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
    "verification/**"
  ])
]);

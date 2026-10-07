import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  testMatch: "*.spec.ts",
  fullyParallel: false,
  testIgnore:
    process.env.BLOG_E2E_NOINDEX === "1"
      ? /(?:blog|seo|theme)\.spec\.ts/
      : /preview\.spec\.ts/,
  workers: 1,
  timeout: 60000,
  use: {
    reducedMotion: "reduce",
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npx tsx tests/e2e/backend.mts",
      url: "http://127.0.0.1:54329/health",
      reuseExistingServer: false,
      timeout: 60000,
    },
    {
      command:
        process.env.BLOG_E2E_PRODUCTION === "1"
          ? "npm run build && npm run start -- --hostname 127.0.0.1 --port 3100"
          : "npm run dev -- --webpack --hostname 127.0.0.1 --port 3100",
      url: "http://127.0.0.1:3100/blog",
      reuseExistingServer: false,
      timeout: 240000,
      env: {
        BLOG_TEST_BUILD_DIR: ".next/e2e",
        VERCEL_ENV: "production",
        SITE_NOINDEX: process.env.BLOG_E2E_NOINDEX === "1" ? "true" : "false",
        NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54329",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-public-key",
        SUPABASE_SECRET_KEY: "test-secret",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
      },
    },
  ],
});

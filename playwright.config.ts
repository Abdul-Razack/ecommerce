import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright Test Configuration
 * Covers: storefront smoke, cart/checkout flows, admin auth, API contracts.
 * Runs against the local dev server (http://localhost:3000).
 */
export default defineConfig({
  testDir: './tests',
  /* Fail fast on CI; keep going locally */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    /* Collect trace on CI only to prevent filesystem artifact collisions with parallel workers */
    trace: process.env.CI ? 'on-first-retry' : 'off',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* Use stable selectors – prefer ARIA roles / data-testid */
    testIdAttribute: 'data-testid',
    /* Generous timeout for SSR pages that hit Sanity */
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  timeout: 60_000,
  expect: { timeout: 10_000 },

  projects: [
    /** ── Store tests: Desktop Chrome ───────────────────────── */
    {
      name: 'chromium-store',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'tests/store/**/*.spec.ts',
    },
    /** ── Store tests: Mobile Safari ───────────────────────── */
    {
      name: 'mobile-store',
      use: { ...devices['iPhone 13'] },
      testMatch: 'tests/store/**/*.spec.ts',
    },
    /** ── Admin tests: Desktop Chrome only ──────────────────── */
    {
      name: 'chromium-admin',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'tests/admin/**/*.spec.ts',
    },
    /** ── API contract tests (no browser needed) ────────────── */
    {
      name: 'api',
      testMatch: 'tests/api/**/*.spec.ts',
    },
  ],

  /* Start the Next.js dev server automatically during test runs */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

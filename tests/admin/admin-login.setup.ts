/**
 * tests/admin/admin-login.setup.ts
 * AUTH SETUP – Logs into the admin panel and saves session state.
 *
 * Run this once to generate tests/.auth/admin.json, then other admin
 * tests can reuse the saved session state.
 *
 * Usage:
 *   npx playwright test tests/admin/admin-login.setup.ts --project=chromium-admin
 */
import { test as setup, expect } from '@playwright/test';
import { AdminLoginPage, AdminDashboardPage } from '../page-objects/AdminPage';
import { ADMIN_AUTH_FILE, ADMIN_CREDENTIALS } from '../fixtures/admin.fixture';
import path from 'path';
import fs from 'fs';

setup('admin auth setup – save session', async ({ page }) => {
  // Ensure the .auth directory exists
  const authDir = path.dirname(ADMIN_AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const loginPage = new AdminLoginPage(page);
  await loginPage.goto();

  if (!ADMIN_CREDENTIALS.password) {
    console.warn(
      '⚠️  TEST_ADMIN_PASSWORD is not set.\n' +
      '   Set it in your .env.test or as an environment variable.\n' +
      '   Skipping admin session save.'
    );
    // Save empty state so dependent tests skip gracefully
    await page.context().storageState({ path: ADMIN_AUTH_FILE });
    return;
  }

  await loginPage.login(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password);

  const dashboard = new AdminDashboardPage(page);
  await expect(dashboard.sidebar).toBeVisible({ timeout: 15_000 });

  // Save signed-in state
  await page.context().storageState({ path: ADMIN_AUTH_FILE });
  console.log('✅ Admin session saved to', ADMIN_AUTH_FILE);
});

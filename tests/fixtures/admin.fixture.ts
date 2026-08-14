/**
 * tests/fixtures/admin.fixture.ts
 * Stores and restores a Next-Auth session cookie so admin tests
 * can skip the login UI without touching production state.
 *
 * HOW TO GENERATE THE SESSION FILE:
 *   1. Run: npx playwright test tests/admin/admin-login.setup.ts --project=chromium-admin
 *   2. The session is saved to tests/.auth/admin.json
 *   3. All other admin tests load that file via storageState.
 */

import path from 'path';

export const ADMIN_AUTH_FILE = path.join(__dirname, '../.auth/admin.json');

/** Default admin credentials – override via env if needed. */
export const ADMIN_CREDENTIALS = {
  email: process.env.TEST_ADMIN_EMAIL || 'admin@poshpigeon.com',
  password: process.env.TEST_ADMIN_PASSWORD || '',
};

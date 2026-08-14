/**
 * tests/admin/admin-auth.spec.ts
 * MODULE 5 – Admin Authentication Tests
 *
 * Tests admin login page, invalid credentials rejection, and
 * route protection (unauthenticated access redirects to /admin/login).
 */
import { test, expect } from '@playwright/test';
import { AdminLoginPage, AdminDashboardPage } from '../page-objects/AdminPage';

test.describe('Admin – Authentication & Route Protection', () => {
  test('01 – /admin/login renders the login form', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitBtn).toBeVisible();
  });

  test('02 – Invalid credentials shows error feedback', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();

    await loginPage.login('wrong@email.com', 'wrongpassword');

    // Should stay on login page – not redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 10_000 });
  });

  test('03 – Unauthenticated access to /admin redirects to /admin/login', async ({ page }) => {
    // Navigate directly without session
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  });

  test('04 – Unauthenticated access to /admin/products redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  });

  test('05 – Unauthenticated access to /admin/orders redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/orders');
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15_000 });
  });

  test('06 – Empty email/password shows form validation', async ({ page }) => {
    const loginPage = new AdminLoginPage(page);
    await loginPage.goto();

    // Click submit without filling
    await loginPage.submitBtn.click();
    // HTML5 required validation or toast should trigger
    // Remain on login page
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

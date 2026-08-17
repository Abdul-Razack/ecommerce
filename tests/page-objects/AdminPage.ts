/**
 * tests/page-objects/AdminPage.ts
 * Page Object for the admin dashboard section.
 */
import { Page, Locator, expect } from '@playwright/test';

export class AdminLoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitBtn: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput  = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitBtn   = page.getByRole('button', { name: /sign in|login/i });
    this.errorMessage = page.getByRole('alert').or(page.locator('.text-red-500, .text-red-600'));
  }

  async goto() {
    await this.page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await expect(this.emailInput).toBeVisible({ timeout: 10_000 });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  }
}

export class AdminDashboardPage {
  readonly page: Page;
  readonly sidebar: Locator;
  readonly dashboardHeading: Locator;
  readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar          = page.locator('aside');
    this.dashboardHeading = page.getByRole('heading', { name: /dashboard|posh pigeon/i }).first();
    this.logoutBtn        = page.getByRole('button', { name: /logout/i });
  }

  sidebarLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(name, 'i') });
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await expect(this.sidebar).toBeVisible({ timeout: 10_000 });
      return true;
    } catch {
      return false;
    }
  }
}

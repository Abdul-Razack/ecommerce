/**
 * tests/store/search-filter.spec.ts
 * MODULE 4 – Search & Category Filter Tests
 */
import { test, expect } from '@playwright/test';
import { StorePage } from '../page-objects/StorePage';

test.describe('Search & Category Filtering', () => {
  test('01 – Searching via navbar input navigates to /shop?search=', async ({ page }) => {
    const store = new StorePage(page);
    await store.goto();

    await expect(store.searchInput).toBeVisible({ timeout: 10_000 });
    await store.search('leggings');

    await expect(page).toHaveURL(/\/shop\?search=leggings/);
  });

  test('02 – Category filter via URL param "leggings" shows correct page', async ({ page }) => {
    await page.goto('/shop?category=leggings');
    await expect(page.getByRole('heading', { name: /^shop$/i })).toBeVisible({ timeout: 10_000 });
    // URL param should be intact
    await expect(page).toHaveURL(/category=leggings/);
  });

  test('03 – Category filter via URL param "nighty" shows correct page', async ({ page }) => {
    await page.goto('/shop?category=nighty');
    await expect(page.getByRole('heading', { name: /^shop$/i })).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/category=nighty/);
  });

  test('04 – Category filter via URL param "sarees" shows correct page', async ({ page }) => {
    await page.goto('/shop?category=sarees');
    await expect(page.getByRole('heading', { name: /^shop$/i })).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/category=sarees/);
  });

  test('05 – Category filter via URL param "inskirt" shows correct page', async ({ page }) => {
    await page.goto('/shop?category=inskirt');
    await expect(page.getByRole('heading', { name: /^shop$/i })).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/category=inskirt/);
  });

  test('06 – Non-matching search shows empty state', async ({ page }) => {
    await page.goto('/shop?search=xyznonexistentproduct12345');
    await expect(page.getByRole('heading', { name: /^shop$/i })).toBeVisible({ timeout: 10_000 });

    const emptyState = page.getByRole('heading', { name: /no products yet/i });
    const productCards = page.getByRole('button', { name: /add to cart/i });

    // Either empty state or zero product cards
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const count = await productCards.count();
    expect(hasEmpty || count === 0).toBeTruthy();
  });

  test('07 – Homepage category pill links navigate to filtered shop', async ({ page }) => {
    await page.goto('/');
    // Wait for collections section
    await page.locator('#collections').waitFor({ timeout: 10_000 });

    const leggingsLink = page.getByRole('link', { name: /click now/i }).first();
    await expect(leggingsLink).toBeVisible({ timeout: 5_000 });
    await leggingsLink.click();

    await expect(page).toHaveURL(/\/shop\?category=leggings/);
  });
});

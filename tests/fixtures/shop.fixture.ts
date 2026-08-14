/**
 * tests/fixtures/shop.fixture.ts
 * Shared helpers for shop / product-listing tests.
 *
 * Provides:
 *  • resolveFirstProductSlug() – discovers a real live slug from /shop at runtime
 *  • interceptSlowSanity()     – throttles the Sanity CDN to simulate slow data fetch
 */
import { Page, APIRequestContext } from '@playwright/test';

/**
 * Navigates to /shop in a headless fetch, scrapes the first product card href,
 * and returns just the slug portion (the last path segment).
 *
 * This avoids hard-coding a slug that may not exist in the live Sanity dataset.
 */
export async function resolveFirstProductSlug(page: Page): Promise<string | null> {
  await page.goto('/shop', { waitUntil: 'domcontentloaded' });
  // Give client-side React time to hydrate and render product cards
  await page.waitForTimeout(1_000);
  // Look for any link that goes to /shop/<slug>
  const links = page.locator('a[href^="/shop/"]');
  const count = await links.count();
  if (count === 0) return null;
  const href = await links.first().getAttribute('href');
  if (!href) return null;
  // href is like /shop/premium-churidar-leggings
  const parts = href.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? null;
}

/**
 * Returns the category names visible in the Categories dropdown.
 * Opens the dropdown, reads options, closes it.
 */
export async function getAvailableCategories(page: Page): Promise<string[]> {
  const trigger = page.locator('button').filter({ hasText: /Categories/i }).first();
  await trigger.click();
  // Options appear in a floating div
  const optionButtons = page.locator('div[class*="absolute"] button');
  await page.waitForTimeout(300);
  const count = await optionButtons.count();
  const cats: string[] = [];
  for (let i = 0; i < count; i++) {
    const text = (await optionButtons.nth(i).innerText()).trim();
    cats.push(text);
  }
  // Close the dropdown by clicking the trigger again
  await trigger.click();
  return cats.filter(c => c.toLowerCase() !== 'all');
}

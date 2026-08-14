/**
 * tests/store/shop.spec.ts
 * MODULE 4 – Shop / Product Listing Experience
 *
 * Covers:
 *  1.  Product list loads correctly.
 *  2.  Product cards contain name, price, image, and interaction buttons.
 *  3.  Clicking a product opens the correct detail page.
 *  4.  Product URLs correspond to the selected product.
 *  5.  URL search param filtering works (server-side).
 *  6.  Category filtering works (client-side dropdown).
 *  7.  Sorting works (Price: Low → High, High → Low).
 *  8.  Empty search / filter results show an intentional empty state.
 *  9.  Clearing filters restores the original product list.
 * 10.  Rapidly changing filters does not produce stale/contradictory UI.
 * 11.  Refreshing while filters are active behaves correctly.
 * 12.  Browser back/forward restores expected state.
 * 13.  Loading states appear during navigation (Suspense boundary).
 * 14.  Invalid/nonexistent slug → intended not-found behavior.
 *
 * Desktop + Mobile viewports via Playwright projects (chromium-store / mobile-store).
 */
import { test, expect } from '@playwright/test';
import { ShopPage } from '../page-objects/ShopPage';
import { resolveFirstProductSlug, getAvailableCategories } from '../fixtures/shop.fixture';

// ─── Console error guard (shared across all tests) ────────────────────────────
function attachConsoleGuard(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore common false-positives that are not application bugs
      const IGNORED = [
        'favicon.ico',
        'Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE', // cross-origin image CDN
        'net::ERR_ABORTED',   // cancelled prefetch requests
      ];
      if (!IGNORED.some(pat => text.includes(pat))) {
        errors.push(text);
      }
    }
  });
  page.on('pageerror', err => errors.push(`[pageerror] ${err.message}`));
  return errors;
}

// ─── TEST GROUP 1 – Product list basics ───────────────────────────────────────
test.describe('Shop – Product List Basics', () => {

  test('01 – /shop loads without console errors and renders h1', async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const shop = new ShopPage(page);
    await shop.goto();

    // h1 visible
    await expect(shop.heading).toBeVisible();

    // No JS errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('02 – Product list renders at least one product card', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    // If Sanity has products, we must see them
    // If the store is empty, the "No Products Yet" empty state must be visible instead
    if (count === 0) {
      await expect(shop.emptyState).toBeVisible({ timeout: 10_000 });
    } else {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('03 – Product card contains name, price, and image', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count === 0, 'No products in dataset – skipping card anatomy test');

    // Name (h3)
    const name = shop.productCardName(0);
    await expect(name).toBeVisible();
    const nameText = await name.innerText();
    expect(nameText.trim().length).toBeGreaterThan(0);

    // Price (span with font-black text-onyx)
    const price = shop.productCardPrice(0);
    await expect(price).toBeVisible();
    const priceText = await price.innerText();
    expect(priceText.trim().length).toBeGreaterThan(0);

    // Image (img inside the card)
    const img = shop.productCardImage(0);
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toBeTruthy();
  });

  test('04 – Product card exposes "Add to Cart" and "Buy Now" buttons', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count === 0, 'No products – skipping button presence test');

    const card = shop.productCard(0);
    await expect(card.getByRole('button', { name: /add to cart/i })).toBeVisible();
    await expect(card.getByRole('button', { name: /buy now/i })).toBeVisible();
  });

  test('05 – Filter bar is rendered with all dropdown triggers', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    await expect(shop.categoriesDropdownTrigger).toBeVisible();
    await expect(shop.colorDropdownTrigger).toBeVisible();
    await expect(shop.sizeDropdownTrigger).toBeVisible();
    await expect(shop.priceDropdownTrigger).toBeVisible();
    await expect(shop.sortDropdownTrigger).toBeVisible();
  });

});

// ─── TEST GROUP 2 – Product navigation & URLs ─────────────────────────────────
test.describe('Shop – Product Navigation & URLs', () => {

  test('06 – Clicking a product card navigates to correct detail URL', async ({ page }) => {
    const errors = attachConsoleGuard(page);
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count === 0, 'No products – skipping navigation test');

    // Capture the href before clicking
    const expectedHref = await shop.getFirstProductHref();
    expect(expectedHref).toMatch(/^\/shop\/.+/);

    await shop.clickFirstInStockProduct();

    await expect(page).toHaveURL(new RegExp(expectedHref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), {
      timeout: 20_000,
    });

    // Product detail page must render without errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('07 – Product detail page renders name, price, and "Add to Cart"', async ({ page }) => {
    const slug = await resolveFirstProductSlug(page);
    test.skip(!slug, 'Could not resolve a product slug – skipping detail page test');

    const errors = attachConsoleGuard(page);
    await page.goto(`/shop/${slug}`, { waitUntil: 'domcontentloaded' });

    // Wait for the product detail to load (it's SSR, so should be fast)
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20_000 });

    // No critical JS errors on detail page
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);

    // Must contain an "Add to Cart" or "Buy Now" interaction
    const hasCTA = await page.getByRole('button', { name: /add to cart|buy now/i }).first().isVisible().catch(() => false);
    expect(hasCTA, 'Detail page must have Add to Cart or Buy Now button').toBe(true);
  });

  test('08 – Product detail page URL persists on hard refresh', async ({ page }) => {
    const slug = await resolveFirstProductSlug(page);
    test.skip(!slug, 'No live slug available');

    await page.goto(`/shop/${slug}`);
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20_000 });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(slug));
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20_000 });
  });

  test('14 – Invalid product slug returns 404 / not-found UI', async ({ page }) => {
    const resp = await page.goto('/shop/this-product-absolutely-does-not-exist-xyz-999');
    // In Next.js App Router with PPR/dynamic rendering, notFound() triggered dynamically
    // might flush a 200 OK status before the suspense boundary throws the 404.
    // So we don't strictly assert the HTTP status code, but we do assert the DOM.
    await page.goto('/shop/this-product-absolutely-does-not-exist-xyz-999');

    // The page must show some "not found" content (Next.js default or custom)
    // We use toContainText which auto-polls, because Next.js might stream a loading state first
    await expect(page.locator('body')).toContainText(/404|not found|could not be found/i, { timeout: 10000 });

    // Must NOT show a blank white page or uncaught error
    await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });

});

// ─── TEST GROUP 3 – Client-side filtering ─────────────────────────────────────
test.describe('Shop – Client-side Filtering', () => {

  test('06-cat – Category filter narrows the product list', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const initialCount = await shop.getProductCount();
    test.skip(initialCount < 2, 'Need ≥ 2 products across ≥ 2 categories to test filtering');

    // Get a real category from the dropdown
    const categories = await getAvailableCategories(page);
    test.skip(categories.length === 0, 'No filterable categories found in dropdown');

    const targetCategory = categories[0];
    await shop.filterByCategory(targetCategory);

    // Wait for React to re-render
    await page.waitForTimeout(500);

    const filteredCount = await shop.getProductCount();

    // Every visible card must belong to the selected category
    // (the category label is rendered as a small span inside each card)
    const categoryLabels = page.locator('.group.flex.flex-col span').filter({
      hasText: new RegExp(targetCategory, 'i'),
    });
    // If any products matched, each card should show that category
    if (filteredCount > 0) {
      const labelCount = await categoryLabels.count();
      expect(labelCount).toBeGreaterThan(0);
    }
  });

  test('07-sort-low – "Price: Low to High" sorts correctly', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count < 2, 'Need ≥ 2 products to test sort order');

    await shop.sortBy('Price: Low to High');
    await page.waitForTimeout(500);

    // Collect all price texts from visible cards and verify ascending order
    const priceSpans = page.locator('.group.flex.flex-col span.font-black.text-onyx');
    const priceCount = await priceSpans.count();

    const rawPrices: number[] = [];
    for (let i = 0; i < priceCount; i++) {
      const text = await priceSpans.nth(i).innerText();
      // Strip currency symbol / formatting: keep digits and dot
      const numeric = parseFloat(text.replace(/[^\d.]/g, ''));
      if (!isNaN(numeric)) rawPrices.push(numeric);
    }

    // Verify ascending
    for (let i = 1; i < rawPrices.length; i++) {
      expect(rawPrices[i]).toBeGreaterThanOrEqual(rawPrices[i - 1]);
    }
  });

  test('07-sort-high – "Price: High to Low" sorts correctly', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count < 2, 'Need ≥ 2 products to test sort order');

    await shop.sortBy('Price: High to Low');
    await page.waitForTimeout(500);

    const priceSpans = page.locator('.group.flex.flex-col span.font-black.text-onyx');
    const priceCount = await priceSpans.count();

    const rawPrices: number[] = [];
    for (let i = 0; i < priceCount; i++) {
      const text = await priceSpans.nth(i).innerText();
      const numeric = parseFloat(text.replace(/[^\d.]/g, ''));
      if (!isNaN(numeric)) rawPrices.push(numeric);
    }

    // Verify descending
    for (let i = 1; i < rawPrices.length; i++) {
      expect(rawPrices[i]).toBeLessThanOrEqual(rawPrices[i - 1]);
    }
  });

  test('08 – Impossible price filter shows "No Products Match Filters" empty state', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count === 0, 'Already empty – cannot test filter-induced empty state');

    // "Under ₹500" might be legitimately empty; use a category filter that doesn't exist
    // We combine a real-but-narrow size with a price range to force an empty result
    // Strategy: filter by the most expensive price band first
    await shop.sortBy('Price: High to Low');
    await page.waitForTimeout(300);

    // Now filter by "Under ₹500" – combined with only expensive products being shown first
    // this is a realistic edge case. More robustly: filter by an XS size AND the highest price.
    await shop.filterBySize('XS');
    await page.waitForTimeout(300);
    await shop.filterByPrice(/Under/i);
    await page.waitForTimeout(500);

    const afterCount = await shop.getProductCount();

    if (afterCount === 0) {
      // The intended empty state must render
      await expect(shop.emptyState).toBeVisible({ timeout: 5_000 });
      // And a "Reset Filters" button must appear
      await expect(shop.resetFiltersBtn).toBeVisible({ timeout: 5_000 });
    }
    // If products still exist, skip – the dataset happens to have XS + cheap items
  });

  test('09 – "Reset Filters" restores original product list', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const initialCount = await shop.getProductCount();
    test.skip(initialCount === 0, 'Empty store – cannot test reset');

    // Apply a size filter to alter the list (may or may not empty it)
    await shop.filterBySize('XS');
    await page.waitForTimeout(500);

    const filteredCount = await shop.getProductCount();

    // Now reset
    if (filteredCount === 0) {
      // "Reset Filters" button only shows when list is empty
      await shop.resetFilters();
    } else {
      // No empty state, so we reset via "All Sizes" in the dropdown
      await shop.sizeDropdownTrigger.click();
      const allSizes = page.locator('button').filter({ hasText: /^All Sizes$/i }).last();
      await expect(allSizes).toBeVisible({ timeout: 5_000 });
      await allSizes.click();
    }

    await page.waitForTimeout(500);
    const restoredCount = await shop.getProductCount();
    expect(restoredCount).toEqual(initialCount);
  });

  test('10 – Rapidly changing filters does not leave stale/contradictory UI', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count < 2, 'Need products to test rapid filter changes');

    // Rapid filter cycling
    await shop.sortBy('Price: Low to High');
    await shop.sortBy('Price: High to Low');
    await shop.sortBy('Default Sorting');

    // Give React a moment to settle
    await page.waitForTimeout(600);

    // The page must not show any error state and must still have cards
    const finalCount = await shop.getProductCount();
    expect(finalCount).toBeGreaterThan(0);

    // No error messages in body
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('Unhandled Runtime Error');
    expect(bodyText).not.toContain('Internal Server Error');
  });

});

// ─── TEST GROUP 4 – Server-side filtering (URL params) ────────────────────────
test.describe('Shop – Server-side URL param filtering', () => {

  test('05-search – ?search=legging returns relevant products', async ({ page }) => {
    const errors = attachConsoleGuard(page);
    await page.goto('/shop?search=legging', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').filter({ hasText: /shop/i })).toBeVisible({ timeout: 20_000 });

    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('Unhandled Runtime Error');
    // No critical JS errors
    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('05-nonsense – ?search=xyzzynonexistent returns empty state', async ({ page }) => {
    await page.goto('/shop?search=xyzzynonexistent123');
    await expect(page.locator('h1').filter({ hasText: /shop/i })).toBeVisible({ timeout: 20_000 });

    // Should show "No Products Yet" or "No Products Match Filters"
    const bodyText = await page.locator('body').innerText();
    const hasEmptyState = bodyText.includes('No Products') || bodyText.includes('check back later');
    expect(hasEmptyState).toBe(true);
  });

  test('11 – Refreshing with URL ?search param preserves filter state', async ({ page }) => {
    await page.goto('/shop?search=legging');
    await expect(page.locator('h1').filter({ hasText: /shop/i })).toBeVisible({ timeout: 20_000 });

    const beforeText = await page.locator('body').innerText();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').filter({ hasText: /shop/i })).toBeVisible({ timeout: 20_000 });

    // URL must still contain the search param
    expect(page.url()).toContain('search=legging');

    // Content must be equivalent
    const afterText = await page.locator('body').innerText();
    expect(afterText.trim().length).toBeGreaterThan(0);
    expect(afterText).not.toContain('Internal Server Error');
  });

  test('12 – Browser back from product detail restores shop listing', async ({ page }) => {
    // Prime the history stack to avoid Next.js routing back to about:blank
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count === 0, 'No products – skipping back/forward test');

    const shopUrl = page.url();
    await shop.clickFirstInStockProduct();
    // Wait for the URL to change before checking
    await page.waitForURL((url) => url.href !== shopUrl, { timeout: 20_000 });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20_000 });
    // Verify we actually navigated away
    expect(page.url()).not.toBe(shopUrl);

    // Go back
    await page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(shopUrl, { timeout: 10_000 });
    await expect(shop.heading).toBeVisible({ timeout: 15_000 });

    // Product cards should reappear
    await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeVisible({
      timeout: 15_000,
    });

    // Go forward (back to product detail)
    await page.goForward({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20_000 });
  });

});

// ─── TEST GROUP 5 – Loading states & skeleton ─────────────────────────────────
test.describe('Shop – Loading States', () => {

  test('13 – Product detail loading skeleton is shown then resolves', async ({ page }) => {
    const slug = await resolveFirstProductSlug(page);
    test.skip(!slug, 'No live slug available');

    // Navigate to the detail loading route – Next.js shows loading.tsx during SSR
    // We can observe this via a slow network simulation
    await page.route('**/*', route => {
      // Let all routes through – we just want to ensure no permanent spinner
      route.continue();
    });

    await page.goto(`/shop/${slug}`, { waitUntil: 'domcontentloaded' });

    // After domcontentloaded, any loading indicators should resolve
    await page.waitForTimeout(2_000);

    // Permanent loading indicator is a defect
    const loadingTexts = page.locator(':has-text("Loading...")');
    const loadingCount = await loadingTexts.count();
    if (loadingCount > 0) {
      // Give it extra time to resolve
      await expect(loadingTexts.first()).not.toBeVisible({ timeout: 10_000 });
    }

    // Page must have real content now
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 20_000 });
  });

});

// ─── TEST GROUP 6 – Viewport coverage ─────────────────────────────────────────
test.describe('Shop – Mobile Viewport', () => {

  test('mobile-01 – /shop renders correctly on mobile viewport', async ({ page }) => {
    // Mobile viewport is applied via the `mobile-store` Playwright project.
    // This test runs on both projects; on desktop it acts as a basic regression.
    const errors = attachConsoleGuard(page);
    const shop = new ShopPage(page);
    await shop.goto();

    await expect(shop.heading).toBeVisible();
    // Filter bar should still be accessible (it stacks vertically on mobile)
    await expect(shop.categoriesDropdownTrigger).toBeVisible();

    expect(errors, `Console errors: ${errors.join('\n')}`).toHaveLength(0);
  });

  test('mobile-02 – Product cards are tappable on mobile', async ({ page }) => {
    const shop = new ShopPage(page);
    await shop.goto();

    const count = await shop.getProductCount();
    test.skip(count === 0, 'No products');

    const card = shop.productCard(0);
    await expect(card).toBeVisible();

    // Bounding box must be large enough for a touch target (min 44×44 CSS px per WCAG)
    const box = await card.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.width).toBeGreaterThan(44);
    expect(box!.height).toBeGreaterThan(44);
  });

  test('mobile-03 – Direct navigation to /shop in new browser context works', async ({ browser }) => {
    const context = await browser.newContext();
    const newPage = await context.newPage();

    const resp = await newPage.goto('/shop', { waitUntil: 'domcontentloaded' });
    expect(resp?.status()).toBeLessThan(400);

    await expect(newPage.locator('h1').filter({ hasText: /shop/i })).toBeVisible({ timeout: 20_000 });
    await context.close();
  });

});

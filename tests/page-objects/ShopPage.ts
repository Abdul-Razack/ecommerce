/**
 * tests/page-objects/ShopPage.ts
 * Page Object for /shop – product listing, filters, sort, pagination, and product detail.
 *
 * Architecture notes:
 *  • All filters are pure client-side React state (ProductCardWrapper).
 *  • Category filter on URL (?category=) is a server-side GROQ filter.
 *  • The "Reset Filters" button only appears when filtered results return 0 products.
 */
import { Page, Locator, expect } from '@playwright/test';

export class ShopPage {
  readonly page: Page;

  // ── Page structure ─────────────────────────────────────────────────────────
  readonly heading: Locator;
  readonly productGrid: Locator;

  // ── Filter bar (client-side, inside ProductCardWrapper) ───────────────────
  readonly filterBar: Locator;
  readonly categoriesDropdownTrigger: Locator;
  readonly colorDropdownTrigger: Locator;
  readonly sizeDropdownTrigger: Locator;
  readonly priceDropdownTrigger: Locator;
  readonly sortDropdownTrigger: Locator;
  readonly resetFiltersBtn: Locator;

  // ── Pagination ─────────────────────────────────────────────────────────────
  readonly prevPageBtn: Locator;
  readonly nextPageBtn: Locator;

  // ── Empty state ────────────────────────────────────────────────────────────
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;

    this.heading             = page.locator('h1').filter({ hasText: /shop/i });
    this.productGrid         = page.locator('[class*="grid-cols-"]').first();
    this.filterBar           = page.locator('text=Filter by').first();

    // Filter dropdown triggers (all inside the filter/control bar)
    this.categoriesDropdownTrigger = page.locator('button').filter({ hasText: /Categories/i }).first();
    this.colorDropdownTrigger      = page.locator('button').filter({ hasText: /Color/i }).first();
    this.sizeDropdownTrigger       = page.locator('button').filter({ hasText: /Size/i }).first();
    this.priceDropdownTrigger      = page.locator('button').filter({ hasText: /Price/i }).first();
    this.sortDropdownTrigger       = page.locator('button').filter({ hasText: /Sorting|Price:/i }).first();

    this.resetFiltersBtn     = page.getByRole('button', { name: /reset filters/i });

    this.prevPageBtn         = page.locator('button').filter({ hasText: '←' });
    this.nextPageBtn         = page.locator('button').filter({ hasText: '→' });

    this.emptyState          = page.locator('text=No Products Match Filters').or(
                               page.locator('text=No Products Yet'));
  }

  // ── Navigation helpers ─────────────────────────────────────────────────────

  async goto(options: { category?: string; search?: string } = {}) {
    const params = new URLSearchParams();
    if (options.category) params.set('category', options.category);
    if (options.search)   params.set('search',   options.search);
    const qs = params.toString();
    await this.page.goto(qs ? `/shop?${qs}` : '/shop', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  async isLoaded(): Promise<boolean> {
    try {
      await expect(this.heading).toBeVisible({ timeout: 15_000 });
      return true;
    } catch {
      return false;
    }
  }

  // ── Product card helpers ───────────────────────────────────────────────────

  /** Returns all visible product cards (identified by the "Add to Cart" button). */
  productCards(): Locator {
    return this.page.getByRole('button', { name: /add to cart/i });
  }

  async getProductCount(): Promise<number> {
    return this.productCards().count();
  }

  /** Returns the nth product card container (the outer rounded card div). */
  productCard(index = 0): Locator {
    return this.page.locator('.group.flex.flex-col').nth(index);
  }

  productCardName(index = 0): Locator {
    return this.productCard(index).locator('h3');
  }

  productCardPrice(index = 0): Locator {
    return this.productCard(index).locator('span.font-black.text-onyx').first();
  }

  productCardImage(index = 0): Locator {
    return this.productCard(index).locator('img');
  }

  productCardLink(index = 0): Locator {
    return this.productCard(index).locator('a[href^="/shop/"]').first();
  }

  // ── Filter helpers ─────────────────────────────────────────────────────────

  /** Opens the categories dropdown and clicks a specific category name. */
  async filterByCategory(categoryName: string) {
    await this.categoriesDropdownTrigger.click();
    const option = this.page.locator(`button`).filter({ hasText: new RegExp(`^${categoryName}$`, 'i') }).last();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();
  }

  /** Opens the size dropdown and picks a size. */
  async filterBySize(size: string) {
    await this.sizeDropdownTrigger.click();
    const option = this.page.locator('button').filter({ hasText: new RegExp(`^${size}$`, 'i') }).last();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();
  }

  /** Opens the price dropdown and picks by label text. */
  async filterByPrice(labelPattern: RegExp) {
    await this.priceDropdownTrigger.click();
    const option = this.page.locator('button').filter({ hasText: labelPattern }).last();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();
  }

  /** Opens the sort dropdown and picks by label. */
  async sortBy(label: 'Default Sorting' | 'Price: Low to High' | 'Price: High to Low') {
    await this.sortDropdownTrigger.click();
    const option = this.page.locator('button').filter({ hasText: label }).last();
    await expect(option).toBeVisible({ timeout: 5_000 });
    await option.click();
  }

  /** Resets all filters to default. */
  async resetFilters() {
    await expect(this.resetFiltersBtn).toBeVisible({ timeout: 5_000 });
    await this.resetFiltersBtn.click();
  }

  // ── Product detail navigation ──────────────────────────────────────────────

  /** Returns the href of the first product card link (to extract slug). */
  async getFirstProductHref(): Promise<string> {
    const link = this.productCardLink(0);
    await expect(link).toBeVisible({ timeout: 10_000 });
    return link.getAttribute('href');
  }

  /** Clicks the first product card's name/image link to navigate to its detail page. */
  async clickFirstProduct() {
    const link = this.productCardLink(0);
    await expect(link).toBeVisible({ timeout: 10_000 });
    await link.click();
  }

  /** Clicks the first product card that does not have an OUT OF STOCK label. */
  async clickFirstInStockProduct() {
    await this.page.waitForTimeout(1000); // Wait for potential client-side stock hydration
    const cards = this.page.locator('.group.flex.flex-col');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
       const card = cards.nth(i);
       // The storefront might render an OUT OF STOCK badge or disable the add to cart button
       const outOfStock = await card.getByText(/OUT OF STOCK/i).isVisible();
       const btn = card.getByRole('button', { name: /add to cart/i });
       const isDisabled = await btn.isDisabled().catch(() => false);
       if (!outOfStock && !isDisabled) {
          await card.locator('a[href^="/shop/"]').first().click();
          return;
       }
    }
    // Fallback to first product if none found
    await this.clickFirstProduct();
  }

  /** Clicks the second product card that does not have an OUT OF STOCK label. */
  async clickSecondInStockProduct() {
    await this.page.waitForTimeout(1000); // Wait for potential client-side stock hydration
    const cards = this.page.locator('.group.flex.flex-col');
    const count = await cards.count();
    let found = 0;
    for (let i = 0; i < count; i++) {
       const card = cards.nth(i);
       const outOfStock = await card.getByText(/OUT OF STOCK/i).isVisible();
       const btn = card.getByRole('button', { name: /add to cart/i });
       const isDisabled = await btn.isDisabled().catch(() => false);
       if (!outOfStock && !isDisabled) {
          found++;
          if (found === 2) {
             await card.locator('a[href^="/shop/"]').first().click();
             return;
          }
       }
    }
    // Fallback to first product if none found
    await this.clickFirstProduct();
  }

  /** Clicks "Add to Cart" on the nth card. */
  async addToCart(index = 0) {
    const cards = this.productCards();
    await cards.nth(index).click();
  }
}

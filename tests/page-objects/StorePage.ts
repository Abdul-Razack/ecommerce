/**
 * tests/page-objects/StorePage.ts
 * Page Object for the public store: Navbar, Hero, ProductCard, Cart interaction.
 */
import { Page, Locator, expect } from '@playwright/test';

export class StorePage {
  readonly page: Page;

  // ── Navigation ─────────────────────────────────────────────
  readonly navbar: Locator;
  readonly cartButton: Locator;
  readonly cartBadge: Locator;
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly loginIcon: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navbar      = page.locator('header');
    // Cart bag icon button in navbar
    this.cartButton  = page.locator('header button[title="Shopping Cart"]');
    this.cartBadge   = page.locator('header button[title="Shopping Cart"] span');
    this.searchInput = page.locator('header input[placeholder="Search products..."]');
    this.searchSubmit = page.locator('header button[type="submit"]').first();
    this.loginIcon   = page.locator('header a[title="Login"]');
  }

  async goto() {
    await this.page.goto('/');
    // Wait for the hero heading to appear (confirms SSR render)
    await this.page.waitForSelector('h1');
  }

  async gotoShop(category?: string) {
    const url = category ? `/shop?category=${category}` : '/shop';
    await this.page.goto(url);
    await this.page.waitForSelector('h1');
  }

  async gotoCart() {
    await this.page.goto('/cart');
    // Cart is client-rendered; wait for hydration
    await this.page.waitForFunction(() => {
      return document.body.innerText.includes('Your Cart') ||
             document.body.innerText.includes('cart is empty');
    }, { timeout: 15_000 });
  }

  /** Clicks "Add to Cart" on the first ProductCard on the page. */
  async addFirstProductToCart() {
    const addBtn = this.page.getByRole('button', { name: /add to cart/i }).first();
    await expect(addBtn).toBeVisible({ timeout: 10_000 });
    await addBtn.click();
  }

  /** Clicks "Buy Now" on the first ProductCard on the page. */
  async buyNowFirstProduct() {
    const btn = this.page.getByRole('button', { name: /buy now/i }).first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
    await btn.click();
  }

  async openCartDrawer() {
    await this.cartButton.click();
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchSubmit.click();
  }

  async getCartCount(): Promise<number> {
    try {
      const text = await this.cartBadge.innerText({ timeout: 3_000 });
      return parseInt(text, 10) || 0;
    } catch {
      return 0;
    }
  }

  /** Returns the count of visible ProductCards on the current page. */
  async getProductCardCount(): Promise<number> {
    // ProductCards have "Add to Cart" button – use that as anchor
    const cards = this.page.getByRole('button', { name: /add to cart/i });
    return await cards.count();
  }
}

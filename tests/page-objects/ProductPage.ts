import { Page, Locator, expect } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly price: Locator;
  readonly originalPrice: Locator;
  readonly discountBadge: Locator;
  readonly addToCartBtn: Locator;
  readonly buyNowBtn: Locator;
  readonly wishlistBtn: Locator;
  readonly quantityDisplay: Locator;
  readonly quantityIncreaseBtn: Locator;
  readonly quantityDecreaseBtn: Locator;
  readonly stockStatus: Locator;
  readonly thumbnails: Locator;
  readonly mainImage: Locator;
  
  constructor(page: Page) {
    this.page = page;
    
    // Core identity
    this.heading = page.locator('h1');
    
    // Pricing
    const priceContainer = page.locator('div.flex.items-baseline').first();
    this.price = priceContainer.locator('p.text-3xl').first();
    this.originalPrice = priceContainer.locator('span.line-through').first();
    this.discountBadge = priceContainer.locator('span.bg-green-50\\/50').first();
    
    // CTAs - Use .first() to completely bypass strict mode violations
    // since both the main CTA and sticky footer CTA might be visible.
    this.addToCartBtn = page.getByRole('button', { name: /^ADD TO CART$/i }).first();
    this.buyNowBtn = page.getByRole('button', { name: /^BUY NOW$/i }).first();
    this.wishlistBtn = page.locator('button[title="Add to Wishlist"]');
    
    // Quantity
    this.quantityDecreaseBtn = page.getByRole('button', { name: '-' });
    this.quantityIncreaseBtn = page.getByRole('button', { name: '+' });
    this.quantityDisplay = page.locator('button:has-text("-") + span'); // Next to -
    
    // Stock
    this.stockStatus = page.locator('text=/(in stock|out of stock)/i');

    // Images
    this.mainImage = page.locator('div.aspect-\\[4\\/5\\] img').first();
    this.thumbnails = page.locator('button img[alt*="View"]');
  }

  async goto(slug: string) {
    await this.page.goto(`/shop/${slug}`, { waitUntil: 'domcontentloaded' });
  }

  async selectColor(color: string) {
    await this.page.locator(`button[title="${color}"]`).click();
  }

  async selectSize(size: string) {
    await this.page.getByRole('button', { name: new RegExp(`^${size}$`, 'i'), exact: true }).click();
  }

  async increaseQuantity(times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.quantityIncreaseBtn.click();
    }
  }

  async decreaseQuantity(times: number = 1) {
    for (let i = 0; i < times; i++) {
      await this.quantityDecreaseBtn.click();
    }
  }
}

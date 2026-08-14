/**
 * tests/page-objects/CartPage.ts
 * Page Object for /cart — covers item list, quantity controls, summary, and proceed CTA.
 */
import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly emptyMessage: Locator;
  readonly itemCount: Locator;
  readonly proceedToCheckoutBtn: Locator;
  readonly orderSummary: Locator;
  readonly subtotalValue: Locator;
  readonly deliveryValue: Locator;
  readonly totalValue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading            = page.locator('h1').filter({ hasText: /your cart/i });
    this.emptyMessage       = page.locator('h2').filter({ hasText: /your cart is empty/i });
    this.itemCount          = page.locator('span.technical').filter({ hasText: /item/i }).first();
    this.proceedToCheckoutBtn = page.getByRole('link', { name: /proceed to checkout/i });
    this.orderSummary       = page.getByRole('heading', { name: /order summary/i });
    this.subtotalValue      = page.locator('span').filter({ hasText: /^Subtotal$/i }).locator('..').locator('span.font-black');
    this.deliveryValue      = page.locator('span').filter({ hasText: /free|₹50/i }).first();
    this.totalValue         = page.locator('p.text-2xl, p.text-3xl').first();
  }

  async goto() {
    await this.page.goto('/cart');
    await expect(this.heading.or(this.emptyMessage)).toBeVisible({ timeout: 15_000 });
  }

  /** Gets the container for cart items to avoid picking up CartDrawer elements */
  itemsContainer(): Locator {
    return this.page.locator('.lg\\:col-span-7, .xl\\:col-span-8').first();
  }

  /** Gets the first remove-item (×) button. */
  removeButton(index = 0): Locator {
    return this.itemsContainer().locator('button[title="Remove Item"]').nth(index);
  }

  /** Gets the quantity decrement button for the nth cart item. */
  decrementBtn(index = 0): Locator {
    return this.itemsContainer().locator('button').filter({ hasText: '−' }).nth(index);
  }

  incrementBtn(index = 0): Locator {
    return this.itemsContainer().locator('button').filter({ hasText: '+' }).nth(index);
  }

  quantityDisplay(index = 0): Locator {
    return this.itemsContainer().locator('[data-testid="cart-item-qty"]').nth(index);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await expect(
        this.heading.or(this.emptyMessage)
      ).toBeVisible({ timeout: 15_000 });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * tests/fixtures/cart.fixture.ts
 * Utility to programmatically seed / clear the cart via localStorage.
 * Uses Playwright's page.evaluate() to bypass the React hydration step.
 */
import { Page } from '@playwright/test';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  slug: string;
  imageUrl: string;
  category: string;
  quantity: number;
}

/**
 * Injects cart items directly into localStorage *before* React mounts,
 * preventing the hydration skeleton from blocking assertions.
 */
export async function seedCart(page: Page, items: CartItem[]) {
  await page.addInitScript((cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, items);
}

/** Clears cart state from localStorage. */
export async function clearCart(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem('cart');
  });
}

/** Returns a standard single test product that maps to a real Sanity document shape. */
export function mockProduct(overrides: Partial<CartItem> = {}): CartItem {
  return {
    _id: 'test-product-001',
    name: 'Premium Test Legging',
    price: 499,
    slug: 'premium-test-legging',
    imageUrl: 'https://placehold.co/400x500?text=Test+Product',
    category: 'Leggings',
    quantity: 1,
    ...overrides,
  };
}

/** Returns a cart item that pushes total above the free-shipping threshold (₹999). */
export function highValueProduct(overrides: Partial<CartItem> = {}): CartItem {
  return mockProduct({ price: 1200, name: 'High-Value Saree', ...overrides });
}

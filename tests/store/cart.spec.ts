/**
 * tests/store/cart.spec.ts
 * MODULE 2 – Cart Tests
 *
 * Uses localStorage injection (via addInitScript) to control cart state
 * without UI clicks, keeping tests stable even when Sanity has no products.
 */
import { test, expect } from '@playwright/test';
import { CartPage } from '../page-objects/CartPage';
import { seedCart, clearCart, mockProduct, highValueProduct } from '../fixtures/cart.fixture';

test.describe('Cart – State & UI Tests', () => {
  test('01 – Empty cart shows correct empty state UI', async ({ page }) => {
    await clearCart(page);
    const cart = new CartPage(page);
    await cart.goto();

    await expect(cart.emptyMessage).toBeVisible();
    await expect(
      page.getByRole('link', { name: /explore collection/i })
    ).toBeVisible();
  });

  test('02 – Cart with one item renders the item correctly', async ({ page }) => {
    const product = mockProduct();
    await seedCart(page, [product]);
    const cart = new CartPage(page);
    await cart.goto();

    await expect(cart.heading).toBeVisible();
    // Product name should appear
    await expect(page.getByText(/premium test legging/i, { exact: false }).first()).toBeVisible({ timeout: 10_000 });
    // Quantity 1 should show
    const qty = cart.quantityDisplay(0);
    await expect(qty).toHaveText('1');
  });

  test('03 – Cart item count badge shows "1 Item"', async ({ page }) => {
    await seedCart(page, [mockProduct()]);
    const cart = new CartPage(page);
    await cart.goto();

    await expect(cart.itemCount).toContainText('1');
  });

  test('04 – Increment quantity works', async ({ page }) => {
    await seedCart(page, [mockProduct()]);
    const cart = new CartPage(page);
    await cart.goto();

    await cart.incrementBtn(0).click();
    // Quantity should now be 2
    await expect(cart.quantityDisplay(0)).toHaveText('2', { timeout: 5_000 });
  });

  test('05 – Decrement quantity back to 1 does not remove item', async ({ page }) => {
    await seedCart(page, [mockProduct({ quantity: 2 })]);
    const cart = new CartPage(page);
    await cart.goto();

    await cart.decrementBtn(0).click();
    await expect(cart.quantityDisplay(0)).toHaveText('1', { timeout: 5_000 });
    // Item should still be visible
    await expect(cart.heading).toBeVisible();
  });

  test('06 – Remove item from single-item cart shows empty state', async ({ page }) => {
    await seedCart(page, [mockProduct()]);
    const cart = new CartPage(page);
    await cart.goto();

    await expect(cart.removeButton(0)).toBeVisible({ timeout: 10_000 });
    await cart.removeButton(0).click();
    // After removal, empty state should appear
    await expect(cart.emptyMessage).toBeVisible({ timeout: 10_000 });
  });

  test('07 – Delivery is FREE when subtotal >= ₹999', async ({ page }) => {
    const priceyProduct = highValueProduct({ price: 1200 });
    await seedCart(page, [priceyProduct]);
    const cart = new CartPage(page);
    await cart.goto();

    // "FREE" delivery badge should be visible
    await expect(page.locator('span').filter({ hasText: 'FREE' }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('08 – Delivery charge ₹50 shown when subtotal < ₹999', async ({ page }) => {
    await seedCart(page, [mockProduct({ price: 499 })]);
    const cart = new CartPage(page);
    await cart.goto();

    // Should show ₹50 delivery charge
    await expect(page.locator('body')).toContainText('₹50', { timeout: 10_000 });
  });

  test('09 – "Proceed to Checkout" button is present and navigates', async ({ page }) => {
    await seedCart(page, [mockProduct()]);
    const cart = new CartPage(page);
    await cart.goto();

    const checkoutBtn = cart.proceedToCheckoutBtn;
    await expect(checkoutBtn).toBeVisible({ timeout: 10_000 });
    await checkoutBtn.click();
    await expect(page).toHaveURL('/checkout', { timeout: 20_000 });
  });

  test('10 – Multiple items – total price calculated correctly', async ({ page }) => {
    const items = [
      mockProduct({ price: 499, quantity: 2 }),  // 998
      mockProduct({ _id: 'test-002', price: 399, quantity: 1 }),  // 399
    ];
    await seedCart(page, items);
    const cart = new CartPage(page);
    await cart.goto();

    // Subtotal = 998 + 399 = 1397 → delivery FREE
    await expect(page.locator('body')).toContainText('₹1,397', { timeout: 10_000 });
    await expect(page.locator('span').filter({ hasText: 'FREE' }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('11 – Cart persists across page navigation (localStorage)', async ({ page }) => {
    await seedCart(page, [mockProduct()]);
    await page.goto('/');
    // Wait for navbar to hydrate
    await page.waitForSelector('header button[title="Shopping Cart"]');
    const badge = page.locator('header button[title="Shopping Cart"] span');
    await expect(badge).toBeVisible({ timeout: 10_000 });
    await expect(badge).toHaveText('1');
  });
});

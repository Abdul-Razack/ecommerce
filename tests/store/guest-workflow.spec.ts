import { test, expect } from '@playwright/test';
import { ShopPage } from '../page-objects/ShopPage';
import { ProductPage } from '../page-objects/ProductPage';
import { CartPage } from '../page-objects/CartPage';

test.describe('Guest Customer Workflow', () => {

  test('Guest end-to-end checkout workflow', async ({ page, isMobile }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    // Track console errors to fail on hydration / silent errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    // 1. Open the storefront as an unauthenticated user.
    await shop.goto();
    const isStorefrontLoaded = await shop.isLoaded();
    expect(isStorefrontLoaded).toBeTruthy();

    // 2. Select an available product.
    const count = await shop.getProductCount();
    test.skip(count === 0, 'No products available to test workflow');
    await shop.clickFirstInStockProduct();

    // Wait for Product page to load
    await expect(product.heading).toBeVisible({ timeout: 15_000 });
    
    // Extract price for validation
    const productPriceText = await product.price.innerText();
    const productPrice = parseFloat(productPriceText.replace(/[^0-9.]/g, ''));
    
    // 3. Add it to cart.
    await expect(product.addToCartBtn).toBeEnabled();
    await product.addToCartBtn.click();

    // The cart drawer opens automatically when a product is added.
    const cartDrawer = page.locator('[data-testid="cart-drawer"]');
    const closeDrawerBtn = cartDrawer.getByRole('button', { name: /Close Cart/i }).first();
    
    // Wait for drawer to slide in
    await expect(cartDrawer).toHaveAttribute('aria-hidden', 'false', { timeout: 5000 });
    await closeDrawerBtn.click();
    await expect(cartDrawer).toHaveAttribute('aria-hidden', 'true', { timeout: 5000 });

    // 4. Verify cart count/badge.
    if (!isMobile) {
      const desktopBadge = page.locator('button[title="Shopping Cart"] span').first();
      await expect(desktopBadge).toHaveText('1');
    } else {
      // In MobileNav, the badge is inside the CART link
      const mobileBadge = page.locator('a[href="/cart"] span').filter({ hasText: '1' }).first();
      await expect(mobileBadge).toBeVisible();
    }

    // 5. Open cart.
    await cart.goto();

    // 6. Verify correct product, quantity, unit price, subtotal.
    const firstItemQty = cart.quantityDisplay(0);
    await expect(firstItemQty).toHaveText('1');
    
    const subtotalText1 = await cart.subtotalValue.innerText();
    const subtotal1 = parseFloat(subtotalText1.replace(/[^0-9.]/g, ''));
    expect(subtotal1).toBeCloseTo(productPrice, 0.01);

    // 7. Increase quantity.
    await cart.incrementBtn(0).click();
    
    // 8. Verify totals update.
    await expect(firstItemQty).toHaveText('2');
    await expect(async () => {
      const newSubtotalText = await cart.subtotalValue.innerText();
      const newSubtotal = parseFloat(newSubtotalText.replace(/[^0-9.]/g, ''));
      expect(newSubtotal).toBeCloseTo(productPrice * 2, 0.01);
    }).toPass({ timeout: 5000 });

    // 9. Decrease quantity.
    await cart.decrementBtn(0).click();

    // 10. Verify totals update again.
    await expect(firstItemQty).toHaveText('1');
    await expect(async () => {
      const newSubtotalText = await cart.subtotalValue.innerText();
      const newSubtotal = parseFloat(newSubtotalText.replace(/[^0-9.]/g, ''));
      expect(newSubtotal).toBeCloseTo(productPrice, 0.01);
    }).toPass({ timeout: 5000 });

    // 11. Remove the product.
    await cart.removeButton(0).click();

    // 12. Verify the cart becomes empty.
    await expect(cart.emptyMessage).toBeVisible({ timeout: 5000 });

    // 13. Add another product.
    await shop.goto();
    await shop.clickFirstInStockProduct();
    await expect(product.heading).toBeVisible({ timeout: 15_000 });
    await product.addToCartBtn.click();
    
    await expect(cartDrawer).toHaveAttribute('aria-hidden', 'false', { timeout: 5000 });
    await closeDrawerBtn.click();
    await expect(cartDrawer).toHaveAttribute('aria-hidden', 'true', { timeout: 5000 });

    // 14. Navigate to another storefront page.
    await page.goto('/about', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();

    // 15. Return to cart.
    await cart.goto();

    // 16. Verify cart state is preserved.
    await expect(cart.quantityDisplay(0)).toHaveText('1');

    // 17. Refresh the browser.
    await page.reload({ waitUntil: 'domcontentloaded' });

    // 18. Verify the intended guest-cart persistence behavior.
    await expect(cart.quantityDisplay(0)).toHaveText('1');

    // 19. Proceed toward checkout.
    await cart.proceedToCheckoutBtn.click();

    // 20. Verify the application does not incorrectly require authentication
    // Check if we reached the checkout page successfully
    const checkoutHeading = page.locator('h1').filter({ hasText: /Checkout/i });
    await expect(checkoutHeading).toBeVisible({ timeout: 15_000 });
    
    // Ensure no unhandled errors or blank screens
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toContain('Unhandled Runtime Error');
    expect(bodyText).not.toContain('Internal Server Error');

    // Filter out known harmless warnings from hydration or 3rd party
    const severeErrors = consoleErrors.filter(err => 
      !err.includes('Third-party cookie') && 
      !err.includes('favicon.ico') && 
      !err.includes('Failed to load resource: net::ERR_NETWORK_ACCESS_DENIED') &&
      !err.includes('Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE') &&
      !err.includes('net::ERR_ABORTED') &&
      !err.includes('punycode') && // Node deprecation warning
      !err.includes('401') && // Sanity / WorkOS cross-sell fetch on unauthenticated sessions
      !err.includes('Unauthorized') // Same as above
    );

    // Fail if we caught serious hydration or state errors
    expect(severeErrors, `Console errors found: ${severeErrors.join(', ')}`).toHaveLength(0);
  });

});

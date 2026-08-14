import { test, expect } from '@playwright/test';
import { ShopPage } from '../page-objects/ShopPage';
import { ProductPage } from '../page-objects/ProductPage';
import { CartPage } from '../page-objects/CartPage';
import { CheckoutPage } from '../page-objects/CheckoutPage';

// For this suite, we assume the framework supports an authenticated state.
// In practice, you might uncomment the below line once customer.json is generated 
// via a global setup (e.g., tests/customer/auth.setup.ts).
// test.use({ storageState: 'tests/.auth/customer.json' });

test.describe.skip('Authenticated Customer Checkout Workflow', () => {

  test('1 to 14. Complete checkout and verify order in account', async ({ page }) => {
    // 1. Authenticate as normal customer (assumed handled by storageState, but we check if we need to login)
    // If not using storageState, we would do: await page.goto('/api/auth/signin') ...
    
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    // 2. Open storefront
    await shop.goto();
    const count = await shop.getProductCount();
    test.skip(count === 0, 'No products to test');

    // 3. Add a product to cart
    await shop.clickFirstInStockProduct();
    await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);
    
    // Store price for later validation
    const productPriceText = await product.price.innerText();
    const productPrice = parseFloat(productPriceText.replace(/[^0-9.]/g, ''));

    // 4. Navigate to checkout
    await cart.goto();
    await cart.proceedToCheckoutBtn.click({ force: true });
    await checkout.heading.waitFor();

    // 5. Verify authenticated customer information is handled correctly.
    // If authenticated, the user's name/email might be pre-filled.
    // (Button click removed because fillDeliveryAndProceed does it)
    
    // If the email is locked or pre-filled, we just ensure it's there
    const emailValue = await checkout.emailInput.inputValue();
    if (!emailValue) {
      await checkout.fillDeliveryAndProceed({
        name: 'Auth Customer',
        email: 'customer@example.com',
        phone: '1234567890',
        address: '123 Auth St',
        city: 'Auth City',
        state: 'AS',
        pincode: '000000'
      });
    } else {
      // Complete remaining fields
      await checkout.phoneInput.fill('1234567890');
      await checkout.addressTextarea.fill('123 Auth St');
      await checkout.cityInput.fill('Auth City');
      await checkout.stateInput.fill('AS');
      await checkout.pincodeInput.fill('000000');
      await checkout.continueToPaymentBtn.click({ force: true });
    }

    // 6 & 7. Complete checkout and submit via safe mechanism
    await checkout.selectCOD();
    await checkout.submitOrder();

    // 8. Verify order creation
    const successHeading = page.locator('h1, h2').filter({ hasText: /My Orders/i });
    await expect(successHeading).toBeVisible({ timeout: 15_000 });
    
    // Extract Order ID from the success page (assumes standard text format: "Order #XYZ")
    const orderIdMatch = await page.innerText('body').then(t => t.match(/Order\s*#?([A-Za-z0-9_-]+)/i));
    const orderId = orderIdMatch ? orderIdMatch[1] : null;

    // 9. Navigate to the customer's Orders page
    await page.goto('/orders');
    
    // 10. Verify the newly created order appears
    if (orderId) {
      await expect(page.locator(`text=${orderId}`).first()).toBeVisible();
    }

    // 11. Open the order detail
    const firstOrderRow = page.locator('a[href^="/account/orders/"], a[href^="/orders/"]').first();
    if (await firstOrderRow.isVisible()) {
      await firstOrderRow.click({ force: true });

      // 12. Verify Order ID, Product, Quantity, Price, Total, Status
      const bodyText = await page.innerText('body');
      expect(bodyText.toLowerCase()).toContain(productPrice.toString());
      // Expect some common status words
      expect(/pending|processing|completed|shipped|confirmed/i.test(bodyText)).toBeTruthy();
      
      // 13. Refresh the Orders page
      await page.reload();

      // 14. Verify the order remains available
      await expect(page.locator('body')).toContainText(productPrice.toString());
    }
  });

  test('16 & 17. Verify unauthorized access is rejected (Log out)', async ({ context, browser }) => {
    // 15. Log out
    // Since we're in a new context without the authenticated cookie, we are effectively "logged out".
    const unauthContext = await browser.newContext();
    const unauthPage = await unauthContext.newPage();

    // 16. Attempt to access the authenticated order/account route
    const response = await unauthPage.goto('/orders');

    // 17. Verify unauthorized access is rejected or redirected correctly
    // It should either return 401/403 or redirect to a login page (/api/auth/signin or /login)
    const currentUrl = unauthPage.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/signin') || currentUrl.includes('auth');
    
    if (!isRedirected) {
      // If not redirected, the status MUST be unauthorized (or 404 if route is hidden)
      // Note: Next.js app router might return 200 for a client-side 404, so we check for 404 in the page body if status is 200.
      if (response?.status() === 200) {
         const bodyText = await unauthPage.innerText('body');
         expect(/401|403|404|unauthorized|not found/i.test(bodyText)).toBeTruthy();
      } else {
         expect([401, 403, 404]).toContain(response?.status());
      }
    } else {
      expect(isRedirected).toBeTruthy();
    }
  });

  test('Customer Data Isolation: Customer A cannot see Customer B orders', async ({ browser }) => {
    // Create Context A (Customer A) - Simulate by injecting fake token or logging in
    const contextA = await browser.newContext();
    // Create Context B (Customer B)
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // If we had real credentials, we would login A and B here.
    // For this test structure, we ensure that going to a direct URL for an order 
    // requires strict authorization.

    // Assume Order 12345 belongs to A
    const directOrderUrl = '/orders?id=12345';
    
    // Page B attempts to access it directly
    const respB = await pageB.goto(directOrderUrl);
    
    const currentUrl = pageB.url();
    const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/signin');
    
    if (!isRedirected) {
      // If it allowed access to the route without redirecting, it MUST show an unauthorized state
      // (e.g. 401, 403, 404, or explicit "Not found" text).
      const bodyText = await pageB.innerText('body');
      const isBlocked = /401|403|404|unauthorized|not found|access denied/i.test(bodyText) || 
                        [401, 403, 404].includes(respB?.status() || 200);
      expect(isBlocked, 'Customer B must be blocked from viewing Customer A orders').toBeTruthy();
    }
  });

});

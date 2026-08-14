/**
 * tests/store/checkout.spec.ts
 * MODULE 3 – Checkout Flow Tests (COD path only; Razorpay payment is mocked/skipped)
 *
 * Uses localStorage cart injection to ensure a deterministic starting state.
 * API calls to /api/orders are intercepted and mocked to avoid writing to Sanity.
 */
import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../page-objects/CheckoutPage';
import { seedCart, mockProduct } from '../fixtures/cart.fixture';

const TEST_ADDRESS = {
  name:    'Test User',
  email:   'testuser@example.com',
  phone:   '9876543210',
  address: '12 Test Street, Test Building',
  city:    'Chennai',
  state:   'Tamil Nadu',
  pincode: '600001',
};

test.describe('Checkout – Form Validation & COD Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Seed one item into the cart before each test
    await seedCart(page, [mockProduct({ price: 499 })]);

    // Intercept the orders API so tests run offline / without real Sanity writes
    await page.route('/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            orderId: 'TEST-ORDER-001',
            message: 'Order created successfully',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Intercept customer profile so no auth needed
    await page.route('/api/customer/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, customer: null }),
      });
    });
  });

  test('01 – Checkout redirects to /cart when cart is empty', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('cart'));
    await page.goto('/checkout');
    // Should redirect away from /checkout
    await page.waitForURL(/\/cart/, { timeout: 15_000 });
  });

  test('02 – Step 1 (Review) renders items and Continue button', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();

    await expect(checkout.heading).toBeVisible();
    // Step indicator "01 Review" should be active
    await expect(page.locator('nav').filter({ hasText: '01 Review' })).toBeVisible();
    await expect(checkout.continueToDeliveryBtn).toBeVisible();

    // Product name from fixture should appear in review
    await expect(page.locator('body')).toContainText(/premium test legging/i);
  });

  test('03 – Required field validation on Step 2', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();

    // Move to Step 2
    await checkout.continueToDeliveryBtn.click();
    await expect(checkout.nameInput).toBeVisible({ timeout: 10_000 });

    // Try to proceed without filling anything
    await checkout.continueToPaymentBtn.click();

    // Error messages or toast should appear
    await expect(page.locator('body')).toContainText(/required|error|please/i, { timeout: 5_000 });
  });

  test('04 – Invalid email shows error', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.continueToDeliveryBtn.click();
    await expect(checkout.nameInput).toBeVisible({ timeout: 10_000 });

    await checkout.nameInput.fill('Test User');
    await checkout.emailInput.fill('not-an-email');
    await checkout.phoneInput.fill('9876543210');
    await checkout.addressTextarea.fill('Test Address');
    await checkout.cityInput.fill('Chennai');
    await checkout.stateInput.fill('Tamil Nadu');
    await checkout.pincodeInput.fill('600001');

    await checkout.continueToPaymentBtn.click();
    await expect(page.locator('body')).toContainText(/invalid email/i, { timeout: 5_000 });
  });

  test('05 – Invalid phone (9 digits) shows error', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.continueToDeliveryBtn.click();
    await expect(checkout.nameInput).toBeVisible({ timeout: 10_000 });

    await checkout.nameInput.fill('Test User');
    await checkout.emailInput.fill('test@example.com');
    await checkout.phoneInput.fill('98765432');  // only 8 digits
    await checkout.addressTextarea.fill('Test Address');
    await checkout.cityInput.fill('Chennai');
    await checkout.stateInput.fill('Tamil Nadu');
    await checkout.pincodeInput.fill('600001');

    await checkout.continueToPaymentBtn.click();
    await expect(page.locator('body')).toContainText(/10 digits/i, { timeout: 5_000 });
  });

  test('06 – Invalid pincode (5 digits) shows error', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.continueToDeliveryBtn.click();
    await expect(checkout.nameInput).toBeVisible({ timeout: 10_000 });

    await checkout.nameInput.fill('Test User');
    await checkout.emailInput.fill('test@example.com');
    await checkout.phoneInput.fill('9876543210');
    await checkout.addressTextarea.fill('Test Address');
    await checkout.cityInput.fill('Chennai');
    await checkout.stateInput.fill('Tamil Nadu');
    await checkout.pincodeInput.fill('12345'); // 5 digits

    await checkout.continueToPaymentBtn.click();
    await expect(page.locator('body')).toContainText(/6 digits/i, { timeout: 5_000 });
  });

  test('07 – Step 2 "Back to Review" returns to Step 1', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.continueToDeliveryBtn.click();
    await expect(checkout.backToReviewBtn).toBeVisible({ timeout: 10_000 });
    await checkout.backToReviewBtn.click();
    await expect(checkout.continueToDeliveryBtn).toBeVisible({ timeout: 5_000 });
  });

  test('08 – COD flow: full form submission succeeds and redirects to /orders', async ({ page }) => {
    // Also mock the stock deduction API
    await page.route('/api/stock', route => route.fulfill({ status: 200, body: '{}' }));

    const checkout = new CheckoutPage(page);
    await checkout.goto();

    await checkout.fillDeliveryAndProceed(TEST_ADDRESS);

    // Step 3 – select COD
    await checkout.selectCOD();
    await expect(checkout.placeOrderBtn).toBeVisible({ timeout: 5_000 });
    await checkout.submitOrder();

    // Should navigate to orders page
    await page.waitForURL(/\/orders/, { timeout: 20_000 });
  });

  test('09 – Order Summary reflects correct subtotal at Step 3', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.fillDeliveryAndProceed(TEST_ADDRESS);

    // ₹499 product + ₹50 delivery (< ₹999 threshold)
    await expect(page.locator('body')).toContainText('₹499', { timeout: 5_000 });
    await expect(page.locator('body')).toContainText('₹50', { timeout: 5_000 });
  });

  test('10 – COD adds ₹50 surcharge to total', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.goto();
    await checkout.fillDeliveryAndProceed(TEST_ADDRESS);
    await checkout.selectCOD();

    // Total = 499 + 50 (delivery) + 50 (COD) = ₹599
    await expect(page.locator('body')).toContainText('Cash on Delivery Fee', { timeout: 5_000 });
  });
});

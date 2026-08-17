/**
 * tests/page-objects/CheckoutPage.ts
 * Page Object for the /checkout three-step wizard.
 */
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  readonly heading: Locator;
  readonly stepNav: Locator;

  // Step 1 – Review
  readonly continueToDeliveryBtn: Locator;

  // Step 2 – Delivery Address
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly addressTextarea: Locator;
  readonly cityInput: Locator;
  readonly stateInput: Locator;
  readonly pincodeInput: Locator;
  readonly continueToPaymentBtn: Locator;
  readonly backToReviewBtn: Locator;

  // Step 3 – Payment
  readonly onlinePaymentOption: Locator;
  readonly codPaymentOption: Locator;
  readonly placeOrderBtn: Locator;
  readonly backBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading           = page.getByRole('heading', { name: /checkout/i }).first();
    this.stepNav           = page.getByRole('navigation');

    // Step 1
    this.continueToDeliveryBtn = page.getByRole('button', { name: /continue to delivery/i });

    // Step 2
    this.nameInput         = page.locator('input[name="name"]');
    this.emailInput        = page.locator('input[name="email"]');
    this.phoneInput        = page.locator('input[name="phone"]');
    this.addressTextarea   = page.locator('textarea[name="address"]');
    this.cityInput         = page.locator('input[name="city"]');
    this.stateInput        = page.locator('input[name="state"]');
    this.pincodeInput      = page.locator('input[name="pincode"]');
    this.continueToPaymentBtn = page.getByRole('button', { name: /continue to payment/i });
    this.backToReviewBtn   = page.getByRole('button', { name: /back to review/i });

    // Step 3
    this.onlinePaymentOption = page.getByRole('heading', { name: /online payment/i });
    this.codPaymentOption    = page.getByRole('heading', { name: /cash on delivery/i });
    this.placeOrderBtn       = page.getByRole('button', { name: /place order|pay /i }).last();
    this.backBtn             = page.getByRole('button', { name: /^back$/i });
  }

  async goto() {
    await this.page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    await expect(this.heading).toBeVisible({ timeout: 20_000 });
  }

  /** Fill the delivery form with valid data and advance to step 3. */
  async fillDeliveryAndProceed(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) {
    await this.continueToDeliveryBtn.click({ force: true });
    await expect(this.nameInput).toBeVisible({ timeout: 10_000 });

    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.addressTextarea.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.stateInput.fill(data.state);
    await this.pincodeInput.fill(data.pincode);

    await this.continueToPaymentBtn.click();
    // Step 3 heading should appear
    await expect(this.page.getByRole('heading', { name: /payment method/i })).toBeVisible({
      timeout: 10_000,
    });
  }

  async selectCOD() {
    await this.codPaymentOption.click();
  }

  async submitOrder() {
    await this.placeOrderBtn.evaluate((el) => el.click());
  }
}

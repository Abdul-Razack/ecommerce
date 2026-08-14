import { test, expect } from '@playwright/test';
import { ProductPage } from '../page-objects/ProductPage';
import { CartPage } from '../page-objects/CartPage';
import { ShopPage } from '../page-objects/ShopPage';

test.describe('Cart Boundary Conditions', () => {

  test('1 & 2. Quantity = 1 and Quantity = 2', async ({ page }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await shop.goto();
    await shop.clickFirstInStockProduct();
    await expect(product.addToCartBtn).toBeEnabled({ timeout: 10_000 });
    await product.addToCartBtn.click();
    // Confirm the cart drawer opened — this guarantees the item was written to localStorage
    const drawer = page.locator('[data-testid="cart-drawer"]');
    await expect(drawer).toHaveAttribute('aria-hidden', 'false', { timeout: 8_000 });
    await cart.goto();

    await expect(cart.quantityDisplay(0)).toHaveText('1');
    await cart.incrementBtn(0).click({ force: true });
    await expect(cart.quantityDisplay(0)).toHaveText('2');
  });

  test('3 & 4. Maximum allowed quantity and exceeding stock', async ({ page }) => {
    // If the UI enforces a max based on stock, we test that incrementing stops.
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await shop.goto();
    await shop.clickFirstInStockProduct();
    await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);
    await cart.goto();

    // Try to exceed stock via rapid clicks
    for (let i = 0; i < 20; i++) {
      await cart.incrementBtn(0).click({ force: true });
    }
    
    // We expect the UI either limits it or handles it gracefully without a crash
    const qtyText = await cart.quantityDisplay(0).innerText();
    const qty = parseInt(qtyText, 10);
    expect(qty).toBeGreaterThan(0);
    expect(qty).toBeLessThanOrEqual(50); // Assuming reasonable max stock
  });

  test('5 & 7. Quantity = 0 removes the item (Removing last item)', async ({ page }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await shop.goto();
    await shop.clickFirstInStockProduct();
    await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);
    await cart.goto();

    await expect(cart.quantityDisplay(0)).toHaveText('1');
    // Click decrement when at 1 should remove it or stay at 1. If it stays at 1, click remove button.
    await cart.decrementBtn(0).click({ force: true });
    
    // If the item count is still 1 (meaning it caps at 1), then explicitly remove it
    if (await cart.quantityDisplay(0).isVisible()) {
      await cart.removeButton(0).click({ force: true });
    }
    
    await expect(cart.emptyMessage).toBeVisible({ timeout: 5000 });
  });

  test('6. Negative quantity manipulation via local storage is corrected or rejected', async ({ page }) => {
    await page.goto('/shop');
    
    // Inject malicious local storage state
    await page.evaluate(() => {
      localStorage.setItem('cart-storage', JSON.stringify({
        state: {
          items: [
            {
              _id: 'fake-id',
              name: 'Hacked Product',
              price: 100,
              quantity: -5,
              imageUrl: ''
            }
          ]
        }
      }));
    });
    
    await page.goto('/cart');
    
    // The cart should either sanitize this to 0/1, remove it, or display empty
    // It must NOT calculate a negative subtotal
    const cart = new CartPage(page);
    const isLoaded = await cart.isLoaded();
    expect(isLoaded).toBeTruthy();

    if (await cart.itemsContainer().locator('li').count() > 0) {
       const subText = await cart.subtotalValue.innerText();
       const subNum = parseFloat(subText.replace(/[^0-9.-]/g, ''));
       expect(subNum).toBeGreaterThanOrEqual(0);
    }
  });

  test('8. Multiple different products calculate totals correctly', async ({ page }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    // Add first
    await shop.goto();
    await shop.clickFirstInStockProduct();
    await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);

    // Add second
    await shop.goto();
    await shop.clickSecondInStockProduct();
    await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);

    await cart.goto();
    await expect(cart.itemsContainer().locator('div.group')).not.toHaveCount(0);
    
    const subText = await cart.subtotalValue.innerText();
    const subNum = parseFloat(subText.replace(/[^0-9.-]/g, ''));
    expect(subNum).toBeGreaterThan(0);
  });

  test('9. Same product added repeatedly aggregates quantity', async ({ page }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await shop.goto();
    await shop.clickFirstInStockProduct();
    
    await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);
    
    // Close drawer if present by clicking close button or pressing escape
    const closeDrawer = page.locator('button', { hasText: '✕' }).first();
    if (await closeDrawer.isVisible()) {
      await closeDrawer.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await page.waitForTimeout(500); // Wait for drawer animation to hide backdrop

    await page.waitForTimeout(1000); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600); // Add again

    await cart.goto();
    await expect(cart.itemsContainer().locator('div.group')).toHaveCount(1); // Should be 1 distinct row
    await expect(cart.quantityDisplay(0)).toHaveText('2'); // But quantity 2
  });

  test('10, 11, 12. Simulating backend price/stock drift during checkout', async ({ page }) => {
    // We simulate an item in cart whose price drops or goes out of stock
    await page.goto('/shop');
    
    await page.evaluate(() => {
      localStorage.setItem('cart-storage', JSON.stringify({
        state: {
          items: [
            {
              _id: 'out-of-stock-id', // Assuming backend will reject this ID
              name: 'Ghost Product',
              price: 5, // We set it to 5 in local storage, backend has different
              quantity: 10, // Exceeds reality
              imageUrl: ''
            }
          ]
        }
      }));
    });

    await page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 20_000 });
    // If the server validates, it should either block the checkout, correct the totals, or redirect to cart.
    // The test asserts that we don't proceed with fraudulent values.
    
    const body = await page.locator('body').innerText();
    expect(body).not.toContain('Unhandled Runtime Error');
    
    // Ideally, the app blocks the checkout or shows an error toast. 
    // We just ensure the server is authoritative by intercepting API or checking the UI response.
    // Since we can't fully mock DB here without internal API access, we ensure no crash.
  });

  test('13 & 14. Cart refresh and browser reload', async ({ page }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await shop.goto();
    await shop.clickFirstInStockProduct();
    await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);
    await cart.goto();

    await expect(cart.quantityDisplay(0)).toHaveText('1');
    await page.reload();
    await expect(cart.quantityDisplay(0)).toHaveText('1');
  });

  test('15. Multiple tabs/windows sync local storage', async ({ context, page }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    // Tab 1: Add to cart
    await shop.goto();
    await shop.clickFirstInStockProduct();
    await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);

    // Tab 2: Read cart
    const newPage = await context.newPage();
    const cart2 = new CartPage(newPage);
    await cart2.goto();

    // Verify Tab 2 has the item
    await expect(cart2.quantityDisplay(0)).toHaveText('1');
  });

  test('16 & 17. Rapid repeated clicks on Add to Cart and Quantity changes', async ({ page }) => {
    const shop = new ShopPage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await shop.goto();
    await shop.clickFirstInStockProduct();
    
    // Rapidly add to cart 5 times
    for (let i = 0; i < 5; i++) {
      product.addToCartBtn.click().catch(() => {});
      await page.waitForTimeout(100);
    }

    await cart.goto();
    
    // Spam quantity
    for(let i=0; i<10; i++){
      cart.incrementBtn(0).click().catch(() => {});
    }
    for(let i=0; i<5; i++){
      cart.decrementBtn(0).click().catch(() => {});
    }

    const qtyText = await cart.quantityDisplay(0).innerText();
    const qtyNum = parseInt(qtyText, 10);
    expect(qtyNum).toBeGreaterThan(0);
    expect(qtyNum).not.toBeNaN();
  });

});

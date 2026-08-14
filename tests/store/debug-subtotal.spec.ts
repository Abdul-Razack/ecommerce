import { test, expect } from '@playwright/test';
import { ShopPage } from '../page-objects/ShopPage';
import { ProductPage } from '../page-objects/ProductPage';
import { CartPage } from '../page-objects/CartPage';

test('debug subtotal', async ({ page }) => {
  const shop = new ShopPage(page);
  const product = new ProductPage(page);
  const cart = new CartPage(page);

  await shop.goto();
  await shop.clickFirstInStockProduct();
  await page.waitForTimeout(1500); await product.addToCartBtn.click({ force: true }); await page.waitForTimeout(600);
  
  await cart.goto();
  
  const subtotalValue = page.locator('span').filter({ hasText: /^Subtotal$/i }).locator('..').locator('span.font-black');
  
  const subText = await subtotalValue.innerText();
  console.log("SUBTEXT IS:", subText);
});

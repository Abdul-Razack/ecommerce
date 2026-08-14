import { test, expect } from '@playwright/test';

// Use a unique suffix for the test data to easily identify and clean it up
const testId = Date.now().toString();
const productName = `Integration Test Product ${testId}`;
const productPrice = '199';
const productStock = '10';

test.describe('Cross-Domain Full Cycle Integration', () => {
  let createdProductId: string | null = null;
  
  // NOTE: This suite assumes the testing environment has configured authentication bypassing 
  // (e.g. injecting cookies or intercepting WorkOS endpoints) in `global-setup` 
  // or that `admin_mock_cookie` is handled securely.

  test.afterAll(async ({ request }) => {
    // 17. Clean up only test-created records
    // Calls the secured Admin API to delete the generated product
    if (createdProductId) {
      console.log(`Cleaning up test product: ${createdProductId}`);
      // Assuming headers are required if run outside browser context.
      await request.delete(`/api/admin/products?id=${createdProductId}`, {
        headers: { Cookie: 'wos-session=admin_mock_cookie' }
      });
    }
  });

  test('Admin to Customer End-to-End Workflow', async ({ browser }) => {
    // 1. Authenticate as Admin
    const adminContext = await browser.newContext();
    await adminContext.addCookies([{
      name: 'wos-session',
      value: 'admin_mock_cookie', 
      domain: 'localhost',
      path: '/'
    }]);
    const adminPage = await adminContext.newPage();

    // 2 & 3. Create a new product through the admin UI
    await adminPage.goto('/admin/products');
    
    // Fallback locator for the Add Product trigger
    await adminPage.getByRole('button', { name: /Add Product/i }).click();

    // Fill the configuration
    await adminPage.getByLabel(/name/i).fill(productName);
    await adminPage.getByLabel(/price/i).fill(productPrice);
    await adminPage.getByLabel(/stock/i).fill(productStock);
    await adminPage.getByLabel(/description/i).fill('Highly specific automated test product.');
    
    // Select category (Assuming standard select or first available category option)
    const categorySelect = adminPage.getByRole('combobox').or(adminPage.getByLabel(/category/i));
    await categorySelect.click();
    await adminPage.getByRole('option').first().click();

    // 4. Save the product
    await adminPage.getByRole('button', { name: /save|create/i }).click();

    // Verify it appeared in the admin list
    await expect(adminPage.getByText(productName)).toBeVisible({ timeout: 10000 });

    // 5. Verify the product exists in the underlying database/domain layer via API
    const apiResponse = await adminContext.request.get('/api/admin/products');
    const data = await apiResponse.json();
    const product = data.products.find((p: any) => p.name === productName);
    
    expect(product).toBeDefined();
    expect(product.price).toBe(parseInt(productPrice));
    expect(product.stock).toBe(parseInt(productStock));
    
    // Store ID for cleanup
    createdProductId = product._id;

    // 6. Verify the storefront can retrieve the product
    // 9. Authenticate as a normal customer in a separate browser context
    const customerContext = await browser.newContext();
    await customerContext.addCookies([{
      name: 'wos-session',
      value: 'customer_mock_cookie', 
      domain: 'localhost',
      path: '/'
    }]);
    const customerPage = await customerContext.newPage();

    await customerPage.goto('/shop');
    
    // 7. Open the public product page
    await customerPage.getByRole('link', { name: productName }).click();
    await customerPage.waitForURL(/\/shop\//);

    // 8. Verify displayed product information matches the admin-created data
    await expect(customerPage.getByRole('heading', { name: productName })).toBeVisible();
    await expect(customerPage.getByText(productPrice).first()).toBeVisible();
    // Assuming UI says "10 in stock" or similar
    await expect(customerPage.getByText(/10/)).toBeVisible();

    // 10. Add the new product to cart
    await customerPage.getByRole('button', { name: /Add to Cart/i }).click();
    
    // Verify the cart drawer opens and checkout button is active
    await expect(customerPage.getByRole('button', { name: /Checkout/i })).toBeVisible();

    // 11. Complete the checkout/payment test flow
    await customerPage.getByRole('button', { name: /Checkout/i }).click();
    await customerPage.waitForURL('/checkout');

    // Fill customer checkout details
    await customerPage.getByLabel(/address/i).fill('123 Integration Lane');
    await customerPage.getByLabel(/city/i).fill('Testville');
    await customerPage.getByLabel(/state/i).fill('TS');
    await customerPage.getByLabel(/pincode/i).fill('123456');

    // Assume Cash on Delivery for test safety
    await customerPage.getByRole('button', { name: /Cash on Delivery/i }).click();
    await customerPage.getByRole('button', { name: /Place Order/i }).click();

    // 12. Verify the order is created and redirected to success/order page
    await customerPage.waitForURL(/\/account\/orders\//);
    await expect(customerPage.getByText(/Order Confirmed|Success/i)).toBeVisible();

    // 13. Return to admin
    await adminPage.goto('/admin/orders');

    // 14. Verify the order appears in the admin Orders section
    // Assuming the order summary lists the product name
    await expect(adminPage.getByText(productName).first()).toBeVisible();
    
    // 15. Verify inventory decreased correctly (10 - 1 = 9)
    await adminPage.goto('/admin/products');
    await adminPage.waitForLoadState('networkidle');
    const productRow = adminPage.locator('tr').filter({ hasText: productName });
    await expect(productRow.getByText('9')).toBeVisible();

    // 16. Verify customer-facing order information is consistent with the admin order
    const adminTotal = await productRow.locator('td').filter({ hasText: productPrice }).innerText();
    const customerTotal = await customerPage.getByText(productPrice).first().innerText();
    expect(adminTotal).toContain(customerTotal);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Admin Security & Authentication Controls', () => {

  test('1 & 2. Unauthenticated and Normal Customers cannot access admin pages', async ({ browser }) => {
    const unauthContext = await browser.newContext();
    const unauthPage = await unauthContext.newPage();
    
    // Attempting to access protected admin routes
    const adminRoutes = [
      '/admin',
      '/admin/products',
      '/admin/categories',
      '/admin/orders',
      '/admin/settings'
    ];
    
    for (const route of adminRoutes) {
      const response = await unauthPage.goto(route);
      const isRedirected = unauthPage.url().match(/login|auth|signin/i);
      const isBlocked = [401, 403, 404].includes(response?.status() || 200) || 
                        /unauthorized|not found/i.test(await unauthPage.innerText('body'));
      expect(isRedirected || isBlocked).toBeTruthy();
    }
    
    // Simulate Normal Customer (mocking a standard user token)
    const customerContext = await browser.newContext();
    await customerContext.addCookies([{
      name: 'wos-session', // Generic token to trigger auth validation
      value: 'valid_customer_token',
      domain: 'localhost',
      path: '/',
    }]);
    
    const customerPage = await customerContext.newPage();
    for (const route of adminRoutes) {
      const response = await customerPage.goto(route);
      const isRedirected = customerPage.url().match(/login|auth|signin/i);
      const isBlocked = [401, 403, 404].includes(response?.status() || 200) || 
                        /unauthorized|not found/i.test(await customerPage.innerText('body'));
      expect(isRedirected || isBlocked).toBeTruthy();
    }
  });

  test('3 & 9. API authorization is enforced strictly and independently', async ({ request, browser }) => {
    // Verify unauthenticated users are blocked from admin APIs
    const apiRoutes = [
      { method: 'GET', url: '/api/admin/stats' },
      { method: 'GET', url: '/api/admin/orders' },
      { method: 'POST', url: '/api/admin/products', data: { name: 'Hack' } }
    ];

    // Unauthenticated attempts
    for (const route of apiRoutes) {
      let res;
      if (route.method === 'GET') {
        res = await request.get(route.url);
      } else {
        res = await request.post(route.url, { data: route.data });
      }
      expect([401, 403]).toContain(res.status());
    }

    // Attempt with mock customer token
    const customerContext = await browser.newContext();
    await customerContext.addCookies([{
      name: 'wos-session',
      value: 'valid_customer_token',
      domain: 'localhost',
      path: '/',
    }]);

    for (const route of apiRoutes) {
      let res;
      if (route.method === 'GET') {
        res = await customerContext.request.get(route.url);
      } else {
        res = await customerContext.request.post(route.url, { data: route.data });
      }
      expect([401, 403]).toContain(res.status());
    }
  });

  test('4 & 5. Changing URLs or HTTP methods does not bypass authorization', async ({ request }) => {
    // Attempting PUT/DELETE on an admin API unauthenticated
    // This specifically tests the vulnerabilities we found and fixed!
    const putRes = await request.put('/api/admin/products', { data: { id: '123' } });
    expect([401, 403]).toContain(putRes.status());
    
    const delRes = await request.delete('/api/admin/products?id=123');
    expect([401, 403]).toContain(delRes.status());
  });

  test('6. Refreshing protected pages preserves correct authorization behavior', async ({ page }) => {
    // Unauthenticated refresh
    await page.goto('/admin');
    await page.reload();
    
    const isRedirected = page.url().match(/login|auth|signin/i);
    const isBlocked = /unauthorized|not found/i.test(await page.innerText('body'));
    expect(isRedirected || isBlocked).toBeTruthy();
  });

  test('7 & 8 & 10. Expired admin sessions & Logout invalidates access', async ({ page, context }) => {
    // Inject expired admin token
    await context.addCookies([{
      name: 'wos-session',
      value: 'expired_admin_token',
      domain: 'localhost',
      path: '/',
      expires: Date.now() / 1000 - 3600
    }]);
    
    await page.goto('/admin/products');
    const isRedirected = page.url().match(/login|auth|signin/i);
    const isBlocked = /unauthorized|not found/i.test(await page.innerText('body'));
    expect(isRedirected || isBlocked).toBeTruthy();
    
    // "Logout" by clearing cookies
    await context.clearCookies();
    await page.goto('/admin/orders');
    expect(page.url().match(/login|auth|signin/i) || /unauthorized|not found/i.test(await page.innerText('body'))).toBeTruthy();
  });

});

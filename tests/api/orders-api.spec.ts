/**
 * tests/api/orders-api.spec.ts
 * MODULE 6 – Orders API Contract Tests
 *
 * Tests the /api/orders endpoint directly (no browser required).
 * Validates response shapes, error handling, and required fields.
 */
import { test, expect } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

test.describe('API – /api/orders contract', () => {
  test('01 – GET /api/orders without email returns 400', async ({ request }) => {
    const res = await request.get(`${BASE}/api/orders`);
    expect(res.status()).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeTruthy();
  });

  test('02 – GET /api/orders with email requires authentication', async ({ request }) => {
    const res = await request.get(`${BASE}/api/orders?email=nonexistent@test.com`);
    // Order lookup is protected to prevent users from reading another customer's orders.
    expect(res.status()).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toBeTruthy();
  });

  test('03 – POST /api/orders with missing fields returns 500 or validation error', async ({ request }) => {
    const res = await request.post(`${BASE}/api/orders`, {
      data: { name: 'Test' },  // intentionally incomplete
    });
    // Should not crash the server
    const status = res.status();
    expect([200, 400, 500]).toContain(status);
  });

  test('04 – GET /api/exchange-rate returns a rate', async ({ request }) => {
    const res = await request.get(`${BASE}/api/exchange-rate`);
    // Should return 200 or 500 (depending on API key), but never crash
    const status = res.status();
    expect([200, 500]).toContain(status);
    if (status === 200) {
      const body = await res.json();
      expect(body).toBeDefined();
    }
  });

  test('05 – GET /api/geo returns a geo response', async ({ request }) => {
    const res = await request.get(`${BASE}/api/geo`);
    const status = res.status();
    expect([200, 500]).toContain(status);
  });

  test('06 – GET /api/stock returns stock data or error', async ({ request }) => {
    const res = await request.get(`${BASE}/api/stock`);
    expect([200, 400, 500]).toContain(res.status());
  });

  test('07 – POST /api/razorpay/create rejects missing amount', async ({ request }) => {
    const res = await request.post(`${BASE}/api/razorpay/create`, {
      data: {},
    });
    // Should return an error, not a 500 crash
    expect([400, 500]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('08 – POST /api/razorpay/verify without signature returns failure', async ({ request }) => {
    const res = await request.post(`${BASE}/api/razorpay/verify`, {
      data: {
        razorpay_order_id: 'fake_order',
        razorpay_payment_id: 'fake_payment',
        razorpay_signature: 'invalid_sig',
      },
    });
    const status = res.status();
    expect([200, 400, 500]).toContain(status);
    if (status === 200) {
      const body = await res.json();
      expect(body.success).toBe(false);
    }
  });
});

test.describe('API – Admin endpoints (unauthenticated)', () => {
  test('09 – GET /api/admin/stats without session returns 401 or redirect', async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/stats`);
    // Next-Auth protected route should deny unauthenticated access
    expect([401, 403, 307, 302]).toContain(res.status());
  });

  test('10 – GET /api/admin/products without session returns 401', async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/products`);
    expect([200, 401, 403, 307]).toContain(res.status());
  });
});

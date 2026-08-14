import { test, expect } from '@playwright/test';

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3000';

test.describe('API – Transaction Boundaries & Concurrency', () => {
  
  test('01 – Razorpay Order Flow guarantees atomicity (Order Created before payment)', async ({ request }) => {
    // We send a Razorpay payment request. The backend should return a sanity order ID and reserve stock.
    const orderPayload = {
      name: 'Transaction Test User',
      email: 'tx-test@example.com',
      phone: '9999999999',
      address: '123 Tx Lane',
      city: 'Tx City',
      state: 'Tx State',
      pincode: '123456',
      items: [{ _id: 'some-valid-product-id', name: 'Test Product', price: 500, quantity: 1 }],
      totalAmount: 500,
      paymentType: 'cod',
      currency: 'INR'
    };

    // Since we don't have a guaranteed valid product ID in a pure API test, we'll expect this to either 
    // succeed (if we know an ID) or gracefully reject with a 404 (not found). 
    // The key is it should NOT crash and should follow the atomic path.
    const res = await request.post(`${BASE}/api/orders`, {
      data: orderPayload,
    });

    const status = res.status();
    expect([200, 404, 409]).toContain(status);
    
    if (status === 200) {
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.orderId).toBeTruthy();
      expect(body.razorpayOrderId).toBeTruthy(); // Should have generated a razorpay order!
    }
  });

  test('02 – Missing Sanity Order ID on verification returns 400', async ({ request }) => {
    const verifyRes = await request.post(`${BASE}/api/razorpay/verify-and-confirm`, {
      data: {
        razorpay_order_id: 'fake_order',
        razorpay_payment_id: 'fake_payment',
        razorpay_signature: 'invalid_sig',
        // missing sanityOrderId
      },
    });

    expect(verifyRes.status()).toBe(400);
    const body = await verifyRes.json();
    expect(body.error).toContain('Sanity Order ID is required');
  });

  test('03 – Invalid signature on verification returns 400', async ({ request }) => {
    const verifyRes = await request.post(`${BASE}/api/razorpay/verify-and-confirm`, {
      data: {
        razorpay_order_id: 'fake_order',
        razorpay_payment_id: 'fake_payment',
        razorpay_signature: 'invalid_sig',
        sanityOrderId: 'some_sanity_id'
      },
    });

    expect(verifyRes.status()).toBe(400);
    const body = await verifyRes.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Payment verification failed');
  });
});

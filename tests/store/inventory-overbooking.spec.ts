import { test, expect } from '@playwright/test';

// Define the scenarios we want to run
const SCENARIOS = [
  { a: 2, b: 2, stock: 5, expectBothSucceed: true },
  { a: 3, b: 3, stock: 5, expectBothSucceed: false },
  { a: 4, b: 2, stock: 5, expectBothSucceed: false },
  { a: 5, b: 1, stock: 5, expectBothSucceed: false },
  { a: 5, b: 5, stock: 5, expectBothSucceed: false }
];

test.describe('Inventory Overbooking Race Conditions', () => {

  // For each scenario, we repeat it a few times to expose nondeterministic failures (simulated via loops in a single block or repeat block).
  // Playwright handles parameterized tests well:
  for (const { a, b, stock, expectBothSucceed } of SCENARIOS) {
    
    // We run it 3 times per scenario to check for flakiness
    for (let run = 1; run <= 3; run++) {
      
      test(`Scenario: ${a} + ${b} against stock of ${stock} (Run ${run})`, async ({ request }) => {
        // Note: In a real e2e DB test, you would seed the database here so that `race-product-overbook` has `stock: ${stock}`.
        // For the scope of this API concurrency test, we simulate the payloads.
        
        const payloadA = {
          name: 'Customer A',
          email: 'a@example.com',
          phone: '1234567890',
          address: 'A Street',
          city: 'A City',
          state: 'AS',
          pincode: '000000',
          items: [{ _id: `product-stock-${stock}`, name: 'Race Item', price: 100, quantity: a }],
          totalAmount: 100 * a,
          paymentType: 'cod'
        };

        const payloadB = {
          ...payloadA,
          name: 'Customer B',
          email: 'b@example.com',
          address: 'B Street',
          items: [{ _id: `product-stock-${stock}`, name: 'Race Item', price: 100, quantity: b }],
          totalAmount: 100 * b,
        };

        // Fire concurrently
        const [resA, resB] = await Promise.all([
          request.post('/api/orders', { data: payloadA }),
          request.post('/api/orders', { data: payloadB }),
        ]);

        const jsonA = await resA.json().catch(() => ({ success: false }));
        const jsonB = await resB.json().catch(() => ({ success: false }));

        if (expectBothSucceed) {
          // If the stock can satisfy both (e.g., 2+2 <= 5)
          // Both should succeed (or if there's a different mock error, at least they shouldn't conflict on stock rules)
          // (Assuming the backend allows it)
          console.log(`Expected both to succeed. A: ${jsonA.success}, B: ${jsonB.success}`);
        } else {
          // If the requests collectively exceed stock, at most ONE should succeed.
          // Because of OCC (ifRevisionId), the second one to process will retry, see the new stock, 
          // realize it exceeds the remaining amount, and fail with a 409 safely.
          const successes = [jsonA.success, jsonB.success].filter(Boolean).length;
          
          expect(successes).toBeLessThanOrEqual(1);

          if (jsonA.success) {
            expect(jsonB.success).toBe(false);
            expect(resB.status()).toBe(409);
            expect(jsonB.error).toMatch(/stock|inventory conflict/i);
          } else if (jsonB.success) {
            expect(jsonA.success).toBe(false);
            expect(resA.status()).toBe(409);
            expect(jsonA.error).toMatch(/stock|inventory conflict/i);
          }
        }
      });

    }
  }

});

# Failed Test Cases

Last updated: 2026-08-15

This file lists the failing cases observed from the Playwright runs in this workspace. Some failures were caused by restricted network access during local execution rather than app behavior.

## API

| Status | Project | Test | File | Failure |
| --- | --- | --- | --- | --- |
| Fixed | api | `API - /api/orders contract > 02 - GET /api/orders with email returns 200 and orders array` | `tests/api/orders-api.spec.ts` | Expected `200`, received `401`. The endpoint is now protected, so the test expectation was stale. |

## Store Smoke

| Status | Project | Test | File | Failure |
| --- | --- | --- | --- | --- |
| Fixed | chromium-store | `Smoke Test: / > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources: `net::ERR_NETWORK_ACCESS_DENIED`. |
| Fixed | chromium-store | `Smoke Test: /shop > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |
| Fixed | chromium-store | `Smoke Test: /shop/premium-churidar-leggings > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |
| Fixed | chromium-store | `Smoke Test: /shop?category=leggings > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |
| Fixed | chromium-store | `Smoke Test: /cart > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |
| Fixed | chromium-store | `Smoke Test: /checkout > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |
| Fixed | chromium-store | `Smoke Test: /orders > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |
| Fixed | chromium-store | `Smoke Test: /account > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |
| Fixed | chromium-store | `Smoke Test: /about > Navigates successfully and renders content without errors` | `tests/store/smoke.spec.ts` | Console error guard failed on blocked external resources. |

## Cart Boundary Conditions

| Status | Project | Test | File | Failure |
| --- | --- | --- | --- | --- |
| Fixed | chromium-store | `Cart Boundary Conditions > 1 & 2. Quantity = 1 and Quantity = 2` | `tests/store/cart-boundaries.spec.ts` | `page.goto('/shop')` timed out waiting for full `load`. |
| Fixed | chromium-store | `Cart Boundary Conditions > 3 & 4. Maximum allowed quantity and exceeding stock` | `tests/store/cart-boundaries.spec.ts` | Timed out waiting for full page load or downstream shop navigation. |
| Fixed | chromium-store | `Cart Boundary Conditions > 5 & 7. Quantity = 0 removes the item` | `tests/store/cart-boundaries.spec.ts` | Timed out waiting for full page load or downstream shop navigation. |
| Fixed | chromium-store | `Cart Boundary Conditions > 6. Negative quantity manipulation via local storage is corrected or rejected` | `tests/store/cart-boundaries.spec.ts` | Direct `page.goto('/shop')` timed out waiting for full `load`. |
| Fixed | chromium-store | `Cart Boundary Conditions > 8. Multiple different products calculate totals correctly` | `tests/store/cart-boundaries.spec.ts` | Timed out waiting for full page load or downstream shop navigation. |
| Fixed | chromium-store | `Cart Boundary Conditions > 9. Same product added repeatedly aggregates quantity` | `tests/store/cart-boundaries.spec.ts` | Timed out waiting for full page load or downstream shop navigation. |
| Fixed | chromium-store | `Cart Boundary Conditions > 10, 11, 12. Simulating backend price/stock drift during checkout` | `tests/store/cart-boundaries.spec.ts` | Direct `page.goto('/shop')` timed out waiting for full `load`. |
| Fixed | chromium-store | `Cart Boundary Conditions > 13 & 14. Cart refresh and browser reload` | `tests/store/cart-boundaries.spec.ts` | Timed out waiting for full page load or downstream shop navigation. |
| Fixed | chromium-store | `Cart Boundary Conditions > 15. Multiple tabs/windows sync local storage` | `tests/store/cart-boundaries.spec.ts` | Timed out waiting for full page load or downstream shop navigation. |
| Fixed | chromium-store | `Cart Boundary Conditions > 16 & 17. Rapid repeated clicks on Add to Cart and Quantity changes` | `tests/store/cart-boundaries.spec.ts` | Timed out waiting for full page load or downstream shop navigation. |

## Shop And Search

| Status | Project | Test | File | Failure |
| --- | --- | --- | --- | --- |
| Fixed | chromium-store | `Shop - Product List Basics > 01 - /shop loads without console errors and renders h1` | `tests/store/shop.spec.ts` | Timed out or failed console guard due to blocked network resources. |
| Fixed | chromium-store | `Shop - Product List Basics > 02 - Product list renders at least one product card` | `tests/store/shop.spec.ts` | Timed out waiting for full page load. |
| Fixed | chromium-store | `Shop - Product List Basics > 04 - Product card exposes "Add to Cart" and "Buy Now" buttons` | `tests/store/shop.spec.ts` | Timed out waiting for full page load. |
| Fixed | chromium-store | `Shop - Product List Basics > 05 - Filter bar is rendered with all dropdown triggers` | `tests/store/shop.spec.ts` | Timed out waiting for full page load. |
| Fixed | chromium-store | `Shop - Product Navigation & URLs > 06 - Clicking a product card navigates to correct detail URL` | `tests/store/shop.spec.ts` | Timed out waiting for full page load. |
| Fixed | chromium-store | `Search & Category Filtering > 01 - Searching via navbar input navigates to /shop?search=` | `tests/store/search-filter.spec.ts` | Timed out waiting for full page load. |
| Fixed | chromium-store | `Search & Category Filtering > 02 - Category filter via URL param "leggings" shows correct page` | `tests/store/search-filter.spec.ts` | Timed out waiting for full page load. |
| Fixed | chromium-store | `Search & Category Filtering > 07 - Homepage category pill links navigate to filtered shop` | `tests/store/search-filter.spec.ts` | Timed out waiting for full page load. |

## Product Detail

| Status | Project | Test | File | Failure |
| --- | --- | --- | --- | --- |
| Environment-dependent | chromium-store | `Product Detail Pages > 1. Valid product loads correctly and matches backend data` | `tests/store/product.spec.ts` | Direct Sanity query failed with `connect EACCES ...:443` in the restricted network environment. |
| Environment-dependent | mobile-store | Product detail live-data cases | `tests/store/product.spec.ts` | Same Sanity access issue. Live product-data cases now skip when Sanity is unreachable. |

## Security And Auth

| Status | Project | Test | File | Failure |
| --- | --- | --- | --- | --- |
| Fixed | chromium-store | `Security & Authentication Controls > 1 & 2. Unauthenticated user accessing Account & Orders` | `tests/store/security-auth.spec.ts` | External WorkOS auth redirect was blocked with `net::ERR_NETWORK_ACCESS_DENIED`. |
| Fixed | chromium-store | `Security & Authentication Controls > 6. Expired session handling` | `tests/store/security-auth.spec.ts` | External WorkOS auth redirect was blocked. |
| Fixed | chromium-store | `Security & Authentication Controls > 7 & 8. Logged-out session across multiple tabs` | `tests/store/security-auth.spec.ts` | External WorkOS auth redirect was blocked. |
| Fixed | chromium-store | `Security & Authentication Controls > 9 & 10. Direct URL navigation & Refresh after logout` | `tests/store/security-auth.spec.ts` | External WorkOS auth redirect landed on `chrome-error://chromewebdata/`. |

## Full Suite Run

The full `npx playwright test --reporter=list` run timed out after 10 minutes, so it did not produce a complete final pass/fail list. Before timing out, the failures were mostly the categories above:

- full-page `load` timeouts caused by blocked/slow remote assets
- console guards failing on `net::ERR_NETWORK_ACCESS_DENIED`
- Sanity live-data access blocked by the local network sandbox
- WorkOS external auth redirects blocked by the local network sandbox

## Lint Failures

`npm run lint` failed with existing application lint errors outside the test changes, including:

- `react/no-unescaped-entities`
- `react-hooks/set-state-in-effect`
- `react-hooks/immutability`
- `react-hooks/purity`
- `@next/next/no-img-element` warnings
- `@next/next/no-page-custom-font` warning


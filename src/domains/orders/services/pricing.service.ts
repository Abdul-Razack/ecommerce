import { writeClient } from '@/shared/lib/sanity';
import type { CartLine } from '@/domains/coupons/lib/discount';

/**
 * Server-authoritative cart pricing.
 *
 * The browser sends only what it knows (product id, quantity, chosen colour and
 * size). Every rupee figure is resolved here from Sanity, so a tampered
 * `price` in the request body can never influence what the customer is charged.
 *
 * Variant price resolution mirrors `ProductDetails.tsx`: a variant matches on
 * both colour and size, and falls back to the base product price when the
 * variant has no price override.
 */
export const pricingService = {
  /**
   * Re-prices a client supplied cart against live Sanity data.
   *
   * Returns the normalised lines plus the ids that no longer exist, so callers
   * can fail loudly rather than silently charging for the wrong thing.
   */
  async repriceCart(items: any[]): Promise<{ lines: CartLine[]; missingIds: string[] }> {
    const requested = (items || []).filter((i) => i && i._id);
    if (requested.length === 0) return { lines: [], missingIds: [] };

    const ids = [...new Set(requested.map((i) => i._id))];
    const products = await writeClient.fetch(`
      *[_id in $ids] {
        _id,
        name,
        price,
        "categoryId": category->_id,
        "category": category->name,
        variants[] { color, size, price }
      }
    `, { ids });

    const byId = new Map(products.map((p: any) => [p._id, p]));
    const lines: CartLine[] = [];
    const missingIds: string[] = [];

    for (const item of requested) {
      const product: any = byId.get(item._id);
      if (!product) {
        missingIds.push(item._id);
        continue;
      }

      const color = item.color || null;
      const size = item.size || null;
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

      const variant = (product.variants || []).find(
        (v: any) =>
          v.color === color &&
          v.size === size
      );

      lines.push({
        _id: product._id,
        name: product.name,
        price: Number(variant?.price) || Number(product.price) || 0,
        quantity,
        color,
        size,
        category: product.category || null,
        categoryId: product.categoryId || null,
      });
    }

    return { lines, missingIds };
  },

  /**
   * Full product records for a set of ids, used to price free-gift lines whose
   * Sanity document is referenced by the coupon rather than the cart.
   */
  async getProductsByIds(ids: string[]) {
    const clean = (ids || []).filter(Boolean);
    if (clean.length === 0) return [];

    return await writeClient.fetch(`
      *[_id in $ids] {
        _id,
        name,
        price,
        stock,
        "categoryId": category->_id,
        "category": category->name
      }
    `, { ids: clean });
  },
};

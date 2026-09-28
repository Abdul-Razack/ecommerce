import { client, writeClient } from '@/shared/lib/sanity';
import { normalizeCode } from '../lib/discount';

/**
 * Fields an anonymous storefront visitor is allowed to see. Deliberately omits
 * redemption counters, validity windows and internal scoping references so a
 * customer cannot enumerate limits by probing the API.
 */
const PUBLIC_COUPON_FIELDS = `
  _id,
  code,
  description,
  type,
  value,
  maxDiscount,
  buyQuantity,
  getQuantity,
  minOrderValue,
  minQuantity,
  "giftProductId": giftProduct->_ref,
  "giftProductName": giftProduct->name,
  "targetCategoryId": targetCategory->_ref,
  "targetCategoryName": targetCategory->name,
  "targetProductId": targetProduct->_ref,
  "targetProductName": targetProduct->name,
  targetSize,
  targetColor,
  isAutoApply
`;

/**
 * GROQ predicate for "genuinely redeemable right now".
 *
 * Mirrors `isCouponLive` so a code is filtered identically whether the check
 * happens in the query or in the engine. The validity window and redemption
 * counters are filtered *here* rather than projected and re-checked in JS
 * because `PUBLIC_COUPON_FIELDS` omits them on purpose: a visitor still cannot
 * probe a code for its limits by reading the promo tray response.
 *
 * `usageLimit <= 0` means unlimited, matching the engine's own check.
 */
const LIVE_COUPON_FILTER = `
  isActive == true
  && (!defined(validFrom) || dateTime(validFrom) <= now())
  && (!defined(validUntil) || dateTime(validUntil) >= now())
  && (!defined(usageLimit) || usageLimit <= 0 || usageCount < usageLimit)
`;

/**
 * Full projection used by the admin dashboard and the order route.
 */
const ADMIN_COUPON_FIELDS = `
  _id,
  code,
  title,
  description,
  type,
  value,
  maxDiscount,
  buyQuantity,
  getQuantity,
  "giftProductId": giftProduct->_ref,
  "giftProductName": giftProduct->name,
  "targetCategoryId": targetCategory->_ref,
  "targetCategoryName": targetCategory->name,
  "targetProductId": targetProduct->_ref,
  "targetProductName": targetProduct->name,
  targetSize,
  targetColor,
  minOrderValue,
  minQuantity,
  isFirstOrderOnly,
  isActive,
  isAutoApply,
  isStackable,
  showOnProductPage,
  validFrom,
  validUntil,
  usageLimit,
  usageCount,
  perUserLimit,
  _createdAt,
  _updatedAt
`;

/**
 * Builds the Sanity reference fragment a field expects, or null to clear it.
 */
const ref = (id?: string | null) => (id ? { _type: 'reference', _ref: id } : null);

/**
 * Maps the flattened GROQ projection onto the `CouponDoc` shape the discount
 * engine expects. Keeping this in one place stops the engine from ever having
 * to know about query aliasing.
 */
export function toCouponDoc(row: any): any {
  if (!row) return null;
  return {
    ...row,
    giftProduct: row.giftProductId
      ? { _ref: row.giftProductId, name: row.giftProductName }
      : null,
    targetCategory: row.targetCategoryId
      ? { _ref: row.targetCategoryId, name: row.targetCategoryName }
      : null,
    targetProduct: row.targetProductId
      ? { _ref: row.targetProductId, name: row.targetProductName }
      : null,
  };
}

export const couponService = {
  /**
   * Only the coupons flagged for display on product detail pages, and only
   * while they can still actually be redeemed.
   *
   * The promo tray is marketing copy as much as it is a lookup, so advertising
   * a lapsed or exhausted code is worse than showing nothing: the customer only
   * discovers the problem after typing it in at checkout.
   */
  async getProductPageCoupons() {
    const rows = await client.fetch(`
      *[_type == "coupon" && showOnProductPage == true && ${LIVE_COUPON_FILTER}] | order(_createdAt desc) {
        ${PUBLIC_COUPON_FIELDS}
      }
    `);
    return rows.map(toCouponDoc);
  },

  /**
   * Full coupon list for the admin dashboard.
   */
  async getAllCoupons() {
    return await writeClient.fetch(`
      *[_type == "coupon"] | order(_createdAt desc) {
        ${ADMIN_COUPON_FIELDS}
      }
    `);
  },

  /**
   * Authoritative lookup by code. Always uses the write client so a paused or
   * deleted coupon is never served from a stale read replica during checkout.
   */
  async getCouponByCode(code: string) {
    const normalized = normalizeCode(code);
    if (!normalized) return null;

    const row = await writeClient.fetch(`
      *[_type == "coupon" && code == $code][0] {
        ${ADMIN_COUPON_FIELDS}
      }
    `, { code: normalized });

    return toCouponDoc(row);
  },

  /**
   * True when another coupon already owns this code, so the admin form can
   * reject duplicates before attempting a create.
   */
  async codeExists(code: string, exceptId?: string) {
    const normalized = normalizeCode(code);
    if (!normalized) return false;

    const match = await writeClient.fetch(
      `count(*[_type == "coupon" && code == $code && _id != $exceptId]) > 0`,
      { code: normalized, exceptId: exceptId || '' }
    );
    return Boolean(match);
  },

  /**
   * How many times a given customer has already redeemed a code.
   */
  async getCustomerRedemptions(code: string, email?: string | null) {
    if (!email) return 0;
    const normalized = normalizeCode(code);

    const count = await writeClient.fetch(
      `count(*[_type == "order" && couponCode == $code && customer.email == $email])`,
      { code: normalized, email }
    );
    return Number(count) || 0;
  },

  /**
   * Drives the first-order-only gate. Customers without an email (guest
   * checkout) are treated as first order so the coupon is not silently blocked.
   */
  async hasPreviousOrder(email?: string | null) {
    if (!email) return false;

    const count = await writeClient.fetch(
      `count(*[_type == "order" && customer.email == $email]) > 0`,
      { email }
    );
    return Boolean(count);
  },

  /**
   * Auto-apply candidates, already hydrated for the discount engine.
   *
   * Uses the full admin projection rather than the public one: this is a
   * server-side code path and the engine needs the validity window, active flag
   * and redemption counters to decide whether the coupon is actually live. The
   * caller evaluates each candidate and keeps the best result, since which
   * coupon wins depends entirely on what is in the basket.
   */
  async getAutoApplyCoupons() {
    const rows = await writeClient.fetch(`
      *[_type == "coupon" && isAutoApply == true && ${LIVE_COUPON_FILTER}] {
        ${ADMIN_COUPON_FIELDS}
      }
    `);
    return rows.map(toCouponDoc);
  },

  /**
   * Create a coupon document.
   */
  async createCoupon(input: any) {
    const doc: any = {
      _type: 'coupon',
      code: normalizeCode(input.code),
      title: input.title || null,
      description: input.description || null,
      type: input.type,
      value: input.value ?? null,
      maxDiscount: input.maxDiscount || null,
      buyQuantity: input.buyQuantity || null,
      getQuantity: input.getQuantity || null,
      giftProduct: ref(input.giftProductId),
      targetCategory: ref(input.targetCategoryId),
      targetProduct: ref(input.targetProductId),
      targetSize: input.targetSize || null,
      targetColor: input.targetColor || null,
      minOrderValue: input.minOrderValue || 0,
      minQuantity: input.minQuantity || 0,
      isFirstOrderOnly: Boolean(input.isFirstOrderOnly),
      isActive: input.isActive !== false,
      isAutoApply: Boolean(input.isAutoApply),
      isStackable: Boolean(input.isStackable),
      showOnProductPage: input.showOnProductPage !== false,
      validFrom: input.validFrom || null,
      validUntil: input.validUntil || null,
      usageLimit: input.usageLimit || null,
      perUserLimit: input.perUserLimit || null,
      usageCount: 0,
    };

    return await writeClient.create(doc);
  },

  /**
   * Update a coupon in place. The document _id is never touched.
   */
  async updateCoupon(id: string, input: any) {
    const patch: any = {
      code: normalizeCode(input.code),
      title: input.title || null,
      description: input.description || null,
      type: input.type,
      value: input.value ?? null,
      maxDiscount: input.maxDiscount || null,
      buyQuantity: input.buyQuantity || null,
      getQuantity: input.getQuantity || null,
      'giftProduct': ref(input.giftProductId),
      'targetCategory': ref(input.targetCategoryId),
      'targetProduct': ref(input.targetProductId),
      targetSize: input.targetSize || null,
      targetColor: input.targetColor || null,
      minOrderValue: input.minOrderValue || 0,
      minQuantity: input.minQuantity || 0,
      isFirstOrderOnly: Boolean(input.isFirstOrderOnly),
      isActive: input.isActive !== false,
      isAutoApply: Boolean(input.isAutoApply),
      isStackable: Boolean(input.isStackable),
      showOnProductPage: input.showOnProductPage !== false,
      validFrom: input.validFrom || null,
      validUntil: input.validUntil || null,
      usageLimit: input.usageLimit || null,
      perUserLimit: input.perUserLimit || null,
    };

    return await writeClient.patch(id).set(patch).commit();
  },

  /**
   * Bumps the redemption counter after an order is successfully created.
   * Failures here must never fail the order itself.
   */
  async incrementUsage(id: string) {
    try {
      return await writeClient.patch(id).inc({ usageCount: 1 }).commit();
    } catch (error) {
      console.error('Failed to increment coupon usage for', id, error);
      return null;
    }
  },

  /**
   * Delete a coupon. Existing orders keep their denormalised couponCode,
   * couponType and discountAmount snapshots, so order history is unaffected.
   */
  async deleteCoupon(id: string) {
    return await writeClient.delete(id);
  },
};

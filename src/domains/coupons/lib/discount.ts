/**
 * Coupon Discount Engine
 *
 * Pure, dependency-free discount maths shared by the storefront (optimistic
 * preview) and the order route (authoritative verification). Both sides import
 * this same module so a discount can never be computed two different ways.
 *
 * Every amount in this file is in INR base currency. The storefront converts to
 * the display currency at render time via `useCurrency().convertPrice`.
 */

export const COUPON_TYPES = [
  "flat",
  "percentage",
  "flatPerItem",
  "buyXgetY",
  "freeGift",
  "freeShipping",
] as const;

export type CouponType = (typeof COUPON_TYPES)[number];

/** Free delivery threshold in INR, matching the existing cart/checkout rule. */
export const FREE_DELIVERY_THRESHOLD = 999;

/** Flat delivery fee in INR charged below the free delivery threshold. */
export const DELIVERY_FEE = 50;

/** Flat cash-on-delivery handling fee in INR. */
export const COD_FEE = 50;

export interface CartLine {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string | null;
  size?: string | null;
  category?: string | null;
  categoryId?: string | null;
  imageUrl?: string | null;
}

export interface CouponDoc {
  _id?: string;
  code: string;
  type: CouponType | string;
  value?: number | null;
  maxDiscount?: number | null;
  buyQuantity?: number | null;
  getQuantity?: number | null;
  giftProduct?: { _ref?: string; name?: string; price?: number } | null;
  targetCategory?: { _ref?: string; name?: string } | null;
  targetProduct?: { _ref?: string; name?: string } | null;
  targetSize?: string | null;
  targetColor?: string | null;
  minOrderValue?: number | null;
  minQuantity?: number | null;
  isFirstOrderOnly?: boolean | null;
  isActive?: boolean | null;
  validFrom?: string | null;
  validUntil?: string | null;
  usageLimit?: number | null;
  usageCount?: number | null;
  perUserLimit?: number | null;
}

export interface EvaluationContext {
  /** True when the customer has no prior orders. */
  isFirstOrder?: boolean;
  /** How many times this customer has already redeemed the code. */
  customerRedemptions?: number;
  /** Injection point for deterministic testing. */
  now?: Date;
}

export interface DiscountResult {
  valid: boolean;
  /** Customer-facing reason the coupon was rejected. */
  reason?: string;
  /** Rupee value removed from the items subtotal. */
  discount: number;
  /** Clears the delivery fee entirely. */
  freeShipping: boolean;
  /** Zero-cost lines added by a freeGift coupon. */
  giftItems: CartLine[];
  /** Lines the discount was applied against, for UI highlighting. */
  affectedLineIds: string[];
  /** lineId -> count of units made free by a buyXgetY coupon. */
  freeUnitsByLine: Record<string, number>;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  codCharge: number;
  total: number;
  giftItems: CartLine[];
  freeShipping: boolean;
  freeUnitsByLine: Record<string, number>;
  affectedLineIds: string[];
  coupon: CouponDoc | null;
  discountReason: string | null;
}

const round2 = (n: number) => Math.round((Number.isFinite(n) ? n : 0) + Number.EPSILON) * 100 / 100;
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : 0);

const reject = (reason: string): DiscountResult => ({
  valid: false,
  reason,
  discount: 0,
  freeShipping: false,
  giftItems: [],
  affectedLineIds: [],
  freeUnitsByLine: {},
});

/**
 * Normalises user input into the canonical uppercase code format.
 */
export function normalizeCode(input: string): string {
  return (input || "").trim().toUpperCase();
}

/**
 * Checks the parts of a coupon that have nothing to do with the cart:
 * active flag, validity window and redemption limits.
 */
export function isCouponLive(coupon: CouponDoc, ctx: EvaluationContext = {}): { ok: boolean; reason?: string } {
  if (!coupon) return { ok: false, reason: "Coupon not found" };
  if (coupon.isActive === false) return { ok: false, reason: "This promo code is no longer active" };

  const now = ctx.now || new Date();

  if (coupon.validFrom && new Date(coupon.validFrom) > now) {
    return { ok: false, reason: "This promo code is not active yet" };
  }
  if (coupon.validUntil && new Date(coupon.validUntil) < now) {
    return { ok: false, reason: "This promo code has expired" };
  }

  const limit = num(coupon.usageLimit);
  if (limit > 0 && num(coupon.usageCount) >= limit) {
    return { ok: false, reason: "This promo code has reached its redemption limit" };
  }

  const perUser = num(coupon.perUserLimit);
  if (perUser > 0 && num(ctx.customerRedemptions) >= perUser) {
    return { ok: false, reason: "You have already used this promo code" };
  }

  return { ok: true };
}

/**
 * Filters cart lines down to the ones the coupon is allowed to touch.
 * An empty `targetProduct` / `targetCategory` means "every line".
 */
export function getEligibleLines(coupon: CouponDoc, lines: CartLine[]): CartLine[] {
  const productRef = coupon.targetProduct?._ref;
  const categoryRef = coupon.targetCategory?._ref;
  const size = (coupon.targetSize || "").trim().toLowerCase();
  const color = (coupon.targetColor || "").trim().toLowerCase();

  return lines.filter((line) => {
    if (productRef && line._id !== productRef) return false;
    if (categoryRef && line.categoryId !== categoryRef) return false;
    if (size && (line.size || "").trim().toLowerCase() !== size) return false;
    if (color && (line.color || "").trim().toLowerCase() !== color) return false;
    return true;
  });
}

const lineTotal = (line: CartLine) => round2(num(line.price) * num(line.quantity));
const lineUnits = (line: CartLine) => Math.max(0, Math.floor(num(line.quantity)));
const sumLines = (lines: CartLine[]) => round2(lines.reduce((acc, l) => acc + lineTotal(l), 0));
const sumUnits = (lines: CartLine[]) => lines.reduce((acc, l) => acc + lineUnits(l), 0);

/**
 * Applies a buyXgetY coupon by walking units cheapest-first, so the customer
 * always gets the most expensive possible set free.
 */
function allocateFreeUnits(eligible: CartLine[], freeUnits: number) {
  const freeUnitsByLine: Record<string, number> = {};
  let remaining = freeUnits;

  const byPriceAsc = [...eligible].sort((a, b) => num(a.price) - num(b.price));
  for (const line of byPriceAsc) {
    if (remaining <= 0) break;
    const take = Math.min(lineUnits(line), remaining);
    if (take > 0) {
      freeUnitsByLine[line._id] = take;
      remaining -= take;
    }
  }

  return freeUnitsByLine;
}

/**
 * Evaluates a single coupon against a cart.
 *
 * This never throws: an unusable coupon comes back as `{ valid: false, reason }`
 * so callers can render the reason instead of handling an exception.
 */
export function evaluateCoupon(
  coupon: CouponDoc,
  lines: CartLine[],
  ctx: EvaluationContext = {}
): DiscountResult {
  const live = isCouponLive(coupon, ctx);
  if (!live.ok) return reject(live.reason!);

  if (!Array.isArray(lines) || lines.length === 0) {
    return reject("Add something to your cart before applying a promo code");
  }

  if (!COUPON_TYPES.includes(coupon.type as CouponType)) {
    return reject("This promo code has an unsupported discount type");
  }

  const subtotal = sumLines(lines);
  const minOrderValue = num(coupon.minOrderValue);
  if (minOrderValue > 0 && subtotal < minOrderValue) {
    return reject(`Add ${formatInr(minOrderValue - subtotal)} more to use this code`);
  }

  if (coupon.isFirstOrderOnly && ctx.isFirstOrder === false) {
    return reject("This code is only valid on a customer's first order");
  }

  const eligible = getEligibleLines(coupon, lines);
  if (eligible.length === 0) {
    return reject(describeScope(coupon));
  }

  const eligibleSubtotal = sumLines(eligible);
  const eligibleUnits = sumUnits(eligible);
  const minQuantity = num(coupon.minQuantity);
  if (minQuantity > 0 && eligibleUnits < minQuantity) {
    return reject(`Add ${minQuantity - eligibleUnits} more eligible item(s) to use this code`);
  }

  const affectedLineIds = eligible.map((l) => l._id);
  const value = Math.max(0, num(coupon.value));
  const cap = num(coupon.maxDiscount);
  const applyCap = (n: number) => (cap > 0 ? Math.min(n, cap) : n);

  switch (coupon.type as CouponType) {
    case "flat": {
      if (value <= 0) return reject("This promo code has no discount value set");
      return {
        valid: true,
        discount: round2(Math.min(value, eligibleSubtotal)),
        freeShipping: false,
        giftItems: [],
        affectedLineIds,
        freeUnitsByLine: {},
      };
    }

    case "percentage": {
      if (value <= 0) return reject("This promo code has no discount value set");
      const pct = clamp(value, 0, 100);
      const raw = (eligibleSubtotal * pct) / 100;
      return {
        valid: true,
        discount: round2(Math.min(applyCap(raw), eligibleSubtotal)),
        freeShipping: false,
        giftItems: [],
        affectedLineIds,
        freeUnitsByLine: {},
      };
    }

    case "flatPerItem": {
      if (value <= 0) return reject("This promo code has no discount value set");
      return {
        valid: true,
        discount: round2(Math.min(applyCap(value * eligibleUnits), eligibleSubtotal)),
        freeShipping: false,
        giftItems: [],
        affectedLineIds,
        freeUnitsByLine: {},
      };
    }

    case "buyXgetY": {
      const buy = Math.max(1, Math.floor(num(coupon.buyQuantity) || 1));
      const get = Math.max(0, Math.floor(num(coupon.getQuantity) || 0));
      if (get <= 0) return reject("This promo code has no free-quantity configured");

      const freeUnits = Math.floor(eligibleUnits / (buy + get)) * get;
      if (freeUnits <= 0) {
        return reject(`Add ${buy + get - eligibleUnits} more eligible item(s) to unlock this offer`);
      }

      const freeUnitsByLine = allocateFreeUnits(eligible, freeUnits);
      const discount = round2(
        Object.entries(freeUnitsByLine).reduce((acc, [lineId, units]) => {
          const line = eligible.find((l) => l._id === lineId);
          return acc + (line ? num(line.price) * units : 0);
        }, 0)
      );

      return {
        valid: true,
        discount: round2(Math.min(applyCap(discount), eligibleSubtotal)),
        freeShipping: false,
        giftItems: [],
        affectedLineIds,
        freeUnitsByLine,
      };
    }

    case "freeGift": {
      const gift = coupon.giftProduct;
      if (!gift?._ref) return reject("This gift promo is not configured yet");

      const giftLine: CartLine = {
        _id: gift._ref,
        name: gift.name || "Free Gift",
        price: 0,
        quantity: 1,
      };
      return {
        valid: true,
        discount: 0,
        freeShipping: false,
        giftItems: [giftLine],
        affectedLineIds,
        freeUnitsByLine: {},
      };
    }

    case "freeShipping":
      return {
        valid: true,
        discount: 0,
        freeShipping: true,
        giftItems: [],
        affectedLineIds,
        freeUnitsByLine: {},
      };

    default:
      return reject("This promo code has an unsupported discount type");
  }
}

/**
 * Single source of truth for order maths.
 *
 * Total = max(0, subtotal - discount) + delivery + codFee
 *
 * Free-delivery eligibility is judged on the *pre-discount* subtotal, matching
 * how major marketplaces qualify a cart. A coupon reduces what the customer
 * pays for their goods but does not revoke shipping they already earned, so a
 * coupon can never leave someone on the hook for a delivery fee their cart had
 * already qualified for. A `freeShipping` coupon waives the fee outright for
 * carts that never reached the threshold in the first place.
 */
export function calculateTotals(
  lines: CartLine[],
  applied: DiscountResult | null,
  opts: { paymentType?: string } = {}
): OrderTotals {
  const subtotal = sumLines(lines || []);
  const result: DiscountResult = applied || {
    valid: false,
    discount: 0,
    freeShipping: false,
    giftItems: [],
    affectedLineIds: [],
    freeUnitsByLine: {},
  };

  // Never let a discount exceed what was actually paid for.
  const discount = result.valid ? round2(clamp(result.discount, 0, subtotal)) : 0;
  const discountedSubtotal = round2(Math.max(0, subtotal - discount));

  let deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  if (result.valid && result.freeShipping) deliveryCharge = 0;

  const codCharge = opts.paymentType === "cod" ? COD_FEE : 0;

  return {
    subtotal,
    discount,
    deliveryCharge,
    codCharge,
    total: round2(discountedSubtotal + deliveryCharge + codCharge),
    giftItems: result.giftItems,
    freeShipping: result.valid && result.freeShipping,
    freeUnitsByLine: result.valid ? result.freeUnitsByLine : {},
    affectedLineIds: result.valid ? result.affectedLineIds : [],
    coupon: null,
    discountReason: result.valid ? null : result.reason || null,
  };
}

/**
 * Explains why a coupon found no matching cart items.
 */
function describeScope(coupon: CouponDoc): string {
  if (coupon.targetProduct?.name) return `This code is not valid for ${coupon.targetProduct.name}`;
  if (coupon.targetCategory?.name) return `This code is only valid on ${coupon.targetCategory.name}`;
  if (coupon.targetSize) return `This code is only valid for size ${coupon.targetSize}`;
  if (coupon.targetColor) return `This code is only valid for colour ${coupon.targetColor}`;
  return "This code is not valid for the items in your cart";
}

/**
 * Human readable offer summary, used by the promo tray and the admin list.
 */
export function describeCoupon(coupon: CouponDoc): string {
  const value = num(coupon.value);
  const cap = num(coupon.maxDiscount);

  switch (coupon.type) {
    case "flat":
      return `Flat ₹${value} off`;
    case "percentage":
      return cap > 0 ? `${value}% off, up to ₹${cap}` : `${value}% off`;
    case "flatPerItem":
      return `₹${value} off each eligible item`;
    case "buyXgetY":
      return `Buy ${num(coupon.buyQuantity) || 1} get ${num(coupon.getQuantity) || 1} free`;
    case "freeGift":
      return `Free gift${coupon.giftProduct?.name ? `: ${coupon.giftProduct.name}` : ""}`;
    case "freeShipping":
      return "Free delivery";
    default:
      return "Promo code";
  }
}

function formatInr(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

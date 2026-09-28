import { NextResponse } from 'next/server';
import { couponService } from '@/domains/coupons/services/coupon.service';
import { pricingService } from '@/domains/orders/services/pricing.service';
import {
  calculateTotals,
  evaluateCoupon,
  isCouponLive,
  normalizeCode,
} from '@/domains/coupons/lib/discount';

/**
 * Validates a promo code against the current cart and returns the resulting
 * totals.
 *
 * The cart is re-priced from Sanity before evaluation, so the number shown here
 * is the same number `POST /api/orders` will charge. This endpoint is a
 * preview: the order route repeats every one of these checks before trusting a
 * single rupee of it.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = normalizeCode(body?.code || '');
    const email = body?.email || null;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Enter a promo code' },
        { status: 400 }
      );
    }

    const { lines, missingIds } = await pricingService.repriceCart(body?.items || []);

    if (missingIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Some items are no longer available. Please review your cart.' },
        { status: 400 }
      );
    }

    const coupon = await couponService.getCouponByCode(code);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'This promo code is not valid' },
        { status: 404 }
      );
    }

    const [customerRedemptions, isFirstOrder] = await Promise.all([
      couponService.getCustomerRedemptions(code, email),
      couponService.hasPreviousOrder(email),
    ]);

    const result = evaluateCoupon(coupon, lines, { customerRedemptions, isFirstOrder });

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.reason || 'This promo code cannot be applied' },
        { status: 422 }
      );
    }

    const totals = calculateTotals(lines, result, { paymentType: body?.paymentType });

    return NextResponse.json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        description: coupon.description,
      },
      discount: totals.discount,
      freeShipping: totals.freeShipping,
      giftItems: totals.giftItems,
      freeUnitsByLine: totals.freeUnitsByLine,
      affectedLineIds: totals.affectedLineIds,
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        deliveryCharge: totals.deliveryCharge,
        codCharge: totals.codCharge,
        total: totals.total,
      },
    });
  } catch (error: any) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}

/**
 * Lets the storefront quietly apply the best auto-apply coupon without the
 * customer typing anything. Runs once when the checkout page loads an
 * unpromoted cart.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    const { lines } = await pricingService.repriceCart(
      searchParams.get('items') ? JSON.parse(searchParams.get('items') as string) : []
    );

    if (lines.length === 0) {
      return NextResponse.json({ success: true, coupon: null });
    }

    const isFirstOrder = await couponService.hasPreviousOrder(email);
    const candidates = await couponService.getAutoApplyCoupons();

    let best: { coupon: any; result: any } | null = null;
    for (const candidate of candidates) {
      const customerRedemptions = await couponService.getCustomerRedemptions(candidate.code, email);
      if (!isCouponLive(candidate, { isFirstOrder, customerRedemptions }).ok) continue;

      const result = evaluateCoupon(candidate, lines, { isFirstOrder, customerRedemptions });
      if (!result.valid) continue;

      if (!best || result.discount > best.result.discount) {
        best = { coupon: candidate, result };
      }
    }

    if (!best) return NextResponse.json({ success: true, coupon: null });

    return NextResponse.json({
      success: true,
      coupon: {
        _id: best.coupon._id,
        code: best.coupon.code,
        type: best.coupon.type,
        description: best.coupon.description,
      },
      discount: best.result.discount,
      freeShipping: best.result.freeShipping,
      giftItems: best.result.giftItems,
      freeUnitsByLine: best.result.freeUnitsByLine,
      affectedLineIds: best.result.affectedLineIds,
    });
  } catch (error: any) {
    console.error('Auto-apply coupon error:', error);
    return NextResponse.json({ success: true, coupon: null });
  }
}

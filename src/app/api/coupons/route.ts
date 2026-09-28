import { NextResponse } from 'next/server';
import { couponService } from '@/domains/coupons/services/coupon.service';
import { describeCoupon } from '@/domains/coupons/lib/discount';

export const revalidate = 0;

/**
 * Public promo tray feed. Returns only the marketing-safe projection so
 * redemption counters and internal scoping stay server-side.
 */
export async function GET() {
  try {
    const coupons = await couponService.getProductPageCoupons();

    return NextResponse.json({
      success: true,
      coupons: coupons.map((c) => ({
        _id: c._id,
        code: c.code,
        description: c.description || describeCoupon(c),
        scope: c.targetCategoryName || c.targetProductName || null,
        minOrderValue: c.minOrderValue || 0,
      })),
    });
  } catch (error: any) {
    console.error('Coupon fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

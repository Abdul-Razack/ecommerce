import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { writeClient } from '@/shared/lib/sanity';
import { couponService } from '@/domains/coupons/services/coupon.service';
import { COUPON_TYPES, normalizeCode } from '@/domains/coupons/lib/discount';

export const dynamic = 'force-dynamic';

/**
 * Rejects payloads the Sanity schema would otherwise accept but the discount
 * engine cannot make sense of. Catching these here keeps a misconfigured coupon
 * from silently failing at checkout for customers.
 */
function validatePayload(body: any) {
  const code = normalizeCode(body?.code || '');

  if (!code) return 'Promo code is required';
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) {
    return 'Promo code must be 3-24 characters using letters, numbers, dashes or underscores';
  }
  if (!COUPON_TYPES.includes(body?.type)) return 'Select a valid discount type';

  const value = Number(body.value);
  if (body.type === 'flat' || body.type === 'flatPerItem' || body.type === 'percentage') {
    if (!Number.isFinite(value) || value <= 0) return 'Enter a discount value greater than zero';
    if (body.type === 'percentage' && value > 100) return 'Percentage cannot exceed 100';
  }

  if (body.type === 'buyXgetY') {
    const buy = Math.floor(Number(body.buyQuantity));
    const get = Math.floor(Number(body.getQuantity));
    if (!Number.isFinite(buy) || buy < 1) return 'Buy quantity must be at least 1';
    if (!Number.isFinite(get) || get < 1) return 'Free quantity must be at least 1';
  }

  if (body.type === 'freeGift' && !body.giftProductId) {
    return 'Choose the product to give away for a free gift coupon';
  }

  if (body.targetCategoryId && body.targetProductId) {
    return 'Choose either a category or a specific product, not both';
  }

  if (body.minOrderValue && Number(body.minOrderValue) < 0) {
    return 'Minimum order value cannot be negative';
  }
  if (body.minQuantity && Number(body.minQuantity) < 0) {
    return 'Minimum quantity cannot be negative';
  }
  if (body.usageLimit && Number(body.usageLimit) < 0) {
    return 'Redemption limit cannot be negative';
  }

  if (body.validFrom && body.validUntil && new Date(body.validFrom) >= new Date(body.validUntil)) {
    return 'The valid-until date must come after the valid-from date';
  }

  return null;
}

/**
 * Confirms a referenced product or category actually exists, so the admin form
 * cannot persist a dangling reference that Sanity would later reject.
 */
async function referencesExist(body: any) {
  if (body.giftProductId) {
    const found = await writeClient.fetch(`count(*[_id == $id && _type == "product"]) > 0`, {
      id: body.giftProductId,
    });
    if (!found) return 'The selected gift product no longer exists';
  }
  if (body.targetProductId) {
    const found = await writeClient.fetch(`count(*[_id == $id && _type == "product"]) > 0`, {
      id: body.targetProductId,
    });
    if (!found) return 'The selected product no longer exists';
  }
  if (body.targetCategoryId) {
    const found = await writeClient.fetch(`count(*[_id == $id && _type == "category"]) > 0`, {
      id: body.targetCategoryId,
    });
    if (!found) return 'The selected category no longer exists';
  }
  return null;
}

// GET all coupons plus the products and categories needed by the form
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await couponService.getAllCoupons();

    const products = await writeClient.fetch(`
      *[_type == "product"] | order(name asc) {
        _id,
        name,
        price,
        stock,
        "categoryId": category->_ref,
        "categoryName": category->name
      }
    `);

    const categories = await writeClient.fetch(`
      *[_type == "category"] | order(name asc) { _id, name }
    `);

    return NextResponse.json({ success: true, coupons, products, categories });
  } catch (error: any) {
    console.error('Coupons fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST create coupon
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const invalid = validatePayload(body);
    if (invalid) {
      return NextResponse.json({ success: false, error: invalid }, { status: 400 });
    }

    if (await couponService.codeExists(body.code)) {
      return NextResponse.json(
        { success: false, error: 'That promo code is already in use' },
        { status: 409 }
      );
    }

    const badRef = await referencesExist(body);
    if (badRef) {
      return NextResponse.json({ success: false, error: badRef }, { status: 400 });
    }

    const coupon = await couponService.createCoupon(body);
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error('Coupon create error:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    );
  }
}

// PATCH update coupon
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { _id } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const existing = await writeClient.fetch(
      `*[_type == "coupon" && _id == $id][0]{ _id, usageCount }`,
      { id: _id }
    );
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }

    const invalid = validatePayload(body);
    if (invalid) {
      return NextResponse.json({ success: false, error: invalid }, { status: 400 });
    }

    if (await couponService.codeExists(body.code, _id)) {
      return NextResponse.json(
        { success: false, error: 'Another coupon already uses that code' },
        { status: 409 }
      );
    }

    const badRef = await referencesExist(body);
    if (badRef) {
      return NextResponse.json({ success: false, error: badRef }, { status: 400 });
    }

    const coupon = await couponService.updateCoupon(_id, body);
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    console.error('Coupon update error:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    );
  }
}

// DELETE coupon. Past orders keep a denormalised snapshot of the code and
// discount, so removing the coupon never rewrites order history.
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    await couponService.deleteCoupon(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Coupon delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Operation failed' },
      { status: 500 }
    );
  }
}

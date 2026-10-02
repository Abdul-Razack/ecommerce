import { NextResponse } from 'next/server';

/**
 * DEPRECATED: Standalone Razorpay order creation has been retired for security.
 * Razorpay orders are now created authoritatively via POST /api/orders after
 * server-side price recalculation from Sanity.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Direct Razorpay order creation is disabled. Please create orders via POST /api/orders.',
    },
    { status: 400 }
  );
}

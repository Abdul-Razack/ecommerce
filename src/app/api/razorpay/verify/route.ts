import { NextResponse } from 'next/server';

/**
 * DEPRECATED: Standalone Razorpay verification has been retired for security.
 * Payment verification and order confirmation are now handled together via
 * POST /api/razorpay/verify-and-confirm to prevent unlinked confirmations.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'Standalone payment verification is disabled. Please use POST /api/razorpay/verify-and-confirm.',
    },
    { status: 400 }
  );
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { writeClient } from '@/shared/lib/sanity';
import { withAuth } from '@workos-inc/authkit-nextjs';


// Verify Razorpay payment signature and confirm the order
export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sanityOrderId } = await request.json();

    if (!sanityOrderId) {
      return NextResponse.json({ success: false, error: 'Sanity Order ID is required' }, { status: 400 });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Incomplete payment payload' }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('RAZORPAY_KEY_SECRET is not configured');
      return NextResponse.json({ success: false, error: 'Payment gateway configuration error' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    // Constant-time HMAC comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const signatureBuf = Buffer.from(razorpay_signature, 'utf8');
    const isAuthentic =
      expectedBuf.length === signatureBuf.length &&
      crypto.timingSafeEqual(expectedBuf, signatureBuf);

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Fetch the order from Sanity
    const query = `*[_type == "order" && (orderId == $sanityOrderId || _id == $sanityOrderId)][0]{
      _id,
      "customerEmail": customer.email,
      razorpayOrderId,
      paymentStatus
    }`;
    const order = await writeClient.fetch(query, { sanityOrderId });
    
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Resolve optional authenticated user session
    let user = null;
    try {
      const authResult = await withAuth();
      user = authResult?.user || null;
    } catch {
      // Guest payment
    }

    // SECURITY: ensure the order belongs to the authenticated user if logged in
    if (user && order.customerEmail && order.customerEmail.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // SECURITY: ensure the payment was created specifically for this order
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        { success: false, error: 'Payment order ID does not match order record' },
        { status: 400 }
      );
    }

    // Idempotency: if already marked paid, return success without re-patching
    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
      });
    }

    // Update the order in Sanity
    await writeClient
      .patch(order._id)
      .set({
        paymentStatus: 'paid',
        status: 'confirmed',
        razorpayPaymentId: razorpay_payment_id,
      })
      .commit();

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification error' },
      { status: 500 }
    );
  }
}

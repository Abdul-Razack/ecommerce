import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { writeClient } from '@/shared/lib/sanity';

// Verify Razorpay payment signature and confirm the order
export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, sanityOrderId } = await request.json();

    if (!sanityOrderId) {
      return NextResponse.json({ success: false, error: 'Sanity Order ID is required' }, { status: 400 });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find the Sanity order by the custom orderId (not _id, unless orderId is _id)
      const query = `*[_type == "order" && orderId == $sanityOrderId][0]{_id}`;
      const order = await writeClient.fetch(query, { sanityOrderId });
      
      if (!order) {
        console.error('Order not found in Sanity for verification:', sanityOrderId);
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
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
    } else {
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification error' },
      { status: 500 }
    );
  }
}

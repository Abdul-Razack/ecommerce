import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { generateOrderId, razorpay } from '@/shared/lib/razorpay';
import { orderService } from '@/domains/orders/services/order.service';
import { checkoutService } from '@/domains/orders/services/checkout.service';
import { pricingService } from '@/domains/orders/services/pricing.service';
import { couponService } from '@/domains/coupons/services/coupon.service';
import {
  calculateTotals,
  evaluateCoupon,
  normalizeCode,
} from '@/domains/coupons/lib/discount';

// POST - Create a new order in Sanity
//
// Security model: the browser is never trusted for money. Client prices,
// totals, delivery fees and payment status are all discarded. Every figure is
// recomputed here from Sanity, and the coupon is re-fetched and re-evaluated
// even though the storefront already previewed it.
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      items,
      paymentType,
      razorpayOrderId,
      razorpayPaymentId,
      currency = 'INR',
      exchangeRate = 1,
    } = body;

    // 1. Re-price the cart from Sanity. Any client-supplied price is discarded.
    const { lines, missingIds } = await pricingService.repriceCart(items || []);

    if (missingIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Some items are no longer available. Please review your cart.' },
        { status: 400 }
      );
    }

    if (lines.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Your cart is empty' },
        { status: 400 }
      );
    }

    // 2. Independently verify the promo code.
    const code = normalizeCode(body.couponCode || '');
    let coupon = null;
    let discountResult = null;

    if (code) {
      coupon = await couponService.getCouponByCode(code);

      if (!coupon) {
        return NextResponse.json(
          { success: false, error: 'This promo code is not valid' },
          { status: 422 }
        );
      }

      const [customerRedemptions, isFirstOrder] = await Promise.all([
        couponService.getCustomerRedemptions(code, email),
        couponService.hasPreviousOrder(email),
      ]);

      discountResult = evaluateCoupon(coupon, lines, { customerRedemptions, isFirstOrder });

      if (!discountResult.valid) {
        return NextResponse.json(
          {
            success: false,
            error: discountResult.reason || 'This promo code cannot be applied',
          },
          { status: 422 }
        );
      }
    }

    // 3. Resolve free gift products so they can be reserved and displayed.
    const giftItems = [];
    if (discountResult?.giftItems?.length) {
      const giftIds = discountResult.giftItems.map((g) => g._id);
      const giftProducts = await pricingService.getProductsByIds(giftIds);
      const byId = new Map(giftProducts.map((p: any) => [p._id, p]));

      for (const gift of discountResult.giftItems) {
        const product: any = byId.get(gift._id);
        if (!product) {
          return NextResponse.json(
            { success: false, error: 'The free gift for this promo is no longer available' },
            { status: 422 }
          );
        }
        giftItems.push({
          _id: product._id,
          name: product.name,
          quantity: gift.quantity,
        });
      }
    }

    // 4. Authoritative totals.
    const totals = calculateTotals(lines, discountResult, { paymentType });
    const totalAmountINR = totals.total;
    const totalAmount = currency === 'INR' ? totalAmountINR : totalAmountINR * (exchangeRate || 1);

    const orderId = generateOrderId();

    let generatedRazorpayOrderId = null;
    let initialStatus = 'confirmed';
    // Never accept a client-declared payment status. Only the Razorpay
    // verification callback may mark an order paid.
    let initialPaymentStatus = 'pending';

    // If using Razorpay, generate the order token BEFORE reserving stock
    if (paymentType === 'razorpay') {
      const options = {
        amount: Math.round(totalAmountINR * 100), // paise
        currency: 'INR', // Razorpay expects INR for Indian accounts usually, but we use the mapped currency if needed
        receipt: orderId,
      };
      
      const rpOrder = await razorpay.orders.create(options);
      generatedRazorpayOrderId = rpOrder.id;
      initialStatus = 'pending';
    }

    // Prepare Sanity Order Document
    const orderDoc = {
      _type: 'order',
      orderId,
      customer: {
        name,
        email,
        phone,
      },
      shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
      items: lines.map((line, index) => ({
        _key: `item_${index}`,
        product: { _type: 'reference', _ref: line._id },
        name: line.name,
        price: line.price,
        quantity: line.quantity,
        color: line.color || null,
        size: line.size || null,
      })),
      // Verified financials
      subtotal: totals.subtotal,
      discountAmount: totals.discount,
      deliveryCharge: totals.deliveryCharge,
      totalAmount,
      currency,
      exchangeRate,
      totalAmountINR,
      // Denormalised coupon snapshot so order history survives coupon deletion
      ...(coupon && {
        couponCode: coupon.code,
        couponType: coupon.type,
        couponRef: { _type: 'reference', _ref: coupon._id },
      }),
      ...(giftItems.length > 0 && {
        giftItems: giftItems.map((gift, index) => ({
          _key: `gift_${index}`,
          product: { _type: 'reference', _ref: gift._id },
          name: gift.name,
          quantity: gift.quantity,
        })),
      }),
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      paymentType: paymentType || 'cod',
      razorpayOrderId: generatedRazorpayOrderId || razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      ...(body.customerId && {
        customerRef: {
          _type: 'reference',
          _ref: body.customerId
        }
      })
    };

    // Aggregate stock movements so a product that is both bought and gifted
    // only decrements once, by the combined quantity.
    const stockDeltas = new Map<string, number>();
    for (const line of lines) {
      stockDeltas.set(line._id, (stockDeltas.get(line._id) || 0) + line.quantity);
    }
    for (const gift of giftItems) {
      stockDeltas.set(gift._id, (stockDeltas.get(gift._id) || 0) + gift.quantity);
    }

    // Execute atomic transaction for inventory and order creation
    const checkoutResult = await checkoutService.processCheckoutTransaction(
      orderDoc,
      [...stockDeltas].map(([_id, quantity]) => ({ _id, quantity }))
    );

    if (!checkoutResult.success) {
      return NextResponse.json(
        { success: false, error: checkoutResult.error, details: checkoutResult.details },
        { status: checkoutResult.statusCode || 500 }
      );
    }

    // Record the redemption. Failures here must not fail a placed order.
    if (coupon?._id) {
      await couponService.incrementUsage(coupon._id);
    }

    // Save address to customer profile if requested
    if (body.saveAddress && body.customerId) {
      const { writeClient } = await import('@/shared/lib/sanity');
      const newAddress = {
        _key: crypto.randomUUID(),
        street: address,
        city: city,
        state: state,
        zipCode: pincode,
        country: 'India',
        isDefault: false
      };
      await writeClient.patch(body.customerId)
        .setIfMissing({ savedAddresses: [] })
        .append('savedAddresses', [newAddress])
        .commit();
    }

    return NextResponse.json({
      success: true,
      orderId,
      razorpayOrderId: generatedRazorpayOrderId,
      amount: totalAmountINR,
      discountAmount: totals.discount,
      couponCode: coupon?.code || null,
      message: 'Order created successfully via domain services',
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order: ' + (JSON.stringify(error)) },
      { status: 500 }
    );
  }
}

// GET - Fetch orders by email via Order Service
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Security Fix: Enforce authorization to prevent IDOR
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.email !== email) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access orders belonging to another user' },
        { status: 403 }
      );
    }

    const orders = await orderService.getOrdersByEmail(email);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

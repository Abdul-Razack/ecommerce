import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { generateOrderId, razorpay } from '@/shared/lib/razorpay';
import { orderService } from '@/domains/orders/services/order.service';
import { checkoutService } from '@/domains/orders/services/checkout.service';
import { pricingService } from '@/domains/orders/services/pricing.service';
import { couponService } from '@/domains/coupons/services/coupon.service';
import { syncCustomerToSanity } from '@/shared/lib/customerSync';
import { writeClient } from '@/shared/lib/sanity';
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
    // Check if there is an authenticated user session
    let user = null;
    let customer = null;
    try {
      const authResult = await withAuth();
      user = authResult?.user || null;
      if (user) {
        customer = await syncCustomerToSanity(user);
      }
    } catch {
      // Unauthenticated / guest checkout
    }

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
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required order details' },
        { status: 400 }
      );
    }

    // Use a fixed rate of 1 for INR; the actual MYR rate is fetched server-side
    // when storing for display. Financial calculations always use INR.
    const exchangeRate = 1;


    // 1. Re-price the cart from Sanity. Any client-supplied price is discarded.
    const { lines, missingIds } = await pricingService.repriceCart(items || []);

    if (missingIds.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Some items are no longer available. Please review your cart.', missingIds },
        { status: 404 }
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
      ...(customer?._id && {
        customerRef: {
          _type: 'reference',
          _ref: customer._id
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

    // Save address to customer profile if requested.
    if (body.saveAddress && customer?._id) {
      try {
        const newAddress = {
          _key: crypto.randomUUID(),
          street: address,
          city: city,
          state: state,
          zipCode: pincode,
          country: 'India',
          isDefault: false,
        };
        await writeClient
          .patch(customer._id)
          .setIfMissing({ savedAddresses: [] })
          .append('savedAddresses', [newAddress])
          .commit();
      } catch (addrErr) {
        // Address save failure must never fail the order
        console.error('Failed to save address to customer profile:', addrErr);
      }
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
      { success: false, error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}

// GET - Fetch orders or track specific order
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId')?.trim();
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!orderId && !email) {
      return NextResponse.json(
        { success: false, error: 'Email or Order ID is required' },
        { status: 400 }
      );
    }

    // Mode 1: Track a specific order by Order ID + Email (Public tracking for customers/guests)
    if (orderId && email) {
      const order = await orderService.getOrderByOrderIdAndEmail(orderId, email);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'No order found with the provided Order ID and email' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        order,
      });
    }

    // Mode 2: Fetch customer orders (Requires authenticated session)
    const { user } = await withAuth();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to view your complete order history' },
        { status: 401 }
      );
    }

    const queryEmail = email || user.email?.toLowerCase();
    if (user.email?.toLowerCase() !== queryEmail) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access orders belonging to another user' },
        { status: 403 }
      );
    }

    const orders = await orderService.getOrdersByEmail(queryEmail);

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

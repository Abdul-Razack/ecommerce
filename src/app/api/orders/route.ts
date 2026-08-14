import { NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { generateOrderId, razorpay } from '@/shared/lib/razorpay';
import { orderService } from '@/domains/orders/services/order.service';
import { checkoutService } from '@/domains/orders/services/checkout.service';
// POST - Create a new order in Sanity
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
      totalAmount,
      paymentType,
      paymentStatus,
      razorpayOrderId,
      razorpayPaymentId,
      currency = 'INR',
      exchangeRate = 1,
    } = body;

    const orderId = generateOrderId();
    const totalAmountINR = currency === 'INR' ? totalAmount : (exchangeRate > 0 ? totalAmount / exchangeRate : totalAmount);

    let generatedRazorpayOrderId = null;
    let initialStatus = 'confirmed';
    let initialPaymentStatus = paymentStatus || (paymentType === 'cod' ? 'pending' : 'pending');

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
      initialPaymentStatus = 'pending';
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
      items: items.map((item, index) => ({
        _key: `item_${index}`,
        product: { _type: 'reference', _ref: item._id },
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color || null,
        size: item.size || null,
      })),
      totalAmount,
      currency,
      exchangeRate,
      totalAmountINR,
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

    // Execute atomic transaction for inventory and order creation
    const checkoutResult = await checkoutService.processCheckoutTransaction(
      orderDoc,
      items.map(item => ({ _id: item._id, quantity: item.quantity }))
    );

    if (!checkoutResult.success) {
      return NextResponse.json(
        { success: false, error: checkoutResult.error, details: checkoutResult.details },
        { status: checkoutResult.statusCode || 500 }
      );
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

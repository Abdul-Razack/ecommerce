import { NextResponse } from 'next/server';
import { generateOrderId } from '@/shared/lib/razorpay';
import { orderService } from '@/domains/orders/services/order.service';
import { inventoryService } from '@/domains/inventory/services/inventory.service';

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
    } = body;

    const orderId = generateOrderId();

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
      })),
      totalAmount,
      status: 'confirmed',
      paymentStatus: paymentStatus || 'pending',
      paymentType: paymentType || 'cod',
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
    };

    // Use Order Service to create the document
    await orderService.createOrder(orderDoc);

    // Use Inventory Service to reduce stock atomically
    await inventoryService.reduceStock(items.map(item => ({
      _id: item._id,
      quantity: item.quantity
    })));

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully via domain services',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
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

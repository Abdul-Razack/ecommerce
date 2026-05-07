import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { generateOrderId } from '@/lib/razorpay';
import { writeClient } from '@/lib/sanity';

// POST - Create a new order
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
      deliveryCharge,
    } = body;

    const orderId = generateOrderId();

    // Create order
    await sql`
      INSERT INTO orders (
        order_id, user_name, user_email, user_phone,
        address, city, state, pincode,
        total_amount, payment_type, payment_status,
        razorpay_order_id, razorpay_payment_id,
        delivery_charge, order_status
      ) VALUES (
        ${orderId}, ${name}, ${email}, ${phone},
        ${address}, ${city}, ${state}, ${pincode},
        ${totalAmount}, ${paymentType}, ${paymentStatus},
        ${razorpayOrderId || null}, ${razorpayPaymentId || null},
        ${deliveryCharge || 0}, 'confirmed'
      )
    `;

    // Create order items and reduce stock
    for (const item of items) {
      await sql`
        INSERT INTO order_items (
          order_id, sanity_product_id, product_name,
          product_price, quantity, product_image
        ) VALUES (
          ${orderId}, ${item._id}, ${item.name},
          ${item.price}, ${item.quantity}, ${item.image || null}
        )
      `;

      // Reduce stock in Sanity
      if (writeClient) {
        try {
          await writeClient
            .patch(item._id)
            .setIfMissing({ quantity: 0 })
            .dec({ quantity: item.quantity })
            .commit();
        } catch (stockErr) {
          console.warn(`Stock update failed for ${item._id}:`, stockErr.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET - Fetch orders by email
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

    const orders = await sql`
      SELECT * FROM orders
      WHERE user_email = ${email}
      ORDER BY created_at DESC
    `;

    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT * FROM order_items
          WHERE order_id = ${order.order_id}
        `;
        return { ...order, items };
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

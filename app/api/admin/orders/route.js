import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - All orders for admin
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await sql`
      SELECT * FROM orders ORDER BY created_at DESC
    `;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT * FROM order_items WHERE order_id = ${order.order_id}
        `;
        return { ...order, items };
      })
    );

    return NextResponse.json({ success: true, orders: ordersWithItems });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// PATCH - Update order status or tracking ID
export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, orderStatus, trackingId, paymentStatus } = await request.json();

    if (orderStatus) {
      await sql`
        UPDATE orders 
        SET order_status = ${orderStatus}, updated_at = NOW()
        WHERE order_id = ${orderId}
      `;
    }

    if (trackingId) {
      await sql`
        UPDATE orders 
        SET tracking_id = ${trackingId}, updated_at = NOW()
        WHERE order_id = ${orderId}
      `;
    }

    if (paymentStatus) {
      await sql`
        UPDATE orders 
        SET payment_status = ${paymentStatus}, updated_at = NOW()
        WHERE order_id = ${orderId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

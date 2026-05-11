import { NextResponse } from 'next/server';
import { auth } from '@/shared/lib/auth';
import { orderService } from '@/domains/orders/services/order.service';

// GET - All orders via Order Service
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orders = await orderService.getAllOrders();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Admin orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// PATCH - Update order via Order Service
export async function PATCH(request) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, orderStatus, trackingId, paymentStatus } = await request.json();

    const patch = {};
    if (orderStatus) patch.status = orderStatus;
    if (trackingId) patch.trackingId = trackingId;
    if (paymentStatus) patch.paymentStatus = paymentStatus;

    await orderService.updateOrder(orderId, patch);

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully via domain service',
    });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

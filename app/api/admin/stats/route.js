import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Dashboard stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Total orders
    const totalOrders = await sql`SELECT COUNT(*) as count FROM orders`;
    
    // Total revenue
    const totalRevenue = await sql`
      SELECT COALESCE(SUM(total_amount), 0) as total FROM orders
    `;

    // Pending orders (COD not delivered)
    const pendingOrders = await sql`
      SELECT COUNT(*) as count FROM orders 
      WHERE order_status != 'delivered'
    `;

    // Delivered orders
    const deliveredOrders = await sql`
      SELECT COUNT(*) as count FROM orders 
      WHERE order_status = 'delivered'
    `;

    // Online vs COD
    const onlineOrders = await sql`
      SELECT COUNT(*) as count FROM orders WHERE payment_type = 'online'
    `;
    const codOrders = await sql`
      SELECT COUNT(*) as count FROM orders WHERE payment_type = 'cod'
    `;

    // Total profit calculation
    const orderItems = await sql`
      SELECT oi.sanity_product_id, oi.product_price, oi.quantity, s.cost_price
      FROM order_items oi
      LEFT JOIN stock s ON oi.sanity_product_id = s.sanity_product_id
    `;

    let totalProfit = 0;
    orderItems.forEach((item) => {
      const profit = (item.product_price - (item.cost_price || 0)) * item.quantity;
      totalProfit += profit;
    });

    // Recent orders
    const recentOrders = await sql`
      SELECT * FROM orders ORDER BY created_at DESC LIMIT 10
    `;

    // Product-wise sales
    const productSales = await sql`
      SELECT 
        product_name,
        SUM(quantity) as total_sold,
        SUM(product_price * quantity) as total_revenue
      FROM order_items
      GROUP BY product_name
      ORDER BY total_sold DESC
      LIMIT 10
    `;

    // Monthly sales
    const monthlySales = await sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as order_count,
        SUM(total_amount) as revenue
      FROM orders
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: parseInt(totalOrders[0].count),
        totalRevenue: parseFloat(totalRevenue[0].total),
        pendingOrders: parseInt(pendingOrders[0].count),
        deliveredOrders: parseInt(deliveredOrders[0].count),
        onlineOrders: parseInt(onlineOrders[0].count),
        codOrders: parseInt(codOrders[0].count),
        totalProfit,
        recentOrders,
        productSales,
        monthlySales,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

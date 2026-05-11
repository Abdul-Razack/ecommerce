import { orderService } from '@/domains/orders/services/order.service';
import { productService } from '@/domains/products/services/product.service';

export const analyticsService = {
  /**
   * Compute comprehensive dashboard statistics
   */
  async getDashboardStats() {
    const [orders, products] = await Promise.all([
      orderService.getAllOrders(),
      productService.getProducts()
    ]);

    // Create a product map for profit calculation
    const productMap = products.reduce((acc, p) => {
      acc[p._id] = p;
      return acc;
    }, {});

    let totalRevenue = 0;
    let totalProfit = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    let onlineOrders = 0;
    let codOrders = 0;

    const productSalesMap: Record<string, { total_sold: number; total_revenue: number }> = {};

    orders.forEach(order => {
      totalRevenue += order.totalAmount || 0;
      
      if (order.status === 'delivered') deliveredOrders++;
      else pendingOrders++;

      if (order.paymentType === 'online') onlineOrders++;
      else codOrders++;

      // Calculate profit and product sales
      (order.items || []).forEach(item => {
        const prodId = item.product?._ref;
        const costPrice = productMap[prodId]?.costPrice || 0;
        // Legacy mapping fallback (price vs product_price)
        const price = item.price || item.product_price || 0;
        const quantity = item.quantity || 0;
        
        const profit = (price - costPrice) * quantity;
        totalProfit += profit;

        const name = item.productName || item.name || productMap[prodId]?.name || 'Unknown Item';
        if (!productSalesMap[name]) {
          productSalesMap[name] = { total_sold: 0, total_revenue: 0 };
        }
        productSalesMap[name].total_sold += quantity;
        productSalesMap[name].total_revenue += price * quantity;
      });
    });

    // Format product sales for response
    const productSales = Object.entries(productSalesMap)
      .map(([name, data]) => ({ product_name: name, ...data }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 10);

    // Recent orders (last 10)
    const recentOrders = orders
      .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
      .slice(0, 10);

    const monthlySalesMap: Record<string, { month: string; revenue: number }> = {};
    
    orders.forEach(order => {
      const date = new Date(order._createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlySalesMap[monthYear]) {
        monthlySalesMap[monthYear] = { month: monthYear, revenue: 0 };
      }
      monthlySalesMap[monthYear].revenue += order.totalAmount || 0;
    });

    const monthlySales = Object.values(monthlySalesMap).slice(-6); // Last 6 months

    return {
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      onlineOrders,
      codOrders,
      totalProfit,
      recentOrders,
      productSales,
      monthlySales,
    };
  }
};

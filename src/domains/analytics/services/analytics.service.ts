import { orderService } from '@/domains/orders/services/order.service';
import { productService } from '@/domains/products/services/product.service';

export const analyticsService = {
  /**
   * Compute comprehensive dashboard statistics
   */
  /**
   * Compute comprehensive dashboard statistics with optional region filter
   */
  async getDashboardStats(regionFilter: 'ALL' | 'IN' | 'MY' = 'ALL') {
    const [allOrders, products] = await Promise.all([
      orderService.getAllOrders(),
      productService.getProducts()
    ]);

    // Create a product map for profit calculation
    const productMap = products.reduce((acc: any, p: any) => {
      acc[p._id] = p;
      return acc;
    }, {});

    // Compute regional metrics across all orders first
    let totalIndiaOrders = 0;
    let totalMalaysiaOrders = 0;
    let indiaRevenueINR = 0;
    let malaysiaRevenueMYR = 0;
    let malaysiaRevenueINR = 0;

    allOrders.forEach((order: any) => {
      const isMalaysia = order.currency === 'MYR';
      if (isMalaysia) {
        totalMalaysiaOrders++;
        const myrAmt = order.totalAmount || 0;
        malaysiaRevenueMYR += myrAmt;
        malaysiaRevenueINR += order.totalAmountINR || (order.exchangeRate > 0 ? myrAmt / order.exchangeRate : myrAmt * 19);
      } else {
        totalIndiaOrders++;
        indiaRevenueINR += order.totalAmountINR || order.totalAmount || 0;
      }
    });

    // Filter orders based on requested region
    const orders = allOrders.filter((order: any) => {
      if (regionFilter === 'IN') return order.currency !== 'MYR';
      if (regionFilter === 'MY') return order.currency === 'MYR';
      return true;
    });

    let totalRevenue = 0;
    let subtotalGross = 0;
    let discountTotal = 0;
    let totalProfit = 0;
    let pendingOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let onlineOrders = 0;
    let codOrders = 0;

    const productSalesMap: Record<string, { total_sold: number; total_revenue: number }> = {};
    const categorySalesMap: Record<string, { total_sold: number; total_revenue: number }> = {};

    orders.forEach((order: any) => {
      const orderRevenue = regionFilter === 'MY' 
        ? (order.totalAmount || 0) 
        : (order.totalAmountINR || order.totalAmount || 0);
      
      totalRevenue += orderRevenue;
      subtotalGross += (order.subtotal || orderRevenue);
      discountTotal += (order.discountAmount || 0);
      
      if (order.status === 'delivered') deliveredOrders++;
      else if (order.status === 'cancelled') cancelledOrders++;
      else pendingOrders++;

      if (order.paymentType === 'online') onlineOrders++;
      else codOrders++;

      // Calculate profit, product sales, and category breakdown
      (order.items || []).forEach((item: any) => {
        const prodId = item.product?._ref;
        const targetProd = productMap[prodId] || {};
        const costPrice = targetProd?.costPrice || 0;
        const price = item.price || item.product_price || 0;
        const quantity = item.quantity || 0;
        const categoryName = targetProd?.category?.name || targetProd?.category || 'General';

        // Convert item price to INR for profit calculation
        const orderCurrency = order.currency || 'INR';
        const orderRate = order.exchangeRate || 1;
        const priceINR = orderCurrency === 'INR' ? price : (orderRate > 0 ? price / orderRate : price);
        
        const profit = (priceINR - costPrice) * quantity;
        totalProfit += profit;

        const name = item.productName || item.name || targetProd?.name || 'Unknown Item';
        if (!productSalesMap[name]) {
          productSalesMap[name] = { total_sold: 0, total_revenue: 0 };
        }
        productSalesMap[name].total_sold += quantity;
        productSalesMap[name].total_revenue += (regionFilter === 'MY' ? price : priceINR) * quantity;

        if (!categorySalesMap[categoryName]) {
          categorySalesMap[categoryName] = { total_sold: 0, total_revenue: 0 };
        }
        categorySalesMap[categoryName].total_sold += quantity;
        categorySalesMap[categoryName].total_revenue += (regionFilter === 'MY' ? price : priceINR) * quantity;
      });
    });

    // Format product sales for response
    const productSales = Object.entries(productSalesMap)
      .map(([name, data]) => ({ product_name: name, ...data }))
      .sort((a, b) => b.total_sold - a.total_sold);

    // Format category sales
    const categorySales = Object.entries(categorySalesMap)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total_revenue - a.total_revenue);

    // Recent orders (last 10) with region tags
    const recentOrders = orders
      .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
      .slice(0, 10)
      .map((o: any) => ({
        ...o,
        region: o.currency === 'MYR' ? 'MY' : 'IN'
      }));

    // Detailed Orders export list
    const exportableOrders = orders.map((o: any) => ({
      orderId: o.orderId || o._id,
      date: new Date(o._createdAt).toISOString().split('T')[0],
      customerName: o.customer?.name || 'Guest',
      customerEmail: o.customer?.email || '',
      region: o.currency === 'MYR' ? 'Malaysia (MY)' : 'India (IN)',
      currency: o.currency || 'INR',
      totalAmount: o.totalAmount || 0,
      totalAmountINR: o.totalAmountINR || o.totalAmount || 0,
      status: o.status || 'pending',
      paymentType: o.paymentType || 'cod',
      trackingId: o.trackingId || '',
    }));

    const monthlySalesMap: Record<string, { month: string; revenue: number }> = {};
    
    orders.forEach((order: any) => {
      const date = new Date(order._createdAt);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      if (!monthlySalesMap[monthYear]) {
        monthlySalesMap[monthYear] = { month: monthYear, revenue: 0 };
      }
      monthlySalesMap[monthYear].revenue += (regionFilter === 'MY' ? (order.totalAmount || 0) : (order.totalAmountINR || order.totalAmount || 0));
    });

    const monthlySales = Object.values(monthlySalesMap).slice(-12); // Last 12 months

    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const profitMarginPct = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    return {
      regionFilter,
      totalOrders: orders.length,
      totalRevenue,
      subtotalGross,
      discountTotal,
      averageOrderValue,
      profitMarginPct,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      onlineOrders,
      codOrders,
      totalProfit,
      breakdown: {
        indiaOrders: totalIndiaOrders,
        malaysiaOrders: totalMalaysiaOrders,
        indiaRevenueINR,
        malaysiaRevenueMYR,
        malaysiaRevenueINR,
      },
      recentOrders,
      exportableOrders,
      productSales,
      categorySales,
      monthlySales,
    };
  }
};

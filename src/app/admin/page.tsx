'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Skeleton from '@/shared/ui/Skeleton';
import { useCurrency } from '@/providers/CurrencyProvider';
import Pagination, { usePagination } from '@/shared/ui/Pagination';
import { Package, DollarSign, TrendingUp, Clock } from 'lucide-react';

function formatOrderPrice(amount: number, orderCurrency?: string) {
  const currencyCode = orderCurrency || 'INR';
  if (currencyCode === 'INR') {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  } else {
    return `RM ${amount.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const {
    currentPage: orderPage,
    setCurrentPage: setOrderPage,
    pageSize: orderPageSize,
    setPageSize: setOrderPageSize,
    totalPages: orderTotalPages,
    paginatedItems: paginatedOrders,
    totalItems: orderTotalItems,
  } = usePagination({
    items: stats?.recentOrders || [],
    initialPageSize: 5,
  });

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-12 bg-white min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-1.5 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Dashboard</h1>
        <p className="text-xs sm:text-sm text-zinc-500">Track your store's orders and performance in real-time.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} Icon={Package} />
        <StatCard 
          title="Total Revenue" 
          value={formatPrice(stats?.totalRevenue || 0)} 
          Icon={DollarSign} 
        />
        <StatCard 
          title="Total Profit" 
          value={formatPrice(stats?.totalProfit || 0)} 
          Icon={TrendingUp} 
        />
        <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} Icon={Clock} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-black">Recent Orders</h3>
            <Link
              href="/admin/orders"
              className="text-[10px] uppercase tracking-widest font-black text-zinc-500 hover:text-black transition-colors"
            >
              View All Orders →
            </Link>
          </div>
          <Card padding="p-0" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Order ID</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Customer</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Amount</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {paginatedOrders.map((order: any) => {
                    const id = order.orderId || order._id || '';
                    return (
                      <tr key={order._id} className="hover:bg-zinc-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 text-xs font-mono font-bold text-black">#{id.slice(0, 8)}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-black">{order.customer?.name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{order.customer?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-black">
                          {formatOrderPrice(order.totalAmount || 0, order.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'default' : 'primary'}>
                            {order.status?.replace(/_/g, ' ') || 'processing'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-zinc-400 font-medium">
                          {new Date(order._createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {orderTotalPages > 1 && (
              <Pagination
                currentPage={orderPage}
                totalPages={orderTotalPages}
                totalItems={orderTotalItems}
                pageSize={orderPageSize}
                pageSizeOptions={[5, 10, 20]}
                onPageChange={setOrderPage}
                onPageSizeChange={setOrderPageSize}
                itemLabel="orders"
              />
            )}
          </Card>
        </div>

        {/* Top Products Card */}
        <div className="space-y-6">
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-black">Top Selling</h3>
          <Card className="bg-zinc-50 border-0">
            <div className="space-y-6">
              {stats?.productSales?.slice(0, 8).map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between group">
                  <div>
                    <p className="text-xs font-bold text-black group-hover:underline cursor-pointer">{product.product_name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{product.total_sold} units sold</p>
                  </div>
                  <p className="text-xs font-bold text-black">
                    {formatPrice(product.total_revenue || 0)}
                  </p>
                </div>
              ))}
              {(!stats?.productSales || stats.productSales.length === 0) && (
                <p className="text-xs text-zinc-400 text-center py-8">No sales data available.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, Icon }: { title: string; value: any; Icon: any }) => (
  <Card hover className="relative overflow-hidden">
    <div className="flex flex-col gap-2 relative z-10">
      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{title}</span>
      <p className="text-2xl font-bold text-black tracking-tight">{value}</p>
    </div>
    <div className="absolute bottom-2 right-2 text-zinc-100 select-none pointer-events-none">
      <Icon className="w-12 h-12 stroke-[1.2]" />
    </div>
  </Card>
);

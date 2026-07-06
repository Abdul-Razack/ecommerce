'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Skeleton from '@/shared/ui/Skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="p-8 space-y-12 bg-white min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">Dashboard</h1>
        <p className="text-sm text-zinc-500">Track your store's orders and performance in real-time.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon="📦" />
        <StatCard 
          title="Total Revenue" 
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} 
          icon="💰" 
        />
        <StatCard 
          title="Total Profit" 
          value={`₹${(stats?.totalProfit || 0).toLocaleString('en-IN')}`} 
          icon="📈" 
        />
        <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon="⏳" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-black">Recent Orders</h3>
          </div>
          <Card padding={false} className="overflow-hidden">
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
                  {stats?.recentOrders?.map((order) => {
                    const id = order.orderId || order._id || '';
                    return (
                      <tr key={order._id} className="hover:bg-zinc-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 text-xs font-mono font-bold text-black">#{id.slice(0, 8)}</td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-semibold text-black">{order.customer?.name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{order.customer?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-black">
                          ₹{order.totalAmount?.toLocaleString('en-IN')}
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
                      <td colSpan="5" className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                        No orders yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Top Products Card */}
        <div className="space-y-6">
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-black">Top Selling</h3>
          <Card className="bg-zinc-50 border-0">
            <div className="space-y-6">
              {stats?.productSales?.map((product, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div>
                    <p className="text-xs font-bold text-black group-hover:underline cursor-pointer">{product.product_name}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{product.total_sold} units sold</p>
                  </div>
                  <p className="text-xs font-bold text-black">
                    ₹{product.total_revenue?.toLocaleString('en-IN')}
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

const StatCard = ({ title, value, icon }) => (
  <Card hoverEffect className="relative overflow-hidden">
    <div className="flex flex-col gap-2 relative z-10">
      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">{title}</span>
      <p className="text-2xl font-bold text-black tracking-tight">{value}</p>
    </div>
    <span className="absolute -bottom-4 -right-4 text-6xl opacity-5 select-none">{icon}</span>
  </Card>
);

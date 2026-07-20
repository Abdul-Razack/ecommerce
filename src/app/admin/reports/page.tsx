'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Skeleton from '@/shared/ui/Skeleton';

export default function AdminReportsPage() {
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
      <div className="p-8 space-y-8 bg-white min-h-screen">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">Reports & Analytics</h1>
        <p className="text-sm text-zinc-500">Track and analyze your store's sales and performance trends.</p>
      </header>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <div className="flex flex-col gap-2 relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Total Revenue</span>
            <p className="text-2xl font-bold text-black tracking-tight">
              ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <span className="absolute -bottom-4 -right-4 text-6xl opacity-5 select-none">💰</span>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex flex-col gap-2 relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Total Profit</span>
            <p className="text-2xl font-bold text-black tracking-tight">
              ₹{(stats?.totalProfit || 0).toLocaleString('en-IN')}
            </p>
          </div>
          <span className="absolute -bottom-4 -right-4 text-6xl opacity-5 select-none">📈</span>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex flex-col gap-2 relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Online Payments</span>
            <p className="text-2xl font-bold text-black tracking-tight">{stats?.onlineOrders || 0}</p>
            <span className="text-[10px] text-zinc-400 font-semibold mt-1">
              {stats?.totalOrders ? Math.round((stats.onlineOrders / stats.totalOrders) * 100) : 0}% of total
            </span>
          </div>
          <span className="absolute -bottom-4 -right-4 text-6xl opacity-5 select-none">💳</span>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="flex flex-col gap-2 relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">COD Orders</span>
            <p className="text-2xl font-bold text-black tracking-tight">{stats?.codOrders || 0}</p>
            <span className="text-[10px] text-zinc-400 font-semibold mt-1">
              {stats?.totalOrders ? Math.round((stats.codOrders / stats.totalOrders) * 100) : 0}% of total
            </span>
          </div>
          <span className="absolute -bottom-4 -right-4 text-6xl opacity-5 select-none">💵</span>
        </Card>
      </div>

      {/* Monthly Sales Table */}
      <div className="space-y-6">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-black">📅 Monthly Sales</h3>
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Month</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-center">Orders</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Revenue</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Avg Order Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs">
                {stats?.monthlySales?.length > 0 ? (
                  stats.monthlySales.map((month, index) => (
                    <tr key={index} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-black">
                        {new Date(month.month + '-01').toLocaleDateString('en-IN', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-600 font-medium">{month.order_count}</td>
                      <td className="px-6 py-4 text-right font-semibold text-black">
                        ₹{parseFloat(month.revenue).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-600 font-semibold">
                        ₹{Math.round(parseFloat(month.revenue) / parseInt(month.order_count)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic">
                      No sales data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Product-wise Sales Table */}
      <div className="space-y-6">
        <h3 className="text-[11px] uppercase tracking-widest font-bold text-black">🏆 Product-wise Sales</h3>
        <Card padding={false} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 w-16">Rank</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Product Name</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-center">Quantity Sold</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs">
                {stats?.productSales?.length > 0 ? (
                  stats.productSales.map((product, index) => (
                    <tr key={index} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-black">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] ${
                          index === 0 ? 'bg-amber-100 text-amber-800' :
                          index === 1 ? 'bg-zinc-100 text-zinc-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-zinc-50 text-zinc-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-black">{product.product_name}</td>
                      <td className="px-6 py-4 text-center text-zinc-600 font-medium">{product.total_sold}</td>
                      <td className="px-6 py-4 text-right font-semibold text-black">
                        ₹{parseFloat(product.total_revenue).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-400 italic">
                      No product sales data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Profit Margin Bento Banner */}
      {stats?.totalRevenue > 0 && (
        <Card className="bg-zinc-50 border-0 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Profit Margin</span>
              <p className="text-4xl font-black text-emerald-600">
                {((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="grid grid-cols-3 gap-8 md:gap-16">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Revenue</span>
                <p className="text-lg font-bold text-black mt-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Cost</span>
                <p className="text-lg font-bold text-rose-600 mt-1">
                  ₹{(stats.totalRevenue - stats.totalProfit).toLocaleString('en-IN')}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Net Profit</span>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  ₹{stats.totalProfit.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

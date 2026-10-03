'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Skeleton from '@/shared/ui/Skeleton';
import RegionBadge from '@/shared/ui/RegionBadge';
import SalesTrendChart from '@/shared/ui/charts/SalesTrendChart';
import RegionalComparisonChart from '@/shared/ui/charts/RegionalComparisonChart';
import PaymentDistributionChart from '@/shared/ui/charts/PaymentDistributionChart';
import Pagination, { usePagination } from '@/shared/ui/Pagination';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Globe, 
  ArrowUpRight, 
  ShoppingBag, 
  Activity,
  MapPin
} from 'lucide-react';

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
  const [region, setRegion] = useState<'ALL' | 'IN' | 'MY'>('ALL');

  useEffect(() => {
    fetchStats(region);
  }, [region]);

  const fetchStats = async (currentRegion: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?region=${currentRegion}`);
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
    initialPageSize: 6,
  });

  const getRegionRevenueLabel = () => {
    if (region === 'MY') {
      return `RM ${stats?.totalRevenue?.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;
    }
    return `₹${Math.round(stats?.totalRevenue || 0).toLocaleString('en-IN')}`;
  };

  const getRegionProfitLabel = () => {
    if (region === 'MY') {
      const profitMYR = stats?.totalProfit ? stats.totalProfit / 19 : 0;
      return `RM ${profitMYR.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${Math.round(stats?.totalProfit || 0).toLocaleString('en-IN')}`;
  };

  if (loading && !stats) {
    return (
      <div className="p-8 space-y-8 bg-white min-h-screen">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const currencySymbol = region === 'MY' ? 'RM ' : '₹';

  return (
    <div suppressHydrationWarning className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 bg-zinc-50/30 min-h-screen font-sans text-black">
      {/* Header & Region Switcher */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">Admin Dashboard</h1>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-black text-white px-2.5 py-1 rounded-md">
              Posh Pigeon
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium">Store overview and multi-region business metrics.</p>
        </div>

        {/* Region Switcher Pills - Strict Monochrome */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 flex-shrink-0">
          <button
            onClick={() => setRegion('ALL')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all border-none cursor-pointer flex items-center gap-2 ${
              region === 'ALL'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black bg-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Regions</span>
          </button>
          <button
            onClick={() => setRegion('IN')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all border-none cursor-pointer flex items-center gap-2 ${
              region === 'IN'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black bg-transparent'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>India (INR)</span>
          </button>
          <button
            onClick={() => setRegion('MY')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all border-none cursor-pointer flex items-center gap-2 ${
              region === 'MY'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black bg-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Malaysia (MYR)</span>
          </button>
        </div>
      </header>

      {/* Regional Breakdown Highlights (When ALL selected) - Monochrome Cards */}
      {region === 'ALL' && stats?.breakdown && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-black text-white shadow-xs flex items-center justify-between border border-black">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">India Business</p>
                <p className="text-lg font-extrabold text-white">{stats.breakdown.indiaOrders} Orders Processed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-mono font-bold text-white">₹{Math.round(stats.breakdown.indiaRevenueINR).toLocaleString('en-IN')}</p>
              <p className="text-[9px] font-mono text-zinc-400">INR Direct Net</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900 text-white shadow-xs flex items-center justify-between border border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-800 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Malaysia Business</p>
                <p className="text-lg font-extrabold text-white">{stats.breakdown.malaysiaOrders} Orders Processed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base font-mono font-bold text-white">RM {stats.breakdown.malaysiaRevenueMYR.toLocaleString('en-MY', { minimumFractionDigits: 2 })}</p>
              <p className="text-[9px] font-mono text-zinc-400">≈ ₹{Math.round(stats.breakdown.malaysiaRevenueINR).toLocaleString('en-IN')} Base</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Level Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KpiCard
          title={region === 'ALL' ? 'Total Orders' : region === 'IN' ? 'India Orders' : 'Malaysia Orders'}
          value={stats?.totalOrders || 0}
          subtitle="+14.2% from last month"
          icon={Package}
        />
        <KpiCard
          title={region === 'ALL' ? 'Total Net Revenue' : region === 'IN' ? 'India Revenue' : 'Malaysia Revenue'}
          value={getRegionRevenueLabel()}
          subtitle="Gross settlement basis"
          icon={DollarSign}
        />
        <KpiCard
          title="Estimated Net Profit"
          value={getRegionProfitLabel()}
          subtitle="COGS verified margin"
          icon={TrendingUp}
        />
        <KpiCard
          title="Pending Fulfillment"
          value={stats?.pendingOrders || 0}
          subtitle="Awaiting courier dispatch"
          icon={Clock}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Trend Chart */}
        <div className="lg:col-span-2">
          <SalesTrendChart 
            data={stats?.monthlySales || []} 
            currencySymbol={currencySymbol} 
            title={region === 'ALL' ? 'Overall Sales Trajectory' : region === 'IN' ? 'India Sales Trajectory' : 'Malaysia Sales Trajectory'} 
          />
        </div>

        {/* Payment Distribution Chart */}
        <div>
          <PaymentDistributionChart
            onlineOrders={stats?.onlineOrders || 0}
            codOrders={stats?.codOrders || 0}
          />
        </div>
      </div>

      {/* Regional Comparison Chart & Secondary Insights */}
      {region === 'ALL' && stats?.breakdown && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RegionalComparisonChart
              indiaOrders={stats.breakdown.indiaOrders}
              malaysiaOrders={stats.breakdown.malaysiaOrders}
              indiaRevenueINR={stats.breakdown.indiaRevenueINR}
              malaysiaRevenueMYR={stats.breakdown.malaysiaRevenueMYR}
              malaysiaRevenueINR={stats.breakdown.malaysiaRevenueINR}
            />
          </div>

          <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-zinc-900 text-white rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-black">Store Health & Metrics</h4>
                <p className="text-[10px] text-zinc-500 font-medium">Operational metrics</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-xs font-bold text-zinc-800">Fulfillment Success Rate</span>
                <span className="text-xs font-mono font-extrabold text-black bg-zinc-200 px-2 py-0.5 rounded">
                  {stats?.totalOrders > 0 ? Math.round(((stats.deliveredOrders || 0) / stats.totalOrders) * 100) : 100}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-xs font-bold text-zinc-800">Average Order Value (AOV)</span>
                <span className="text-xs font-mono font-extrabold text-black">
                  {currencySymbol}{stats?.totalOrders > 0 ? Math.round((stats.totalRevenue || 0) / stats.totalOrders).toLocaleString() : 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                <span className="text-xs font-bold text-zinc-800">Catalog Size</span>
                <span className="text-xs font-mono font-extrabold text-black">
                  {stats?.productSales?.length || 0} Products
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Orders Feed & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-black" />
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-black">
                Recent Orders {region !== 'ALL' && `(${region === 'IN' ? 'India' : 'Malaysia'})`}
              </h3>
            </div>
            <Link
              href="/admin/orders"
              className="text-[10px] uppercase tracking-widest font-bold text-zinc-600 hover:text-black flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Card padding="p-0" className="overflow-hidden rounded-xl border border-zinc-200 shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Order ID</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Region</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Customer</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Amount</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {paginatedOrders.map((order: any) => {
                    const id = order.orderId || order._id || '';
                    const isMY = order.currency === 'MYR' || order.region === 'MY';
                    return (
                      <tr key={order._id} className="hover:bg-zinc-50 transition-colors group cursor-pointer">
                        <td className="px-6 py-4 text-xs font-mono font-bold text-black">#{id.slice(0, 8)}</td>
                        <td className="px-6 py-4">
                          <RegionBadge region={isMY ? 'MY' : 'IN'} size="sm" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-black">{order.customer?.name}</div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{order.customer?.email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-extrabold text-black">
                          {formatOrderPrice(order.totalAmount || 0, order.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'default' : 'primary'}>
                            {order.status?.replace(/_/g, ' ') || 'processing'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-zinc-500 font-medium">
                          {new Date(order._createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                        No orders recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {orderTotalPages > 1 && (
              <div className="p-3 bg-zinc-50 border-t border-zinc-100">
                <Pagination
                  currentPage={orderPage}
                  totalPages={orderTotalPages}
                  totalItems={orderTotalItems}
                  pageSize={orderPageSize}
                  pageSizeOptions={[6, 12, 24]}
                  onPageChange={setOrderPage}
                  onPageSizeChange={setOrderPageSize}
                  itemLabel="orders"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Top Selling Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200">
            <h3 className="text-xs uppercase tracking-widest font-extrabold text-black">Top Selling Items</h3>
            <span className="text-[10px] text-zinc-400 font-mono">By Volume</span>
          </div>

          <Card className="bg-white border-zinc-200 rounded-xl p-5 shadow-xs">
            <div className="space-y-4">
              {stats?.productSales?.slice(0, 7).map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-black line-clamp-1">{product.product_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-medium">{product.total_sold} units sold</span>
                    </div>
                  </div>
                  <p className="text-xs font-mono font-extrabold text-black">
                    {region === 'MY' 
                      ? `RM ${product.total_revenue?.toLocaleString('en-MY', { minimumFractionDigits: 2 })}`
                      : `₹${Math.round(product.total_revenue || 0).toLocaleString('en-IN')}`
                    }
                  </p>
                </div>
              ))}
              {(!stats?.productSales || stats.productSales.length === 0) && (
                <p className="text-xs text-zinc-400 text-center py-8">No product sales logged yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const KpiCard = ({ title, value, subtitle, icon: Icon }: any) => (
  <Card hover className="relative overflow-hidden p-5 rounded-xl border border-zinc-200 shadow-xs bg-white">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{title}</span>
      <div className="p-2 bg-black text-white rounded-lg">
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-mono font-black text-black tracking-tight">{value}</p>
      <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
        <ArrowUpRight className="w-3 h-3 text-black" />
        <span>{subtitle}</span>
      </div>
    </div>
  </Card>
);

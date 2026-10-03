'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Skeleton from '@/shared/ui/Skeleton';
import Pagination, { usePagination } from '@/shared/ui/Pagination';
import SalesTrendChart from '@/shared/ui/charts/SalesTrendChart';
import RegionalComparisonChart from '@/shared/ui/charts/RegionalComparisonChart';
import PaymentDistributionChart from '@/shared/ui/charts/PaymentDistributionChart';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  Calendar, 
  Trophy, 
  Globe, 
  Search, 
  BarChart3, 
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Percent,
  Layers,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<'ALL' | 'IN' | 'MY'>('ALL');
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'products' | 'audit'>('overview');
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

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

  // Helper to trigger CSV download
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row)
        .map(value => `"${String(value).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export financial ledger CSV
  const handleExportOrdersCSV = () => {
    exportToCSV(stats?.exportableOrders || [], `PoshPigeon_Financial_Audit_${region}`);
  };

  // Export product performance CSV
  const handleExportProductsCSV = () => {
    exportToCSV(stats?.productSales || [], `PoshPigeon_Product_Sales_${region}`);
  };

  // Monthly Sales pagination
  const {
    currentPage: monthPage,
    setCurrentPage: setMonthPage,
    pageSize: monthPageSize,
    setPageSize: setMonthPageSize,
    totalPages: monthTotalPages,
    paginatedItems: paginatedMonthlySales,
  } = usePagination({
    items: stats?.monthlySales || [],
    initialPageSize: 12,
  });

  // Product-wise Sales search & pagination
  const filteredProductSales = (stats?.productSales || []).filter((p: any) =>
    !productSearch.trim() || p.product_name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const {
    currentPage: productPage,
    setCurrentPage: setProductPage,
    pageSize: productPageSize,
    setPageSize: setProductPageSize,
    totalPages: productTotalPages,
    paginatedItems: paginatedProductSales,
    totalItems: productTotalItems,
  } = usePagination({
    items: filteredProductSales,
    initialPageSize: 10,
  });

  // Exportable Orders search & pagination
  const filteredOrders = (stats?.exportableOrders || []).filter((o: any) => {
    if (!orderSearch.trim()) return true;
    const term = orderSearch.toLowerCase();
    return (
      String(o.orderId).toLowerCase().includes(term) ||
      String(o.customerName).toLowerCase().includes(term) ||
      String(o.customerEmail).toLowerCase().includes(term) ||
      String(o.status).toLowerCase().includes(term)
    );
  });

  const {
    currentPage: auditPage,
    setCurrentPage: setAuditPage,
    pageSize: auditPageSize,
    setPageSize: setAuditPageSize,
    totalPages: auditTotalPages,
    paginatedItems: paginatedAuditOrders,
    totalItems: auditTotalItems,
  } = usePagination({
    items: filteredOrders,
    initialPageSize: 10,
  });

  if (loading && !stats) {
    return (
      <div className="p-8 space-y-8 bg-white min-h-screen">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const currencySymbol = region === 'MY' ? 'RM ' : '₹';

  return (
    <div suppressHydrationWarning className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 bg-zinc-50/30 min-h-screen font-sans text-black">
      {/* Header & Export Toolbar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-black" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black uppercase">Deep Financial Suite & Reports</h1>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">Auditable financial ledger, product yield, and CSV export engine.</p>
        </div>

        {/* Action Controls: Export CSV & Region Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportOrdersCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-black text-white hover:bg-zinc-800 transition-all border-none cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Orders CSV</span>
          </button>

          <button
            onClick={handleExportProductsCSV}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-zinc-100 text-zinc-900 hover:bg-zinc-200 transition-all border border-zinc-300 cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Products CSV</span>
          </button>

          {/* Region Switcher Pills */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              onClick={() => setRegion('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded border-none cursor-pointer flex items-center gap-1 ${
                region === 'ALL' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 bg-transparent'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>All</span>
            </button>
            <button
              onClick={() => setRegion('IN')}
              className={`px-3 py-1.5 text-xs font-bold rounded border-none cursor-pointer flex items-center gap-1 ${
                region === 'IN' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 bg-transparent'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>India</span>
            </button>
            <button
              onClick={() => setRegion('MY')}
              className={`px-3 py-1.5 text-xs font-bold rounded border-none cursor-pointer flex items-center gap-1 ${
                region === 'MY' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 bg-transparent'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Malaysia</span>
            </button>
          </div>
        </div>
      </header>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card hover className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Gross Sales</span>
            <div className="p-2 bg-black text-white rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-black">
            {currencySymbol}{Math.round(stats?.subtotalGross || stats?.totalRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-medium block mt-1">Pre-discount order value</span>
        </Card>

        <Card hover className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Net Revenue</span>
            <div className="p-2 bg-black text-white rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-black">
            {currencySymbol}{Math.round(stats?.totalRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-medium block mt-1">Net collected revenue</span>
        </Card>

        <Card hover className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Net Profit Margin</span>
            <div className="p-2 bg-black text-white rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-black">
            {stats?.profitMarginPct || 0}%
          </p>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1">
            {currencySymbol}{Math.round(stats?.totalProfit || 0).toLocaleString()} Net Margin
          </span>
        </Card>

        <Card hover className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Avg Order Value (AOV)</span>
            <div className="p-2 bg-black text-white rounded-lg">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-black text-black">
            {currencySymbol}{Math.round(stats?.averageOrderValue || 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-zinc-500 font-medium block mt-1">Per transaction average</span>
        </Card>
      </div>

      {/* Module View Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer ${
            activeTab === 'overview' ? 'bg-black text-white' : 'bg-white text-zinc-600 hover:text-black border border-zinc-200'
          }`}
        >
          Financial Overview
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer ${
            activeTab === 'categories' ? 'bg-black text-white' : 'bg-white text-zinc-600 hover:text-black border border-zinc-200'
          }`}
        >
          Category Yield
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer ${
            activeTab === 'products' ? 'bg-black text-white' : 'bg-white text-zinc-600 hover:text-black border border-zinc-200'
          }`}
        >
          Product Sales Matrix
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all border-none cursor-pointer ${
            activeTab === 'audit' ? 'bg-black text-white' : 'bg-white text-zinc-600 hover:text-black border border-zinc-200'
          }`}
        >
          Auditable Orders Ledger
        </button>
      </div>

      {/* TAB 1: Financial Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesTrendChart
                data={stats?.monthlySales || []}
                currencySymbol={currencySymbol}
                title={region === 'ALL' ? 'Multi-Year Revenue Trajectory' : `${region === 'IN' ? 'India' : 'Malaysia'} Sales Trajectory`}
              />
            </div>

            <div>
              <PaymentDistributionChart
                onlineOrders={stats?.onlineOrders || 0}
                codOrders={stats?.codOrders || 0}
              />
            </div>
          </div>

          {region === 'ALL' && stats?.breakdown && (
            <RegionalComparisonChart
              indiaOrders={stats.breakdown.indiaOrders}
              malaysiaOrders={stats.breakdown.malaysiaOrders}
              indiaRevenueINR={stats.breakdown.indiaRevenueINR}
              malaysiaRevenueMYR={stats.breakdown.malaysiaRevenueMYR}
              malaysiaRevenueINR={stats.breakdown.malaysiaRevenueINR}
            />
          )}
        </div>
      )}

      {/* TAB 2: Category Sales Yield */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-black" />
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-black">Sales & Revenue Contribution by Product Category</h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">{stats?.categorySales?.length || 0} Active Categories</span>
          </div>

          <Card padding="p-0" className="overflow-hidden rounded-xl border border-zinc-200 shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Category Name</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-center">Units Sold</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Revenue Yield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {stats?.categorySales?.map((cat: any, idx: number) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-black">{cat.category}</td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-zinc-700 text-center">{cat.total_sold} units</td>
                      <td className="px-6 py-4 text-xs font-mono font-extrabold text-black text-right">
                        {currencySymbol}{Math.round(cat.total_revenue).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!stats?.categorySales || stats.categorySales.length === 0) && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                        No category sales data recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: Product Sales Matrix */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-black" />
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-black">Complete Product Yield Matrix</h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportProductsCSV}
                className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-lg flex items-center gap-1 cursor-pointer border-none"
              >
                <Download className="w-3 h-3" /> Export CSV
              </button>
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter product title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <Card padding="p-0" className="overflow-hidden rounded-xl border border-zinc-200 shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Rank</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">Product Title</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-center">Volume Sold</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {paginatedProductSales.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-zinc-400">#{(productPage - 1) * productPageSize + idx + 1}</td>
                      <td className="px-6 py-4 text-xs font-bold text-black">{item.product_name}</td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-zinc-700 text-center">{item.total_sold} units</td>
                      <td className="px-6 py-4 text-xs font-mono font-extrabold text-black text-right">
                        {currencySymbol}{Math.round(item.total_revenue).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {(!filteredProductSales || filteredProductSales.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                        No product sales matching filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {productTotalPages > 1 && (
              <div className="p-3 bg-zinc-50 border-t border-zinc-100">
                <Pagination
                  currentPage={productPage}
                  totalPages={productTotalPages}
                  totalItems={productTotalItems}
                  pageSize={productPageSize}
                  pageSizeOptions={[10, 20, 50]}
                  onPageChange={setProductPage}
                  onPageSizeChange={setProductPageSize}
                  itemLabel="products"
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 4: Auditable Orders Ledger */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-black" />
              <h3 className="text-xs uppercase tracking-widest font-extrabold text-black">Financial Audit Ledger ({auditTotalItems} Records)</h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleExportOrdersCSV}
                className="px-3.5 py-1.5 text-xs font-bold bg-black text-white rounded-lg flex items-center gap-1.5 cursor-pointer border-none shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download Complete CSV
              </button>
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter by Order ID, customer..."
                  value={orderSearch}
                  onChange={(e) => {
                    setOrderSearch(e.target.value);
                    setAuditPage(1);
                  }}
                  className="w-full h-8 pl-8 pr-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-medium focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <Card padding="p-0" className="overflow-hidden rounded-xl border border-zinc-200 shadow-xs bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Order Ref</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Date</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Customer</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Region</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Payment</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap text-right">Amount</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {paginatedAuditOrders.map((o: any, idx: number) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-bold text-black">#{String(o.orderId).slice(0, 8)}</td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-500">{o.date}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-black">{o.customerName}</div>
                        <div className="text-[10px] text-zinc-400">{o.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-zinc-700">{o.region}</td>
                      <td className="px-6 py-4 text-xs font-mono text-zinc-700 uppercase">{o.paymentType}</td>
                      <td className="px-6 py-4 text-xs font-mono font-extrabold text-black text-right">
                        {o.currency === 'MYR' ? `RM ${o.totalAmount.toLocaleString()}` : `₹${Math.round(o.totalAmountINR).toLocaleString()}`}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-black border border-zinc-200">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {paginatedAuditOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs text-zinc-400 italic">
                        No financial records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {auditTotalPages > 1 && (
              <div className="p-3 bg-zinc-50 border-t border-zinc-100">
                <Pagination
                  currentPage={auditPage}
                  totalPages={auditTotalPages}
                  totalItems={auditTotalItems}
                  pageSize={auditPageSize}
                  pageSizeOptions={[10, 20, 50, 100]}
                  onPageChange={setAuditPage}
                  onPageSizeChange={setAuditPageSize}
                  itemLabel="records"
                />
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

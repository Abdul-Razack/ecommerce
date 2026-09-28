'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Skeleton from '@/shared/ui/Skeleton';
import { useCurrency } from '@/providers/CurrencyProvider';
import Pagination, { usePagination } from '@/shared/ui/Pagination';

export default function AdminStockPage() {
  const [stock, setStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.success) {
        setStock(data.stock || []);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stock.filter((item) => {
    // Status filter
    if (statusFilter === 'out_of_stock' && item.stock !== 0) return false;
    if (statusFilter === 'low_stock' && (item.stock === 0 || item.stock >= 10)) return false;
    if (statusFilter === 'in_stock' && item.stock < 10) return false;

    // Search filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(term) ||
      item._id?.toLowerCase().includes(term)
    );
  });

  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    paginatedItems: paginatedStock,
    totalItems,
  } = usePagination({
    items: filteredStock,
    initialPageSize: 10,
  });

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 md:space-y-12 bg-white min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 sm:space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Inventory</h1>
          <p className="text-xs sm:text-sm text-zinc-500">Manage your product stock levels and cost tracking.</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 bg-zinc-50 px-4 py-2 border border-zinc-100 self-start sm:self-auto">
          Managed via Sanity CMS
        </div>
      </header>

      {/* Filters and Search Bar */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {(['all', 'in_stock', 'low_stock', 'out_of_stock'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => {
                  setStatusFilter(filterKey);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold border transition-all duration-200 whitespace-nowrap ${
                  statusFilter === filterKey
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-400 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {filterKey === 'all'
                  ? 'All'
                  : filterKey === 'in_stock'
                  ? 'In Stock'
                  : filterKey === 'low_stock'
                  ? 'Low Stock'
                  : 'Out of Stock'}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search stock by product or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-80 h-10 px-4 bg-zinc-50 border border-zinc-200 text-xs font-medium uppercase tracking-wider focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Product Name</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Product ID</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Quantity</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Cost Price</th>
                  <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginatedStock.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-black">{item.name}</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-zinc-400">{item._id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-black">{item.stock}</td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-600">
                      {formatPrice(parseFloat(item.costPrice || 0))}
                    </td>
                    <td className="px-6 py-4">
                      {item.stock === 0 ? (
                        <Badge variant="error">Out of Stock</Badge>
                      ) : item.stock < 10 ? (
                        <Badge variant="primary" className="bg-yellow-50 text-yellow-700">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredStock.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center text-xs text-zinc-400 italic">
                      No stock data matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100]}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="items"
          />
        </Card>
      </div>
    </div>
  );
}

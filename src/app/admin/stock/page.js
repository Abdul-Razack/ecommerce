'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Skeleton from '@/shared/ui/Skeleton';

export default function AdminStockPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      if (data.success) {
        setStock(data.stock);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-black">Inventory</h1>
          <p className="text-sm text-zinc-500">Manage your product stock levels and cost tracking.</p>
        </div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 bg-zinc-50 px-4 py-2 border border-zinc-100">
          Managed via Sanity CMS
        </div>
      </header>

      {/* Stock Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] uppercase tracking-widest font-bold text-black">
            Product Stock <span className="text-zinc-400 ml-2">({stock?.length || 0} Items)</span>
          </h3>
        </div>
        <Card padding={false} className="overflow-hidden">
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
                {stock?.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-black">{item.name}</td>
                    <td className="px-6 py-4 text-[10px] font-mono text-zinc-400">{item._id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-black">{item.stock}</td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-600">
                      ₹{parseFloat(item.costPrice || 0).toLocaleString('en-IN')}
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
                {stock.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-24 text-center text-xs text-zinc-400 italic">
                      No stock data available. Add products in Sanity Studio first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

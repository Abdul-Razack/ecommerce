'use client';

import { useState, useEffect } from 'react';
import Card from '@/shared/ui/Card';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import Skeleton from '@/shared/ui/Skeleton';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map((o) => 
          (o.orderId === orderId || o._id === orderId) ? { ...o, status: newStatus } : o
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const updateTrackingId = async (orderId, trackingId) => {
    try {
      await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, trackingId }),
      });
      setOrders(orders.map((o) =>
        (o.orderId === orderId || o._id === orderId) ? { ...o, trackingId } : o
      ));
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const statuses = ['all', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="p-8 space-y-12 bg-white min-h-screen">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">Order Management</h1>
        <p className="text-sm text-zinc-500">View and update customer orders and tracking status.</p>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all duration-200 whitespace-nowrap ${
              filter === status 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'
            }`}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            <span className="ml-2 opacity-50">
              {status === 'all' ? orders.length : orders.filter(o => o.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Order ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Customer</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Items</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Amount</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Payment</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500 whitespace-nowrap">Tracking ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredOrders.map((order) => {
                const id = order.orderId || order._id || '';
                return (
                  <tr key={order._id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono font-bold text-black">#{id.slice(0, 8)}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{new Date(order._createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-semibold text-black">{order.customer?.name}</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">{order.customer?.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="text-[10px] text-zinc-500 font-medium">
                            {item.productName || item.name} <span className="text-black">×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-black">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'primary'}>
                        {order.paymentType === 'online' ? '💳' : '💵'} {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="text-[10px] font-bold uppercase bg-white border border-zinc-200 px-2 py-1 outline-none focus:border-black transition-all"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        placeholder="Add tracking ID"
                        defaultValue={order.trackingId || ''}
                        onBlur={(e) => {
                          if (e.target.value !== (order.trackingId || '')) {
                            updateTrackingId(id, e.target.value);
                          }
                        }}
                        className="text-[10px] font-medium border border-zinc-100 px-3 py-1.5 w-32 focus:border-black outline-none transition-all placeholder:text-zinc-300"
                      />
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-24 text-center text-xs text-zinc-400 italic">
                    No orders matching this filter were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

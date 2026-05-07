'use client';

import { useState, useEffect } from 'react';

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
          o.order_id === orderId ? { ...o, order_status: newStatus } : o
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
        o.order_id === orderId ? { ...o, tracking_id: trackingId } : o
      ));
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter((o) => o.order_status === filter);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="admin-page-title">📦 Order Management</h1>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'].map((status) => (
          <button
            key={status}
            className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            {status === 'all' ? ` (${orders.length})` : ` (${orders.filter(o => o.order_status === status).length})`}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Tracking ID</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.order_id}>
                <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{order.order_id}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{order.user_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user_phone}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {order.city}, {order.state}
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8rem' }}>
                    {order.items?.map((item, i) => (
                      <div key={i}>{item.product_name} ×{item.quantity}</div>
                    ))}
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                  ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                </td>
                <td>
                  <span className={`order-status-badge ${order.payment_status === 'paid' ? 'delivered' : 'pending'}`}>
                    {order.payment_type === 'online' ? '💳' : '💵'} {order.payment_status}
                  </span>
                </td>
                <td>
                  <select
                    className="status-select"
                    value={order.order_status}
                    onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td>
                  <input
                    className="tracking-input"
                    type="text"
                    placeholder="Add tracking..."
                    defaultValue={order.tracking_id || ''}
                    onBlur={(e) => {
                      if (e.target.value !== (order.tracking_id || '')) {
                        updateTrackingId(order.order_id, e.target.value);
                      }
                    }}
                  />
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

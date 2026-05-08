'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderTimeline from '@/components/features/orders/OrderTimeline';

function OrdersContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrders = async (searchEmail) => {
    if (!searchEmail) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(searchEmail)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      fetchOrders(emailParam);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders(email);
  };

  return (
    <section className="orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {/* Email Search */}
        <form onSubmit={handleSearch} style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input
                id="order-search-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to find orders"
                required
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  width: '100%',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳' : '🔍'} Search
            </button>
          </div>
        </form>

        {/* Orders List */}
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.order_id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <div className="order-card-id">Order #{order.order_id}</div>
                    <div className="order-card-date">
                      {new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`order-status-badge ${order.order_status}`}>
                      {order.order_status?.replace(/_/g, ' ')}
                    </span>
                    <span className={`order-status-badge ${order.payment_status === 'paid' ? 'delivered' : 'pending'}`}>
                      {order.payment_type === 'cod' ? '💵 COD' : '💳 Online'}
                    </span>
                  </div>
                </div>

                <div className="order-card-body">
                  {/* Order Timeline */}
                  <OrderTimeline status={order.order_status} />

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="order-items-list">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <div className="order-item-image">
                            {item.product_image && (
                              <img src={item.product_image} alt={item.product_name} />
                            )}
                          </div>
                          <span className="order-item-name">{item.product_name}</span>
                          <span className="order-item-qty">×{item.quantity}</span>
                          <span className="order-item-price">
                            ₹{(item.product_price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {order.tracking_id && (
                    <div style={{ 
                      padding: '10px 16px', 
                      background: 'var(--info-bg)', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.85rem',
                      color: 'var(--info)',
                      marginTop: '12px'
                    }}>
                      🚚 Tracking ID: <strong>{order.tracking_id}</strong>
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {order.city}, {order.state} - {order.pincode}
                    </span>
                  </div>
                  <div className="order-total">
                    ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : searched ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">📭</div>
            <h2>No orders found</h2>
            <p>No orders associated with this email address.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="loading-spinner"><div className="spinner"></div></div>}>
      <OrdersContent />
    </Suspense>
  );
}

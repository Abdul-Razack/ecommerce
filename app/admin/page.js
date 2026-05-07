'use client';

import { useState, useEffect } from 'react';

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
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="admin-page-title">📊 Dashboard</h1>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Orders</span>
            <div className="stat-card-icon purple">📦</div>
          </div>
          <div className="stat-card-value">{stats?.totalOrders || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Revenue</span>
            <div className="stat-card-icon green">💰</div>
          </div>
          <div className="stat-card-value">
            ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Profit</span>
            <div className="stat-card-icon yellow">📈</div>
          </div>
          <div className="stat-card-value">
            ₹{(stats?.totalProfit || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Orders</span>
            <div className="stat-card-icon blue">⏳</div>
          </div>
          <div className="stat-card-value">{stats?.pendingOrders || 0}</div>
        </div>
      </div>

      {/* Payment Type Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Online Payments</span>
            <div className="stat-card-icon purple">💳</div>
          </div>
          <div className="stat-card-value">{stats?.onlineOrders || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">COD Orders</span>
            <div className="stat-card-icon yellow">💵</div>
          </div>
          <div className="stat-card-value">{stats?.codOrders || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Delivered</span>
            <div className="stat-card-icon green">✅</div>
          </div>
          <div className="stat-card-value">{stats?.deliveredOrders || 0}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-table-container" style={{ marginTop: '24px' }}>
        <div className="admin-table-header">
          <h3>📦 Recent Orders</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats?.recentOrders?.map((order) => (
              <tr key={order.order_id}>
                <td style={{ fontWeight: 600 }}>{order.order_id}</td>
                <td>
                  <div>{order.user_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.user_email}</div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                  ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}
                </td>
                <td>
                  <span className={`order-status-badge ${order.payment_type === 'online' ? 'delivered' : 'pending'}`}>
                    {order.payment_type === 'online' ? '💳 Online' : '💵 COD'}
                  </span>
                </td>
                <td>
                  <span className={`order-status-badge ${order.order_status}`}>
                    {order.order_status?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </td>
              </tr>
            )) || (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Sales */}
      {stats?.productSales?.length > 0 && (
        <div className="admin-table-container" style={{ marginTop: '24px' }}>
          <div className="admin-table-header">
            <h3>🏆 Top Selling Products</h3>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.productSales.map((product, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 500 }}>{product.product_name}</td>
                  <td>{product.total_sold}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                    ₹{parseFloat(product.total_revenue).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

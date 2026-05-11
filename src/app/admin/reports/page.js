'use client';

import { useState, useEffect } from 'react';

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
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <h1 className="admin-page-title">📈 Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="stats-grid">
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
            <div className="stat-card-icon purple">📈</div>
          </div>
          <div className="stat-card-value">
            ₹{(stats?.totalProfit || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Online Payments</span>
            <div className="stat-card-icon blue">💳</div>
          </div>
          <div className="stat-card-value">{stats?.onlineOrders || 0}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            {stats?.totalOrders ? Math.round((stats.onlineOrders / stats.totalOrders) * 100) : 0}% of total
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">COD Orders</span>
            <div className="stat-card-icon yellow">💵</div>
          </div>
          <div className="stat-card-value">{stats?.codOrders || 0}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
            {stats?.totalOrders ? Math.round((stats.codOrders / stats.totalOrders) * 100) : 0}% of total
          </div>
        </div>
      </div>

      {/* Monthly Sales */}
      <div className="admin-table-container" style={{ marginTop: '24px' }}>
        <div className="admin-table-header">
          <h3>📅 Monthly Sales</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Avg Order Value</th>
            </tr>
          </thead>
          <tbody>
            {stats?.monthlySales?.length > 0 ? (
              stats.monthlySales.map((month, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>
                    {new Date(month.month + '-01').toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </td>
                  <td>{month.order_count}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                    ₹{parseFloat(month.revenue).toLocaleString('en-IN')}
                  </td>
                  <td>
                    ₹{Math.round(parseFloat(month.revenue) / parseInt(month.order_count)).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No sales data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product-wise Sales */}
      <div className="admin-table-container" style={{ marginTop: '24px' }}>
        <div className="admin-table-header">
          <h3>🏆 Product-wise Sales</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Quantity Sold</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats?.productSales?.length > 0 ? (
              stats.productSales.map((product, index) => (
                <tr key={index}>
                  <td>
                    <span style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: index < 3 ? 'var(--accent-primary)' : 'var(--bg-card)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: index < 3 ? 'white' : 'var(--text-secondary)',
                    }}>
                      {index + 1}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{product.product_name}</td>
                  <td>{product.total_sold}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>
                    ₹{parseFloat(product.total_revenue).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No product sales data yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Profit Margin */}
      {stats?.totalRevenue > 0 && (
        <div className="stats-grid" style={{ marginTop: '24px' }}>
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <div className="stat-card-title">Profit Margin</div>
                <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                  {((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="stat-card-title">Revenue</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="stat-card-title">Cost</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--error)' }}>
                  ₹{(stats.totalRevenue - stats.totalProfit).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="stat-card-title">Net Profit</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                  ₹{stats.totalProfit.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

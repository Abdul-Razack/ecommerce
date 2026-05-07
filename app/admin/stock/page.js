'use client';

import { useState, useEffect } from 'react';

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
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>🏪 Stock Management</h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          🔒 Managed via Sanity CMS
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <h3>Product Stock ({stock.length} products)</h3>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Cost Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 500 }}>{item.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {item.sanity_product_id}
                </td>
                <td style={{ fontWeight: 'bold' }}>{item.quantity}</td>
                <td>₹{parseFloat(item.cost_price).toLocaleString('en-IN')}</td>
                <td>
                  {item.quantity === 0 ? (
                    <span className="order-status-badge" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
                      Out of Stock
                    </span>
                  ) : item.quantity < 10 ? (
                    <span className="order-status-badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                      Low Stock
                    </span>
                  ) : (
                    <span className="order-status-badge" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                      In Stock
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {stock.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  No products found. Add products and their stock quantity in Sanity Studio first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

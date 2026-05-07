'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <div className="container">
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started!</p>
            <Link href="/products" className="btn btn-primary">
              Browse Products →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 999 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  return (
    <section className="cart-page">
      <div className="container">
        <h1>Shopping Cart ({getCartCount()} items)</h1>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                <div className="cart-item-info">
                  <div>
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{item.price?.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                    <button
                      className="cart-item-remove"
                      onClick={() => removeFromCart(item._id)}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-summary-row">
              <span className="label">Subtotal ({getCartCount()} items)</span>
              <span className="value">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="cart-summary-row">
              <span className="label">Delivery</span>
              <span className="value" style={{ color: deliveryCharge === 0 ? 'var(--success)' : 'inherit' }}>
                {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
              </span>
            </div>
            {deliveryCharge > 0 && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '4px 0' }}>
                Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free delivery
              </div>
            )}
            <div className="cart-summary-row total">
              <span className="label">Total</span>
              <span className="value" style={{ color: 'var(--accent-secondary)' }}>
                ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
            <Link href="/checkout" className="btn btn-primary btn-lg">
              Proceed to Checkout →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

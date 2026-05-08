'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const { getCartCount, isLoaded } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <span>★ Free Shipping On All Orders Above ₹999 ★ 30% OFF SALE NOW ON ★ Free Shipping On All Orders Above ₹999 ★</span>
      </div>

      <nav className="navbar">
        <div className="navbar-inner">
          <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <li>
              <Link href="/" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/products" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Shop
              </Link>
            </li>
            <li>
              <Link href="/orders" className="navbar-link" onClick={() => setMenuOpen(false)}>
                Orders
              </Link>
            </li>
          </ul>

          <Link href="/" className="navbar-logo">
            ENERGY
          </Link>

          <div className="navbar-actions">
            <Link href="/cart" className="cart-button" aria-label="Cart">
              🛒 Cart
              {isLoaded && getCartCount() > 0 && (
                <span className="cart-badge">{getCartCount()}</span>
              )}
            </Link>

            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

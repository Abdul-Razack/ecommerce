import Link from 'next/link';
import { getProducts, getFeaturedProducts, urlFor } from '@/lib/sanity';
import ProductCardWrapper from '@/components/features/product/ProductCardWrapper';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  let featuredProducts = [];
  let allProducts = [];
  
  try {
    featuredProducts = await getFeaturedProducts();
    allProducts = await getProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">New Collection 2026</div>
            <h1>
              New Arrivals<br />
              <span className="gradient-text">Best Quality</span>
            </h1>
            <p>
              Discover our curated collection of premium activewear. 
              Designed for performance, styled for life.
            </p>
            <div className="hero-actions">
              <Link href="/products" className="btn btn-primary btn-lg">
                Shop Now
              </Link>
              <Link href="/products" className="btn btn-secondary btn-lg">
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="section" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Free Shipping</span>
                <div className="stat-card-icon purple">🚚</div>
              </div>
              <div className="stat-card-value" style={{ fontSize: '1rem', fontWeight: 500 }}>On orders above ₹999</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Secure Payment</span>
                <div className="stat-card-icon green">🔒</div>
              </div>
              <div className="stat-card-value" style={{ fontSize: '1rem', fontWeight: 500 }}>Razorpay Protected</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">COD Available</span>
                <div className="stat-card-icon yellow">💵</div>
              </div>
              <div className="stat-card-value" style={{ fontSize: '1rem', fontWeight: 500 }}>Pay on Delivery</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-title">Easy Returns</span>
                <div className="stat-card-icon blue">↩️</div>
              </div>
              <div className="stat-card-value" style={{ fontSize: '1rem', fontWeight: 500 }}>7 Day Return Policy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header">
              <p className="section-subtitle">Customer Choice</p>
              <h2 className="section-title">Hottest Right Now!</h2>
            </div>
            <ProductCardWrapper products={featuredProducts} />
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle">Browse Collection</p>
            <h2 className="section-title">Discover New Arrivals</h2>
          </div>
          {allProducts.length > 0 ? (
            <ProductCardWrapper products={allProducts} />
          ) : (
            <div className="cart-empty">
              <div className="cart-empty-icon">📦</div>
              <h2>No Products Yet</h2>
              <p>Products will appear here once added through Sanity CMS.</p>
              <Link href="/studio" className="btn btn-primary">
                Go to Sanity Studio
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

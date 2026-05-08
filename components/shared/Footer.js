import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Energy</h3>
            <p>
              Your destination for premium activewear. Designed for performance,
              crafted for comfort, styled for life.
            </p>
          </div>
          
          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Shop</Link></li>
              <li><Link href="/orders">My Orders</Link></li>
              <li><Link href="/cart">Cart</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Refund Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          © {new Date().getFullYear()} Energy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

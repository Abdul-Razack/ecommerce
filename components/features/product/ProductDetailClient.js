'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';

export default function ProductDetailClient({ product }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const images = product.processedImages || [];
  const currentImage = images[selectedImage]?.url || '/placeholder.png';

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: images[0]?.url || '/placeholder.png',
        slug: product.slug,
      });
    }
    showToast(`${product.name} added to cart!`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  return (
    <section className="product-detail">
      <div className="container">
        <div className="product-detail-grid">
          {/* Image Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              <img src={currentImage} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="product-thumbnails">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`product-thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img.thumbnailUrl} alt={`${product.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            {product.category && (
              <div className="product-info-category">{product.category}</div>
            )}
            
            <h1 className="product-info-name">{product.name}</h1>
            
            <div className="product-info-price">
              ₹{product.price?.toLocaleString('en-IN')}
            </div>

            {product.description && (
              <p className="product-info-description">{product.description}</p>
            )}

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail-actions">
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <button className="btn btn-secondary btn-lg" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="mt-4">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span style={{ width: '20px', textAlign: 'center' }}>🚚</span> Free shipping on orders above ₹999
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span style={{ width: '20px', textAlign: 'center' }}>💵</span> Cash on Delivery available (+₹50)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span style={{ width: '20px', textAlign: 'center' }}>↩️</span> 7-day easy returns
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span style={{ width: '20px', textAlign: 'center' }}>🔒</span> Secure Razorpay payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

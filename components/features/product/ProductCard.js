'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { urlFor } from '@/lib/sanity';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const imageUrl = product.images && product.images[0]
    ? urlFor(product.images[0]).width(400).height(530).url()
    : '/placeholder.png';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      slug: product.slug?.current,
    });
  };

  return (
    <div className="product-card">
      <Link href={`/products/${product.slug?.current}`}>
        <div className="product-card-image">
          <img src={imageUrl} alt={product.name} loading="lazy" />
          {product.featured && (
            <span className="product-card-badge">Featured</span>
          )}
        </div>
        <div className="product-card-body">
          {product.category && (
            <div className="product-card-category">{product.category}</div>
          )}
          <h3 className="product-card-name">{product.name}</h3>
          <div className="product-card-price">₹{product.price?.toLocaleString('en-IN')}</div>
        </div>
      </Link>
      <div className="product-card-actions">
        <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>
          Add to Cart
        </button>
        <Link href={`/products/${product.slug?.current}`} className="btn btn-secondary btn-sm">
          View
        </Link>
      </div>
    </div>
  );
}

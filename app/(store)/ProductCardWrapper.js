'use client';

import ProductCard from '@/components/store/ProductCard';

export default function ProductCardWrapper({ products }) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}

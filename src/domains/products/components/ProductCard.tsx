'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useRouter } from 'next/navigation';

/**
 * Tactile Product Card (2026 DTC Overhaul)
 * Features: Rating stars, Compare strike price, Wishlist toggle, and responsive Cart actions.
 */
interface ProductCardProps {
  product: any;
  onQuickView?: any;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
  
  const favorited = isInWishlist(product._id);
  
  // Clean product name
  let cleanName = product.name?.split('-')[0].trim() || 'Premium Product';
  if (/^page \d+$/i.test(cleanName)) {
    const pageNum = cleanName.match(/\d+/)[0];
    cleanName = product.category 
      ? `Premium ${product.category} ${pageNum}` 
      : `Premium Posh Wear ${pageNum}`;
  }

  // Calculate a realistic strike price (comparePrice) if not set
  const originalPrice = product.comparePrice || Math.round(product.price * 1.4);

  return (
    <div className="group flex flex-col h-full bg-bone/50 border border-onyx/5 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative">
      
      {/* Wishlist Toggle Button (Heart) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-zinc-800 rounded-full transition-all border border-zinc-100 shadow-sm hover:scale-110 active:scale-95"
      >
        <svg 
          width="15" 
          height="15" 
          viewBox="0 0 24 24" 
          fill={favorited ? "#DC2626" : "none"} 
          stroke={favorited ? "#DC2626" : "currentColor"} 
          strokeWidth="2.5" 
          className="transition-colors"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-soft border-b border-onyx/5">
        <Link href={`/shop/${product.slug?.current || product.slug}`} className="block w-full h-full">
          <img 
            src={product.imageUrl || (typeof product.image === 'string' ? product.image : null) || 'https://placehold.co/400x500?text=Product'} 
            alt={cleanName}
            className="w-full h-full object-contain p-2 transition-all duration-700 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/400x500?text=Product'; }}
          />
        </Link>

        {/* Badge */}
        {product.flags?.isFeatured && (
          <div className="absolute top-4 left-4 bg-onyx text-bone text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
            Bestseller
          </div>
        )}
      </div>

      {/* Product Details info section */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Category & Ratings row */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-onyx/50 uppercase tracking-wider">
              {product.category || 'General'}
            </span>
            
            {/* Stars rating row */}
            <div className="flex items-center gap-0.5">
              <div className="flex text-chrome text-[10px]">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <span className="text-[8px] text-onyx/50 font-bold ml-1">(5.0)</span>
            </div>
          </div>

          {/* Product Name */}
          <Link href={`/shop/${product.slug?.current || product.slug}`} className="block">
            <h3 className="text-xs font-black uppercase text-onyx tracking-tight leading-tight line-clamp-1 hover:text-onyx/70 transition-colors">
              {cleanName}
            </h3>
          </Link>

          {/* Price details with compare/strike price */}
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-xs font-black text-onyx">₹{product.price}</span>
            {originalPrice > product.price && (
              <span className="text-[10px] text-onyx/40 line-through">₹{originalPrice}</span>
            )}
            {originalPrice > product.price && (
              <span className="text-[9px] text-green-700/80 font-black uppercase">
                {Math.round(((originalPrice - product.price) / originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {(() => {
            const productColors = Array.from(new Set(product.variants?.map(v => v.color).filter(Boolean) || []));
            if (productColors.length === 0) return null;
            return (
              <div className="flex gap-1 pt-1.5">
                {productColors.map((color: any, idx) => {
                  const lowerColor = color.toLowerCase();
                  const colorMap: Record<string, string> = {
                    blue: '#2563EB',
                    grey: '#71717A',
                    gray: '#71717A',
                    red: '#DC2626',
                    yellow: '#FBBF24',
                    black: '#000000',
                    white: '#FFFFFF',
                    gold: '#C5A059',
                  };
                  const bgVal = colorMap[lowerColor] || lowerColor;
                  return (
                    <span 
                      key={idx} 
                      className="w-2.5 h-2.5 rounded-full border border-black/10 shadow-sm inline-block"
                      style={{ backgroundColor: bgVal }}
                      title={color}
                    />
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Action Buttons: Add to Cart and Buy Now */}
        <div className="flex gap-2 pt-2 border-t border-onyx/5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
            }}
            className="w-1/2 h-9 text-[8px] tracking-widest font-black bg-transparent hover:bg-onyx/5 border border-onyx/10 text-onyx uppercase transition-all rounded-full active:scale-95"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product);
              router.push('/cart');
            }}
            className="w-1/2 h-9 text-[8px] tracking-widest font-black bg-onyx hover:bg-black text-bone uppercase transition-all rounded-full active:scale-95 shadow-sm"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

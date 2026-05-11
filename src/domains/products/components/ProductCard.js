'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

/**
 * Tactile Product Card (2026 DTC Overhaul)
 * Features: Onyx typography, spring-hover effects, and sanitized titles.
 */
export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  
  // Clean product name (Remove suffixes like - page_018)
  const cleanName = product.name?.split('-')[0].trim() || 'Experimental Silhouette';

  return (
    <div className="group flex flex-col h-full">
      {/* Image Layer with High-Class Effects */}
      <Link 
        href={`/shop/${product.slug?.current || product.slug}`}
        className="relative aspect-[4/5] rounded-super overflow-hidden bg-white tactile-card group/asset block"
      >
        <img 
          src={product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop'} 
          alt={cleanName}
          className="w-full h-full object-cover transition-all duration-[2s] group-hover/asset:scale-105 liquid-refract"
        />
        
        {/* Rapid Action Overlay (Solar Chrome) */}
        <div className="absolute inset-0 bg-onyx/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="pointer-events-auto h-20 w-20 rounded-full bg-chrome text-onyx flex items-center justify-center hover:scale-110 active:scale-90 transition-all hover:shadow-chrome border border-white/20"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
        </div>

        {/* Badge */}
        {product.flags?.isFeatured && (
          <div className="absolute top-6 left-6 technical bg-onyx text-white px-4 py-1.5 rounded-full">
            Top_Tier
          </div>
        )}
      </Link>

      {/* Info Layer: Refined Hierarchy */}
      <div className="mt-8 px-2 space-y-4">
        <div className="flex justify-between items-baseline border-b border-onyx/5 pb-4">
          <h3 className="text-[12px] font-black uppercase tracking-tight leading-none group-hover:text-chrome transition-colors">
            {cleanName}
          </h3>
          <span className="technical text-onyx font-bold opacity-100">₹{product.price}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="technical opacity-30">{product.category || 'Series_Experimental'}</p>
          <span className="technical text-[8px] opacity-20 group-hover:opacity-100 transition-opacity tracking-widest">Deploy_Silhouette</span>
        </div>
      </div>
    </div>
  );
}

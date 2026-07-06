'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

/**
 * Tactile Product Card (2026 DTC Overhaul)
 * Features: Onyx typography, spring-hover effects, and sanitized titles.
 */
export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart();
  
  // Clean product name (Remove suffixes like - page_018 and format "Page XX")
  let cleanName = product.name?.split('-')[0].trim() || 'Premium Product';
  if (/^page \d+$/i.test(cleanName)) {
    const pageNum = cleanName.match(/\d+/)[0];
    cleanName = product.category 
      ? `Premium ${product.category} ${pageNum}` 
      : `Premium Posh Wear ${pageNum}`;
  }

  return (
    <div className="group flex flex-col h-full animate-deploy">
      {/* Image Layer with High-Class Effects */}
      <div className="relative aspect-[4/5] rounded-super overflow-hidden bg-white tactile-card group/asset block">
        <Link href={`/shop/${product.slug?.current || product.slug}`}>
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop'} 
            alt={cleanName}
            className="w-full h-full object-cover transition-all duration-[2s] group-hover/asset:scale-105 liquid-refract"
          />
        </Link>
        
        {/* Rapid Action Overlay (Solar Chrome) */}
        <div className="absolute inset-0 bg-onyx/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 pointer-events-none">
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="pointer-events-auto h-16 w-16 rounded-full bg-chrome text-onyx flex items-center justify-center hover:scale-110 active:scale-90 transition-all hover:shadow-chrome border border-white/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </button>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              onQuickView?.(product);
            }}
            className="pointer-events-auto h-16 w-16 rounded-full bg-white text-onyx flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl border border-onyx/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
            </svg>
          </button>
        </div>

        {/* Badge */}
        {product.flags?.isFeatured && (
          <div className="absolute top-6 left-6 technical bg-onyx text-white px-4 py-1.5 rounded-full">
            Bestseller
          </div>
        )}
      </div>

      {/* Info Layer: Refined Hierarchy */}
      <div className="mt-8 px-2 space-y-4">
        <div className="flex justify-between items-baseline border-b border-onyx/5 pb-4">
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-tight leading-none group-hover:text-chrome transition-colors">
              {cleanName}
            </h3>
            {/* Color Swatches */}
            {(() => {
              const productColors = Array.from(new Set(product.variants?.map(v => v.color).filter(Boolean) || []));
              if (productColors.length === 0) return null;
              return (
                <div className="flex gap-1.5 mt-2">
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
                        className="w-2 h-2 rounded-full border border-black/10 shadow-sm inline-block"
                        style={{ backgroundColor: bgVal }}
                        title={color}
                      />
                    );
                  })}
                </div>
              );
            })()}
          </div>
          <span className="technical text-onyx font-bold opacity-100">₹{product.price}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-4 h-px bg-onyx/20" />
            <p className="technical text-[9px] uppercase tracking-widest text-onyx/60">
              {product.category || 'General'}
            </p>
          </div>
          <button 
            onClick={() => onQuickView?.(product)}
            className="technical text-[8px] opacity-20 hover:opacity-100 hover:text-chrome transition-all tracking-widest uppercase"
          >
            Quick View
          </button>
        </div>
      </div>
    </div>
  );
}

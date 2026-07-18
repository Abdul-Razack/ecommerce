'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

interface Variant {
  color: string;
  size: string;
  stock: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  stock: number;
  description: string;
  imageUrl?: string;
  category: string;
  categoryId: string;
  variants?: Variant[];
}

interface TabbedCategoryGridProps {
  initialProducts: Product[];
}

const CATEGORIES = ["All", "Leggings", "Nighty", "Inskirt", "Sarees"];

// Custom SVG Icons for categories to match screenshot style
const CategoryIcon = ({ name }: { name: string }) => {
  if (name === 'All') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  if (name === 'Leggings') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M7 2L5 22h4l1-10 1 10h4l-2-20H7z" />
      </svg>
    );
  }
  if (name === 'Nighty') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M6 2L3 8v12a2 2 0 002 2h14a2 2 0 002-2V8l-3-6H6z" />
        <path d="M3 8h18" />
      </svg>
    );
  }
  if (name === 'Inskirt') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M4 4h16l-2 16H6L4 4z" />
      </svg>
    );
  }
  if (name === 'Sarees') {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return null;
};

export default function TabbedCategoryGrid({ initialProducts }: TabbedCategoryGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { addToCart } = useCart();

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return initialProducts;
    return initialProducts.filter(p => p.category === activeCategory);
  }, [initialProducts, activeCategory]);

  return (
    <div className="space-y-12">
      {/* Category Icons Navigation */}
      <div className="flex justify-center items-center gap-6 md:gap-12 overflow-x-auto py-4 hide-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex flex-col items-center gap-3 group focus:outline-none flex-shrink-0"
            >
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                isActive 
                  ? 'border-chrome bg-chrome text-white scale-110 shadow-md' 
                  : 'border-zinc-200 text-zinc-400 group-hover:border-black group-hover:text-black'
              }`}>
                <CategoryIcon name={cat} />
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-black ${
                isActive ? 'text-black font-black border-b-2 border-chrome pb-1' : 'text-zinc-500'
              }`}>
                {cat}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Products Grid */}
      <div>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => {
              const cleanName = product.name?.split('-')[0].trim() || 'Premium Apparel';
              
              return (
                <div 
                  key={product._id} 
                  className="group relative flex flex-col justify-between bg-[#F8F6F4] hover:bg-[#F0ECE7] p-4 rounded-3xl transition-all duration-500 hover:shadow-xl overflow-hidden border border-zinc-100/50"
                >
                  {/* Badges / Discount */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                    {product.comparePrice && product.comparePrice > product.price ? (
                      <span className="text-[8px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                      </span>
                    ) : null}
                    {product.stock === 0 ? (
                      <span className="text-[8px] bg-zinc-950 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        OUT OF STOCK
                      </span>
                    ) : (
                      <span className="text-[8px] bg-green-700 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </div>

                  {/* Image Container with Link */}
                  <Link href={`/shop/${product.slug}`} className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white flex items-center justify-center relative block">
                    <img 
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop'} 
                      alt={cleanName}
                      className="w-full h-full object-contain p-2 transition-all duration-1000 group-hover:scale-105"
                    />
                  </Link>

                  {/* Details Layer */}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-[11px] font-black uppercase text-zinc-900 tracking-tight line-clamp-1">
                      {cleanName}
                    </h4>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-zinc-900">₹{product.price.toLocaleString('en-IN')}</span>
                      
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product);
                        }}
                        className="text-[9px] bg-white border border-zinc-200 text-zinc-950 font-black px-3 py-1.5 rounded-full hover:bg-black hover:text-white hover:border-black transition-colors uppercase tracking-wider shadow-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <p className="editorial italic text-3xl text-zinc-300">No Products in {activeCategory}</p>
            <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest text-chrome hover:underline">
              Browse Store Catalog →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

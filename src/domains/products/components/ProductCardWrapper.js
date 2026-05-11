'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import Container from '@/shared/ui/layout/Container';

/**
 * ModernProductCardWrapper (Onyx & Bone Overhaul)
 * Features: Asymmetrical Bento Grid 2.0, refined kinetic filters.
 */
export default function ProductCardWrapper({ products }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [category, setCategory] = useState(initialCategory);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [products]);

  const filteredAndSorted = useMemo(() => {
    let result = [...products];
    if (debouncedSearch) {
      const lower = debouncedSearch.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lower));
    }
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, debouncedSearch, sortBy, category]);

  return (
    <div className="flex flex-col gap-24">
      {/* 2026 Kinetic Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-onyx/5 pb-16">
        <div className="space-y-4">
          <p className="technical text-onyx/30">Registry_Directory // {filteredAndSorted.length}_Units</p>
          <div className="flex items-center gap-6">
            <h2 className="text-5xl font-black text-onyx leading-none">
              {category === 'all' ? 'The Collective' : category}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-12 items-center">
          {/* Search Injector */}
          <div className="group border-b border-onyx/10 focus-within:border-acid transition-all duration-700 pb-3 w-64">
            <input 
              type="text"
              placeholder="SEARCH CATALOGUE" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent technical text-onyx focus:outline-none placeholder:text-onyx/20"
            />
          </div>

          {/* Precision Selectors */}
          <div className="flex gap-10">
            <div className="flex flex-col gap-3">
              <span className="technical text-onyx/20 text-[8px]">Series_Filter</span>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Series' : c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <span className="technical text-onyx/20 text-[8px]">Order_By</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="newest">Chronological</option>
                <option value="price-low">Value: Low-High</option>
                <option value="price-high">Value: High-Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid 2.0 (Asymmetrical Scaling) */}
      {filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 grid-auto-flow-dense gap-8 md:gap-12">
          {filteredAndSorted.map((product, idx) => (
            <div key={product._id} className={idx === 0 || idx === 7 ? 'md:col-span-2 md:row-span-1' : ''}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-40 text-center space-y-8">
          <p className="editorial italic text-4xl text-onyx/20">Empty Manifest</p>
          <button 
            onClick={() => {setCategory('all'); setSearchTerm('');}}
            className="technical font-black underline underline-offset-8 decoration-acid decoration-4"
          >
            Reset Directory
          </button>
        </div>
      )}
    </div>
  );
}

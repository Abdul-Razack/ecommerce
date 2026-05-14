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
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const categories = useMemo(() => {
    const predefined = [
      'Polo Patiala',
      'Two Way Pant Legging',
      'MTS Churidar Leggings',
      'Capri Leggings',
      'Ankle Length Leggings',
      'Normal Leggings',
      'Ankle Rib Leggings',
      'Ankle Leggings (Pocket)',
      'Shimmer Leggings',
      'Palazo',
      'Ankitha Cigarette Pant',
      'Tight Two Way Leggings',
      'Cycling Leggings'
    ];
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    const existing = Array.from(cats);
    
    // Filter out any from active list that are already predefined
    const otherCats = existing.filter(cat => !predefined.includes(cat));
    
    return ['all', ...predefined, ...otherCats];
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
    <div className="flex flex-col gap-24 relative">
      {/* 2026 Kinetic Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-onyx/5 pb-16">
        <div className="space-y-4">
          <p className="technical text-onyx/30">Shop Directory // {filteredAndSorted.length} Items</p>
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
              <span className="technical text-onyx/20 text-[8px]">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <span className="technical text-onyx/20 text-[8px]">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-black text-[10px] uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Value: Low-High</option>
                <option value="price-high">Value: High-Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Sectioned Catalog (Grouping by Series) */}
      {filteredAndSorted.length > 0 ? (
        <div className="space-y-40">
          {categories.filter(c => category === 'all' || c === category).map((catName) => {
            const productsInCat = filteredAndSorted.filter(p => (p.category || 'Standard_Issue') === catName || (catName === 'all' && !p.category));
            if (productsInCat.length === 0) return null;
            if (catName === 'all' && category !== 'all') return null;

            return (
              <div key={catName} className="space-y-16">
                {/* Section Sub-Heading */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-onyx">
                    {catName === 'all' ? 'The Collective' : catName}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="h-[2px] w-8 bg-chrome" />
                    <span className="technical text-[9px] font-bold tracking-[0.2em] text-onyx/30">
                      {productsInCat.length} ITEMS AVAILABLE
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16">
                  {productsInCat.map((product, idx) => {
                    const isHero = idx % 5 === 0;
                    return (
                      <div
                        key={product._id}
                        className={`${isHero ? 'md:col-span-2' : ''}`}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <ProductCard product={product} onQuickView={setSelectedProduct} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-40 text-center space-y-8">
          <p className="editorial italic text-4xl text-onyx/20">No Products Found</p>
          <button
            onClick={() => { setCategory('all'); setSearchTerm(''); }}
            className="technical font-black underline underline-offset-8 decoration-acid decoration-4"
          >
            Reset Directory
          </button>
        </div>
      )}

      {/* Quick View Overlay (Silhouette Deployment) */}
      <div
        onClick={() => setSelectedProduct(null)}
        className={`fixed inset-0 z-[200] transition-all duration-700 ${selectedProduct ? 'bg-onyx/20 backdrop-blur-sm opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-bone shadow-2xl transition-transform duration-700 ease-out ${selectedProduct ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {selectedProduct && (
            <div className="h-full flex flex-col p-8 overflow-y-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="self-end technical text-[9px] font-black tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity mb-8"
              >
                CLOSE [X]
              </button>

              <div className="space-y-8">
                <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden shadow-tactile">
                  <img
                    src={selectedProduct.imageUrl}
                    className="w-full h-full object-cover"
                    alt={selectedProduct.name}
                  />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-onyx/10 pb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="h-4 w-[2px] bg-chrome" />
                        <span className="technical text-[9px] font-black uppercase tracking-[0.2em] text-onyx">
                          {selectedProduct.category || 'General'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">
                        {selectedProduct.name?.split('-')[0].trim()}
                      </h3>
                    </div>
                    <span className="text-xl font-black">₹{selectedProduct.price}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-4">
                    <div>
                      <p className="technical text-[7px] opacity-30 uppercase tracking-widest mb-1">Construction</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider">Heavy-Duty // 450 GSM</p>
                    </div>
                    <div>
                      <p className="technical text-[7px] opacity-30 uppercase tracking-widest mb-1">Series</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider">Premium_v26</p>
                    </div>
                    <div>
                      <p className="technical text-[7px] opacity-30 uppercase tracking-widest mb-1">Performance</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider">High Quality</p>
                    </div>
                    <div>
                      <p className="technical text-[7px] opacity-30 uppercase tracking-widest mb-1">Status</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-chrome">Available</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Logic to add to bag from quick view would go here
                      setSelectedProduct(null);
                    }}
                    className="w-full h-16 bg-onyx text-white technical text-[9px] font-black tracking-[0.4em] rounded-full hover:bg-chrome hover:text-onyx transition-all shadow-kinetic uppercase"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes deploy {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-deploy {
          animation: deploy 0.8s cubic-bezier(0.2, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}

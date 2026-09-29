'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { useCurrency } from '@/providers/CurrencyProvider';

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

interface ProductCardWrapperProps {
  products: Product[];
}

const COLOR_OPTIONS = [
  { name: 'All Colors', hex: null },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Grey', hex: '#71717A' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Yellow', hex: '#FBBF24' },
  { name: 'Black', hex: '#000000' },
  { name: 'Gold', hex: '#C5A059' }
];

const SIZE_OPTIONS = ["All Sizes", "XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];

const PRICE_OPTIONS = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: 'Over ₹2000', min: 2000, max: Infinity }
];

const SORT_OPTIONS = [
  { label: 'Default Sorting', value: 'default' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' }
];

const ITEMS_PER_PAGE = 8;

export default function ProductCardWrapper({ products }: ProductCardWrapperProps) {
  const { formatPrice } = useCurrency();

  const priceOptions = useMemo(() => [
    { label: 'All Prices', min: 0, max: Infinity },
    { label: `Under ${formatPrice(500)}`, min: 0, max: 500 },
    { label: `${formatPrice(500)} - ${formatPrice(1000)}`, min: 500, max: 1000 },
    { label: `${formatPrice(1000)} - ${formatPrice(2000)}`, min: 1000, max: 2000 },
    { label: `Over ${formatPrice(2000)}`, min: 2000, max: Infinity }
  ], [formatPrice]);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All Colors');
  const [selectedSize, setSelectedSize] = useState<string>('All Sizes');
  const [selectedPrice, setSelectedPrice] = useState<number>(0); // Index of price option
  const [selectedSort, setSelectedSort] = useState<string>('default');
  
  // Layout column state (2, 3, or 4 columns)
  const [gridCols, setGridCols] = useState<number>(4);
  
  // Pagination & Load More state (Myntra Standard)
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadedCount, setLoadedCount] = useState<number>(PAGE_SIZE);
  
  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Extract unique categories in products
  const categoriesList = useMemo(() => {
    const list = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Color Filter
    if (selectedColor !== 'All Colors') {
      result = result.filter(p => 
        p.variants?.some(v => v.color.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    // Size Filter
    if (selectedSize !== 'All Sizes') {
      result = result.filter(p => 
        p.variants?.some(v => v.size === selectedSize)
      );
    }

    // Price Filter
    const priceRange = priceOptions[selectedPrice];
    if (priceRange) {
      result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    }

    // Sort Logic
    if (selectedSort === 'price-low') {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (selectedSort === 'price-high') {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }

    return result;
  }, [products, selectedCategory, selectedColor, selectedSize, selectedPrice, selectedSort, priceOptions]);

  // Reset pagination & loaded count if filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setLoadedCount(PAGE_SIZE);
  }, [selectedCategory, selectedColor, selectedSize, selectedPrice, selectedSort]);

  const totalItems = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Determine which products to show (supports both continuous Load More and direct page jumping)
  const paginatedProducts = useMemo(() => {
    if (currentPage === 1) {
      return filteredAndSorted.slice(0, loadedCount);
    }
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredAndSorted, currentPage, loadedCount]);

  const currentlyShownCount = paginatedProducts.length;

  const hasActiveFilters = selectedCategory !== 'All' || selectedColor !== 'All Colors' || selectedSize !== 'All Sizes' || selectedPrice !== 0;

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedColor('All Colors');
    setSelectedSize('All Sizes');
    setSelectedPrice(0);
    setSelectedSort('default');
    setOpenDropdown(null);
  };

  return (
    <div className="space-y-6 sm:space-y-12">
      
      {/* Click-away backdrop overlay when dropdown is open */}
      {openDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[1px]" 
          onClick={() => setOpenDropdown(null)} 
        />
      )}

      {/* Modern Filter & Control Bar */}
      <div className="border-b border-onyx/10 pb-3 sm:pb-5 relative z-40">
        
        {/* Mobile Filter & Sort Rail (Horizontal Scrollable Chips) */}
        <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-1.5 hide-scrollbar">
          {/* Clear Filters Reset Pill (first pill when any filter is active) */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex-shrink-0 px-3 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 text-[9.5px] font-black uppercase tracking-wider shadow-xs hover:bg-red-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>✕</span>
              <span>Reset</span>
            </button>
          )}

          {/* Sort Pill */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleDropdown('sort')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[9.5px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                selectedSort !== 'default' 
                  ? 'bg-onyx text-bone border-onyx' 
                  : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
              }`}
            >
              <span>⇅</span>
              <span>{SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label.replace(' Sorting', '')}</span>
              <span className="text-[7px]">▼</span>
            </button>
          </div>

          {/* Category Pill */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleDropdown('categories')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[9.5px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                selectedCategory !== 'All' 
                  ? 'bg-onyx text-bone border-onyx' 
                  : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
              }`}
            >
              <span>Category{selectedCategory !== 'All' ? `: ${selectedCategory}` : ''}</span>
              <span className="text-[7px]">▼</span>
            </button>
          </div>

          {/* Price Pill */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleDropdown('prices')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[9.5px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                selectedPrice !== 0 
                  ? 'bg-onyx text-bone border-onyx' 
                  : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
              }`}
            >
              <span>{selectedPrice !== 0 ? priceOptions[selectedPrice]?.label : 'Price'}</span>
              <span className="text-[7px]">▼</span>
            </button>
          </div>

          {/* Color Pill */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleDropdown('colors')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[9.5px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                selectedColor !== 'All Colors' 
                  ? 'bg-onyx text-bone border-onyx' 
                  : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
              }`}
            >
              <span>{selectedColor !== 'All Colors' ? selectedColor : 'Color'}</span>
              <span className="text-[7px]">▼</span>
            </button>
          </div>

          {/* Size Pill */}
          <div className="flex-shrink-0">
            <button
              onClick={() => toggleDropdown('sizes')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[9.5px] font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
                selectedSize !== 'All Sizes' 
                  ? 'bg-onyx text-bone border-onyx' 
                  : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
              }`}
            >
              <span>{selectedSize !== 'All Sizes' ? selectedSize : 'Size'}</span>
              <span className="text-[7px]">▼</span>
            </button>
          </div>
        </div>

        {/* Mobile Filter Sheet Modal Overlay */}
        {openDropdown !== null && (
          <div className="md:hidden">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[180] animate-in fade-in duration-200"
              onClick={() => setOpenDropdown(null)}
            />
            <div className="fixed inset-x-4 bottom-24 max-w-sm mx-auto bg-white border border-onyx/10 shadow-2xl rounded-3xl p-4 z-[190] animate-in slide-in-from-bottom-4 duration-200 flex flex-col max-h-[60vh]">
              <div className="flex items-center justify-between px-2 pb-3 border-b border-onyx/10">
                <span className="text-[10px] font-black uppercase tracking-widest text-chrome">
                  {openDropdown === 'sort' && 'Sort By'}
                  {openDropdown === 'categories' && 'Filter by Category'}
                  {openDropdown === 'prices' && 'Price Range'}
                  {openDropdown === 'colors' && 'Select Color'}
                  {openDropdown === 'sizes' && 'Select Size'}
                </span>
                <button 
                  onClick={() => setOpenDropdown(null)}
                  className="w-7 h-7 rounded-full bg-neutral-soft text-onyx font-bold flex items-center justify-center text-xs hover:bg-onyx hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar">
                {openDropdown === 'sort' && SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSelectedSort(opt.value); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                      selectedSort === opt.value ? 'text-chrome font-black bg-neutral-soft' : 'text-onyx/80 hover:bg-neutral-soft/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedSort === opt.value && <span className="text-chrome font-black">✓</span>}
                  </button>
                ))}

                {openDropdown === 'categories' && categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                      selectedCategory === cat ? 'text-chrome font-black bg-neutral-soft' : 'text-onyx/80 hover:bg-neutral-soft/50'
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <span className="text-chrome font-black">✓</span>}
                  </button>
                ))}

                {openDropdown === 'prices' && priceOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedPrice(idx); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                      selectedPrice === idx ? 'text-chrome font-black bg-neutral-soft' : 'text-onyx/80 hover:bg-neutral-soft/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedPrice === idx && <span className="text-chrome font-black">✓</span>}
                  </button>
                ))}

                {openDropdown === 'colors' && COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => { setSelectedColor(opt.name); setOpenDropdown(null); }}
                    className={`w-full flex items-center justify-between text-left px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                      selectedColor === opt.name ? 'text-chrome font-black bg-neutral-soft' : 'text-onyx/80 hover:bg-neutral-soft/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {opt.hex && (
                        <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: opt.hex }} />
                      )}
                      <span>{opt.name}</span>
                    </div>
                    {selectedColor === opt.name && <span className="text-chrome font-black">✓</span>}
                  </button>
                ))}

                {openDropdown === 'sizes' && SIZE_OPTIONS.map(sz => (
                  <button
                    key={sz}
                    onClick={() => { setSelectedSize(sz); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider flex items-center justify-between transition-colors cursor-pointer ${
                      selectedSize === sz ? 'text-chrome font-black bg-neutral-soft' : 'text-onyx/80 hover:bg-neutral-soft/50'
                    }`}
                  >
                    <span>{sz}</span>
                    {selectedSize === sz && <span className="text-chrome font-black">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filter & Control Bar */}
        <div className="hidden md:flex items-center justify-between gap-6">
          {/* Left Side: Filter Dropdowns as clean pill buttons */}
          <div className="flex items-center gap-3 text-[11px] font-bold text-onyx uppercase tracking-wider flex-wrap">
            <span className="text-onyx/40 font-black text-[10px] tracking-widest mr-1">Filter by</span>

            {/* Categories */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('categories')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedCategory !== 'All' 
                    ? 'bg-onyx text-white border-onyx' 
                    : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
                }`}
              >
                <span>Category{selectedCategory !== 'All' ? `: ${selectedCategory}` : ''}</span>
                <span className="text-[8px]">▼</span>
              </button>
              {openDropdown === 'categories' && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-onyx/10 shadow-xl py-2 rounded-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {categoriesList.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-soft/50 text-[10px] uppercase font-bold tracking-widest flex items-center justify-between ${
                        selectedCategory === cat ? 'text-chrome font-black bg-neutral-soft/30' : 'text-onyx/80'
                      }`}
                    >
                      <span>{cat}</span>
                      {selectedCategory === cat && <span className="text-chrome">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('colors')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedColor !== 'All Colors' 
                    ? 'bg-onyx text-white border-onyx' 
                    : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
                }`}
              >
                <span>Color{selectedColor !== 'All Colors' ? `: ${selectedColor}` : ''}</span>
                <span className="text-[8px]">▼</span>
              </button>
              {openDropdown === 'colors' && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-onyx/10 shadow-xl py-2 rounded-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {COLOR_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      onClick={() => { setSelectedColor(opt.name); setOpenDropdown(null); }}
                      className={`w-full flex items-center justify-between text-left px-4 py-2 hover:bg-neutral-soft/50 text-[10px] uppercase font-bold tracking-widest ${
                        selectedColor === opt.name ? 'text-chrome font-black bg-neutral-soft/30' : 'text-onyx/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {opt.hex && (
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: opt.hex }} />
                        )}
                        <span>{opt.name}</span>
                      </div>
                      {selectedColor === opt.name && <span className="text-chrome">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Size */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('sizes')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedSize !== 'All Sizes' 
                    ? 'bg-onyx text-white border-onyx' 
                    : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
                }`}
              >
                <span>Size{selectedSize !== 'All Sizes' ? `: ${selectedSize}` : ''}</span>
                <span className="text-[8px]">▼</span>
              </button>
              {openDropdown === 'sizes' && (
                <div className="absolute left-0 mt-2 w-44 bg-white border border-onyx/10 shadow-xl py-2 rounded-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {SIZE_OPTIONS.map(sz => (
                    <button
                      key={sz}
                      onClick={() => { setSelectedSize(sz); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-soft/50 text-[10px] uppercase font-bold tracking-widest flex items-center justify-between ${
                        selectedSize === sz ? 'text-chrome font-black bg-neutral-soft/30' : 'text-onyx/80'
                      }`}
                    >
                      <span>{sz}</span>
                      {selectedSize === sz && <span className="text-chrome">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('prices')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedPrice !== 0 
                    ? 'bg-onyx text-white border-onyx' 
                    : 'bg-white border-onyx/15 text-onyx hover:border-onyx/40'
                }`}
              >
                <span>{selectedPrice !== 0 ? priceOptions[selectedPrice]?.label : 'Price'}</span>
                <span className="text-[8px]">▼</span>
              </button>
              {openDropdown === 'prices' && (
                <div className="absolute left-0 mt-2 w-52 bg-white border border-onyx/10 shadow-xl py-2 rounded-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {priceOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setSelectedPrice(idx); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-soft/50 text-[10px] uppercase font-bold tracking-widest flex items-center justify-between ${
                        selectedPrice === idx ? 'text-chrome font-black bg-neutral-soft/30' : 'text-onyx/80'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedPrice === idx && <span className="text-chrome">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear All Button on Desktop */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-red-600 hover:text-red-800 transition-colors"
              >
                ✕ Clear All
              </button>
            )}
          </div>

          {/* Right Side: Layout Grid & Sorting */}
          <div className="flex items-center gap-5 text-[11px] font-bold uppercase tracking-widest">
            {/* Sorting Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('sort')}
                className="hover:text-black text-onyx/80 flex items-center gap-2 border border-onyx/15 bg-white px-4 py-2 rounded-full transition-all hover:border-onyx/40 select-none shadow-xs text-[10px]"
              >
                <span>{SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label}</span>
                <span className="text-[8px]">▼</span>
              </button>
              {openDropdown === 'sort' && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-onyx/10 shadow-xl py-2 rounded-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSelectedSort(opt.value); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2 hover:bg-neutral-soft/50 text-[10px] uppercase font-bold tracking-widest flex items-center justify-between ${
                        selectedSort === opt.value ? 'text-chrome font-black bg-neutral-soft/30' : 'text-onyx/80'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedSort === opt.value && <span className="text-chrome">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid Layout Switcher */}
            <div className="flex items-center gap-1.5 border-l border-onyx/10 pl-5 h-6">
              {/* 2 Cols */}
              <button 
                onClick={() => setGridCols(2)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  gridCols === 2 ? 'border-onyx bg-onyx text-white shadow-xs' : 'border-onyx/15 text-onyx/40 hover:text-onyx'
                }`}
                title="2 Columns Grid"
              >
                <span className="font-mono text-xs leading-none select-none tracking-tight">||</span>
              </button>
              {/* 3 Cols */}
              <button 
                onClick={() => setGridCols(3)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  gridCols === 3 ? 'border-onyx bg-onyx text-white shadow-xs' : 'border-onyx/15 text-onyx/40 hover:text-onyx'
                }`}
                title="3 Columns Grid"
              >
                <span className="font-mono text-xs leading-none select-none tracking-tight">|||</span>
              </button>
              {/* 4 Cols */}
              <button 
                onClick={() => setGridCols(4)}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                  gridCols === 4 ? 'border-onyx bg-onyx text-white shadow-xs' : 'border-onyx/15 text-onyx/40 hover:text-onyx'
                }`}
                title="4 Columns Grid"
              >
                <span className="font-mono text-xs leading-none select-none tracking-tight">||||</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Display Grid */}
      <div>
        {paginatedProducts.length > 0 ? (
          <div id="products-grid" className={`grid gap-3 sm:gap-6 md:gap-x-8 md:gap-y-12 transition-all duration-500 scroll-mt-24 ${
            gridCols === 2 
              ? 'grid-cols-2 max-w-4xl mx-auto' 
              : gridCols === 3 
                ? 'grid-cols-2 md:grid-cols-3' 
                : 'grid-cols-2 md:grid-cols-4'
          }`}>
            {paginatedProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onQuickView={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center space-y-4">
            <p className="editorial italic text-3xl text-zinc-300">No Products Match Filters</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedColor('All Colors');
                setSelectedSize('All Sizes');
                setSelectedPrice(0);
                setSelectedSort('default');
              }}
              className="text-[10px] font-black uppercase tracking-widest text-chrome hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Myntra-Standard Catalog Loader & Pagination */}
      {totalItems > 0 && (
        <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center text-center space-y-4 py-5 sm:py-6 px-4 sm:px-6 rounded-3xl bg-neutral-soft/50 border border-onyx/5 shadow-2xs">
          {/* Progress Indicator */}
          <div className="space-y-2 max-w-xs w-full">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-onyx/60">
              Showing <span className="font-black text-onyx">{currentlyShownCount}</span> of{' '}
              <span className="font-black text-onyx">{totalItems}</span> Products
            </p>
            <div className="w-full h-1.5 bg-onyx/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-onyx rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.round((currentlyShownCount / totalItems) * 100))}%` }}
              />
            </div>
          </div>

          {/* Load More Button (Myntra Standard) */}
          {currentPage === 1 && currentlyShownCount < totalItems && (
            <button
              type="button"
              onClick={() => setLoadedCount(prev => Math.min(totalItems, prev + PAGE_SIZE))}
              className="w-full sm:w-auto px-8 py-3.5 bg-onyx hover:bg-black text-bone rounded-full text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Load More Products</span>
              <span className="text-bone/60 font-semibold text-[10px]">
                ({totalItems - currentlyShownCount} more)
              </span>
            </button>
          )}

          {/* Page Switcher Navigation (Clean Modern Pills) */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2 pt-1 select-none">
              <button
                type="button"
                onClick={() => {
                  const prevPage = Math.max(1, currentPage - 1);
                  setCurrentPage(prevPage);
                  setLoadedCount(PAGE_SIZE);
                  const gridEl = document.getElementById('products-grid');
                  if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={currentPage <= 1}
                className="px-3.5 h-9 rounded-full border border-onyx/10 bg-white text-onyx font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-onyx hover:text-bone disabled:opacity-25 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1 sm:gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                  const isActive = pg === currentPage;
                  return (
                    <button
                      key={pg}
                      onClick={() => {
                        setCurrentPage(pg);
                        setLoadedCount(PAGE_SIZE);
                        const gridEl = document.getElementById('products-grid');
                        if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                        isActive
                          ? 'bg-onyx text-bone shadow-sm scale-105'
                          : 'bg-white border border-onyx/10 text-onyx hover:bg-neutral-soft'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  const nextPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(nextPage);
                  setLoadedCount(PAGE_SIZE);
                  const gridEl = document.getElementById('products-grid');
                  if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={currentPage >= totalPages}
                className="px-3.5 h-9 rounded-full border border-onyx/10 bg-white text-onyx font-bold text-[10px] sm:text-xs uppercase tracking-wider hover:bg-onyx hover:text-bone disabled:opacity-25 disabled:pointer-events-none transition-all shadow-2xs cursor-pointer"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

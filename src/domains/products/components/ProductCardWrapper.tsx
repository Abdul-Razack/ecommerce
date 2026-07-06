'use client';

import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';

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

const SIZE_OPTIONS = ["All Sizes", "XS", "S", "M", "L", "XL", "XXL"];

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
  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string>('All Colors');
  const [selectedSize, setSelectedSize] = useState<string>('All Sizes');
  const [selectedPrice, setSelectedPrice] = useState<number>(0); // Index of price option
  const [selectedSort, setSelectedSort] = useState<string>('default');
  
  // Layout column state (2, 3, or 4 columns)
  const [gridCols, setGridCols] = useState<number>(4);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  
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
    const priceRange = PRICE_OPTIONS[selectedPrice];
    if (priceRange) {
      result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);
    }

    // Sort Logic
    if (selectedSort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (selectedSort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, selectedColor, selectedSize, selectedPrice, selectedSort]);

  // Reset pagination if filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedColor, selectedSize, selectedPrice, selectedSort]);

  // Paginated List
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredAndSorted, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-16">
      
      {/* Filters & Control bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-100 pb-6 relative z-50">
        
        {/* Left Side: Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
          <span className="text-zinc-400">Filter by</span>

          {/* Categories Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('categories')}
              className={`hover:text-black flex items-center gap-1 transition-colors ${selectedCategory !== 'All' ? 'text-black' : ''}`}
            >
              Categories ({selectedCategory}) <span className="text-[8px] font-bold">▼</span>
            </button>
            {openDropdown === 'categories' && (
              <div className="absolute left-0 mt-3 w-48 bg-white border border-zinc-150 shadow-xl py-2 rounded-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 hover:bg-zinc-50 text-[10px] uppercase font-bold tracking-widest ${selectedCategory === cat ? 'text-chrome font-black' : 'text-zinc-600'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('colors')}
              className={`hover:text-black flex items-center gap-1 transition-colors ${selectedColor !== 'All Colors' ? 'text-black' : ''}`}
            >
              Color ({selectedColor}) <span className="text-[8px] font-bold">▼</span>
            </button>
            {openDropdown === 'colors' && (
              <div className="absolute left-0 mt-3 w-48 bg-white border border-zinc-150 shadow-xl py-2 rounded-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.name}
                    onClick={() => { setSelectedColor(opt.name); setOpenDropdown(null); }}
                    className="w-full flex items-center gap-3 text-left px-4 py-2 hover:bg-zinc-50 text-[10px] uppercase font-bold tracking-widest text-zinc-600"
                  >
                    {opt.hex && (
                      <span className="w-3 h-3 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: opt.hex }} />
                    )}
                    <span className={selectedColor === opt.name ? 'text-chrome font-black' : ''}>{opt.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Size Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('sizes')}
              className={`hover:text-black flex items-center gap-1 transition-colors ${selectedSize !== 'All Sizes' ? 'text-black' : ''}`}
            >
              Size ({selectedSize}) <span className="text-[8px] font-bold">▼</span>
            </button>
            {openDropdown === 'sizes' && (
              <div className="absolute left-0 mt-3 w-40 bg-white border border-zinc-150 shadow-xl py-2 rounded-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {SIZE_OPTIONS.map(sz => (
                  <button
                    key={sz}
                    onClick={() => { setSelectedSize(sz); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 hover:bg-zinc-50 text-[10px] uppercase font-bold tracking-widest ${selectedSize === sz ? 'text-chrome font-black' : 'text-zinc-600'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('prices')}
              className={`hover:text-black flex items-center gap-1 transition-colors ${selectedPrice !== 0 ? 'text-black' : ''}`}
            >
              Price ({PRICE_OPTIONS[selectedPrice]?.label}) <span className="text-[8px] font-bold">▼</span>
            </button>
            {openDropdown === 'prices' && (
              <div className="absolute left-0 mt-3 w-48 bg-white border border-zinc-150 shadow-xl py-2 rounded-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {PRICE_OPTIONS.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedPrice(idx); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 hover:bg-zinc-50 text-[10px] uppercase font-bold tracking-widest ${selectedPrice === idx ? 'text-chrome font-black' : 'text-zinc-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Layout Grid & Sorting */}
        <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
          {/* Default Sorting */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('sort')}
              className="hover:text-black text-zinc-500 flex items-center gap-1"
            >
              {SORT_OPTIONS.find(opt => opt.value === selectedSort)?.label} <span className="text-[8px]">▼</span>
            </button>
            {openDropdown === 'sort' && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-zinc-150 shadow-xl py-2 rounded-lg z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSelectedSort(opt.value); setOpenDropdown(null); }}
                    className={`w-full text-left px-4 py-2 hover:bg-zinc-50 text-[10px] uppercase font-bold tracking-widest ${selectedSort === opt.value ? 'text-chrome font-black' : 'text-zinc-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid Layout Switcher */}
          <div className="hidden sm:flex items-center gap-2 border-l border-zinc-100 pl-6 h-5">
            {/* 2 Cols */}
            <button 
              onClick={() => setGridCols(2)}
              className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${gridCols === 2 ? 'border-black bg-zinc-50 text-black' : 'border-zinc-200 text-zinc-400 hover:text-black'}`}
              title="2 Columns Grid"
            >
              <span className="font-mono text-xs leading-none select-none tracking-tight">||</span>
            </button>
            {/* 3 Cols */}
            <button 
              onClick={() => setGridCols(3)}
              className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${gridCols === 3 ? 'border-black bg-zinc-50 text-black' : 'border-zinc-200 text-zinc-400 hover:text-black'}`}
              title="3 Columns Grid"
            >
              <span className="font-mono text-xs leading-none select-none tracking-tight">|||</span>
            </button>
            {/* 4 Cols */}
            <button 
              onClick={() => setGridCols(4)}
              className={`w-8 h-8 rounded border flex items-center justify-center transition-all ${gridCols === 4 ? 'border-black bg-zinc-50 text-black' : 'border-zinc-200 text-zinc-400 hover:text-black'}`}
              title="4 Columns Grid"
            >
              <span className="font-mono text-xs leading-none select-none tracking-tight">||||</span>
            </button>
          </div>
        </div>
      </div>

      {/* Product Display Grid */}
      <div>
        {paginatedProducts.length > 0 ? (
          <div className={`grid gap-8 md:gap-x-8 md:gap-y-12 transition-all duration-500 ${
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

      {/* Pagination component */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-12 border-t border-zinc-50">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-xs font-black uppercase hover:border-black transition-colors disabled:opacity-30 disabled:hover:border-zinc-200"
          >
            ←
          </button>
          {Array.from({ length: totalPages }, (_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-full text-xs font-black transition-all flex items-center justify-center ${
                  currentPage === pageNum
                    ? 'bg-black text-white'
                    : 'border border-zinc-200 hover:border-black text-black'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-xs font-black uppercase hover:border-black transition-colors disabled:opacity-30 disabled:hover:border-zinc-200"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

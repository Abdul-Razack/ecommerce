'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import ProductCard from './ProductCard';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { urlFor } from '@/shared/lib/sanity';
import { useCurrency } from '@/providers/CurrencyProvider';
import { Ruler, Check, X } from 'lucide-react';

/**
 * Onyx & Bone Product Details
 * Features: Tactile image galleries, custom variants selectors, coupon code copies, and dynamic trust badges.
 */
const SIZE_DISPLAY_MAP: Record<string, string> = {
  "XS": "XS (26\")",
  "S": "S (28\")",
  "M": "M (30\")",
  "L": "L (32\")",
  "XL": "XL (34\")",
  "XXL": "XXL (36\")",
  "3XL": "3XL (38\")",
  "Free Size": "Free Size (FS)",
  "FS": "Free Size (FS)",
};

export default function ProductDetails({ product, relatedProducts }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const [showSizeChart, setShowSizeChart] = useState(false);

  // Extract colors and sizes
  const colors = Array.from(new Set(product.variants?.map((v) => v.color).filter(Boolean) || [])) as string[];
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] || null);
  
  // Available sizes for the selected color
  const availableSizesForColor = product.variants
    ?.filter((v) => v.color === selectedColor)
    .map((v) => v.size) || [];

  const [selectedSize, setSelectedSize] = useState<string | null>(availableSizesForColor[0] || null);
  const [quantity, setQuantity] = useState<number>(1);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Find active variant matching color and size
  const activeVariant = product.variants?.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const activePrice = activeVariant?.price || product.price;
  const originalPrice = activeVariant?.comparePrice || product.comparePrice || Math.round(activePrice * 1.4);
  const activeStock = activeVariant ? activeVariant.stock : product.stock;

  const [activeImage, setActiveImage] = useState(
    product.processedImages?.[0]?.url || product.imageUrl
  );

  const favorited = isInWishlist(product._id);
  const [openSection, setOpenSection] = useState('details');

  // Clean up product names
  let cleanName = product.name?.split('-')[0].trim() || 'Premium Apparel';
  if (/^page \d+$/i.test(cleanName)) {
    const pageNum = cleanName.match(/\d+/)[0];
    cleanName = product.category 
      ? `Premium ${product.category} ${pageNum}` 
      : `Premium Posh Wear ${pageNum}`;
  }

  // Clean up placeholder descriptions
  let displayDescription = product.description || 'Premium ethnic apparel crafted for timeless elegance and daily comfort. Designed using top-grade fabrics to provide a perfectly breathable, lightweight experience.';
  if (/from the Page \d+ collection/i.test(displayDescription)) {
    displayDescription = displayDescription.replace(/from the Page \d+ collection/i, 'from our exclusive premium collection');
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Find first variant for this color and set its image if available
    const firstVar = product.variants?.find((v) => v.color === color);
    if (firstVar) {
      if (firstVar.images?.[0]) {
        try {
          const url = urlFor(firstVar.images[0]).width(800).height(1000).url();
          if (url) setActiveImage(url);
        } catch (e) {}
      } else if (firstVar.externalImageUrls?.[0]) {
        setActiveImage(firstVar.externalImageUrls[0]);
      }
      
      // Auto-select first available size for new color
      const colorSizes = product.variants?.filter((v) => v.color === color).map((v) => v.size) || [];
      if (colorSizes.length > 0) {
        setSelectedSize(colorSizes[0]);
      }
    }
  };

  const handleAddToCart = () => {
    const variantName = selectedColor && selectedSize ? ` (${selectedColor} - ${selectedSize})` : '';
    addToCart({
      ...product,
      name: `${cleanName}${variantName}`,
      price: activePrice,
      quantity: quantity,
      imageUrl: activeImage
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => {
      setCopiedCoupon(null);
    }, 2000);
  };

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const detailsAccordion = [
    {
      id: 'details',
      title: 'Detailed Overview',
      content: displayDescription,
    },
    {
      id: 'specifications',
      title: 'Material & Care',
      content: 'Constructed from high-durability premium fabric blend designed for 4-way stretch and breathable moisture-wicking. Machine wash cold with similar colors. Hang dry to maintain structure.',
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      content: `Complimentary domestic shipping on orders exceeding ${formatPrice(999)}. Flat-rate shipping applied otherwise. Hassle-free returns available within 7 days of delivery receipt.`,
    },
  ];

  const [coupons, setCoupons] = useState<any[]>([]);

  // Live coupons from Sanity so promo codes can be paused or created without a
  // deploy. The public endpoint only exposes marketing-safe fields.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/coupons')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) setCoupons(data.coupons || []);
      })
      .catch((err) => console.error('Error fetching coupons:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-bone min-h-screen pt-12 pb-20">
      <Container>
        {/* Core Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Gallery Layer with High-Class FX */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6 h-fit">
            <div className="aspect-[4/5] rounded-2xl md:rounded-[3rem] overflow-hidden bg-white shadow-tactile tactile-card border border-onyx/5 relative flex items-center justify-center p-3 sm:p-6 md:p-8">
              <img 
                src={activeImage} 
                className="max-w-full max-h-full object-contain transition-all duration-[2s] hover:scale-105" 
                alt={cleanName} 
              />
            </div>
            
            {/* Thumbnails: Refined Scroll */}
            {product.processedImages && product.processedImages.length > 1 && (
              <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {product.processedImages.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(img.url)}
                    className={`w-14 h-18 sm:w-20 sm:h-24 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-500 ${activeImage === img.url ? 'border-chrome scale-95 bg-white' : 'border-transparent opacity-35 bg-white hover:opacity-100'}`}
                  >
                    <img src={img.thumbnailUrl || img.url} className="w-full h-full object-contain p-0.5 sm:p-1" alt={`${cleanName} View ${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configuration Layer */}
          <div className="lg:col-span-7 flex flex-col justify-start space-y-8">
            
            {/* Category and Title */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-5 w-[3px] bg-chrome" />
                <span className="technical text-[10px] font-black uppercase tracking-[0.3em] text-onyx">
                  {product.category || 'Premium Collection'}
                </span>
                
                {/* Rating indicator */}
                <div className="flex items-center gap-1 ml-auto">
                  <div className="flex text-chrome text-xs">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="text-[9px] text-onyx/50 font-bold">(4.9/5 from 48 reviews)</span>
                </div>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black leading-[1.05] md:leading-[0.95] tracking-tighter uppercase">{cleanName}</h1>
              
              {/* Pricing section */}
              <div className="flex items-baseline gap-4 pt-2">
                <p className="text-3xl font-black text-onyx">{formatPrice(activePrice)}</p>
                {originalPrice > activePrice && (
                  <span className="text-lg text-onyx/40 line-through">{formatPrice(originalPrice)}</span>
                )}
                {originalPrice > activePrice && (
                  <span className="text-[10px] font-black text-green-700 bg-green-50/50 border border-green-100/50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {Math.round(((originalPrice - activePrice) / originalPrice) * 100)}% OFF
                  </span>
                )}
              </div>
              <p className="technical text-[9px] text-onyx/40 font-bold uppercase tracking-wider">Inclusive of all taxes</p>
            </div>

            {/* Colors, Sizes & Swatches Section */}
            <div className="py-6 border-t border-onyx/5 space-y-6">
              
              {/* Color swatches selector */}
              {colors.length > 0 && (
                <div className="space-y-3">
                  <span className="technical text-onyx/40 text-[8px] uppercase tracking-widest block">Select Color: {selectedColor}</span>
                  <div className="flex gap-3">
                    {colors.map((color) => {
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
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'border-onyx scale-110 shadow-md ring-2 ring-onyx/20' : 'border-onyx/10 hover:scale-105'}`}
                          style={{ backgroundColor: bgVal }}
                          title={color}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sizes Grid selector */}
              {selectedColor && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="technical text-onyx/40 text-[8px] uppercase tracking-widest block">
                      Select Size: {selectedSize ? (SIZE_DISPLAY_MAP[selectedSize] || selectedSize) : 'None'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeChart(true)}
                      className="text-[9px] font-bold text-chrome hover:underline uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5 text-chrome" />
                      View Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"].map((sz) => {
                      const isAvailable = availableSizesForColor.includes(sz) || availableSizesForColor.length === 0;
                      const isSelected = selectedSize === sz;
                      const displayLabel = SIZE_DISPLAY_MAP[sz] || sz;
                      
                      return (
                        <button
                          key={sz}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSize(sz)}
                          className={`min-w-[4rem] h-10 px-3 rounded-lg border text-xs font-black uppercase transition-all tracking-wider ${
                            !isAvailable 
                              ? 'border-onyx/5 text-onyx/20 line-through cursor-not-allowed bg-neutral-soft/50' 
                              : isSelected
                                ? 'border-onyx bg-onyx text-bone shadow'
                                : 'border-onyx/10 hover:border-onyx text-onyx bg-white/80'
                          }`}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity and Availability row */}
              <div className="flex flex-wrap gap-8 items-center pt-2">
                <div className="space-y-2">
                  <span className="technical text-onyx/40 text-[8px] uppercase tracking-widest block">Quantity</span>
                  <div className="flex items-center border border-onyx/10 rounded-lg bg-white/80 overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 h-10 font-black hover:bg-neutral-soft text-onyx/70 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 font-bold text-xs min-w-[2rem] text-center select-none">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="px-3 h-10 font-black hover:bg-neutral-soft text-onyx/70 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="technical text-onyx/20 text-[8px] uppercase tracking-widest block">Stock status</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider block ${activeStock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {activeStock > 0 ? `✓ IN STOCK (${activeStock} units left)` : '× OUT OF STOCK'}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupons / Promo Codes */}
            <div className="bg-neutral-soft border border-dashed border-onyx/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-onyx/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"/>
                </svg>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-onyx">Active Promo Coupons</h4>
              </div>
              {coupons.length === 0 ? (
                <p className="text-[9px] text-onyx/40 font-bold uppercase tracking-wider">
                  No active promo codes right now
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {coupons.map((c) => (
                    <div key={c._id || c.code} className="bg-white/80 border border-onyx/5 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-black bg-bone text-onyx px-2 py-0.5 rounded border border-onyx/10 uppercase">
                          {c.code}
                        </span>
                        <p className="text-[9px] text-onyx/50 font-bold leading-tight">{c.description}</p>
                        {c.scope && (
                          <p className="text-[9px] text-onyx/30 font-bold uppercase tracking-wider">
                            {c.scope}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(c.code)}
                        className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded transition-all flex-shrink-0 ${
                          copiedCoupon === c.code 
                            ? 'bg-green-700 text-bone' 
                            : 'bg-onyx text-bone hover:bg-black'
                        }`}
                      >
                        {copiedCoupon === c.code ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs: High-Velocity Action Bar */}
            <div className="space-y-4 pt-4 border-t border-onyx/5">
              <div className="flex gap-2 sm:gap-4 items-center">
                <Button 
                  onClick={handleAddToCart}
                  variant="outline"
                  disabled={activeStock <= 0}
                  className="h-12 sm:h-16 flex-1 rounded-full border-onyx text-onyx hover:bg-onyx hover:text-white text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-[0.4em] uppercase hover:shadow-tactile transition-all duration-300 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-onyx truncate"
                >
                  ADD TO CART
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  disabled={activeStock <= 0}
                  className="h-12 sm:h-16 flex-1 rounded-full bg-onyx text-white hover:bg-chrome hover:text-onyx text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-[0.4em] uppercase shadow-kinetic transition-all duration-300 disabled:opacity-40 disabled:hover:bg-onyx truncate"
                >
                  BUY NOW
                </Button>

                {/* Wishlist Button right next to CTAs */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 bg-white ${
                    favorited ? 'border-red-200 text-red-600 shadow-md' : 'border-onyx/10 text-onyx/40 hover:border-onyx/40'
                  }`}
                  title="Add to Wishlist"
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 24 24" 
                    fill={favorited ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="sm:w-5 sm:h-5"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Trust badges block */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 bg-white/50 border border-onyx/5 rounded-2xl p-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6 text-onyx/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-wider text-onyx">Free Shipping</span>
                  <p className="text-[7px] text-onyx/50">On orders above {formatPrice(999)}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6 text-onyx/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <rect x="2" y="6" width="20" height="12" rx="2"/>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M6 12h.01M18 12h.01"/>
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-wider text-onyx">COD Available</span>
                  <p className="text-[7px] text-onyx/50">Pay on Delivery</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6 text-onyx/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <polyline points="3 3 3 8 8 8"/>
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-wider text-onyx">7-Day Returns</span>
                  <p className="text-[7px] text-onyx/50">Easy Returns & Exchange</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6 text-onyx/70" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span className="text-[8px] font-black uppercase tracking-wider text-onyx">100% Original</span>
                  <p className="text-[7px] text-onyx/50">Direct from Brand</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Detail & Spec Breakdown Section */}
        <div className="mt-16 border-t border-onyx/10 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-4">
              <div className="flex items-center gap-4">
                <span className="technical text-onyx/20 text-[8px] uppercase tracking-widest">Product Specifications</span>
                <div className="w-12 h-px bg-onyx/10" />
              </div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none">The <br />Full Details</h2>
              <p className="technical text-onyx/40 text-[10px] max-w-xs">Product specifications, material care instructions, and shipping information.</p>
            </div>
          </div>
          <div className="lg:col-span-8 space-y-4">
            {detailsAccordion.map((item) => {
              const isOpen = openSection === item.id;
              return (
                <div key={item.id} className="border-b border-onyx/5">
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
                  >
                    <span className={`technical text-[12px] md:text-sm font-black uppercase tracking-[0.2em] transition-colors duration-300 ${isOpen ? 'text-onyx' : 'text-onyx/60 group-hover:text-onyx'}`}>
                      {item.title}
                    </span>
                    <span className={`relative w-4 h-4 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                      <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-onyx -translate-y-1/2"></span>
                      <span className={`absolute left-1/2 top-0 w-[1.5px] h-full bg-onyx -translate-x-1/2 transition-transform duration-500 ${isOpen ? 'rotate-90 opacity-0' : ''}`}></span>
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                    <p className="editorial italic text-onyx/60 text-[15px] md:text-base leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>

      {/* Related Assets: Nice Difference Background */}
      {relatedProducts?.length > 0 && (
        <section className="mt-16 py-16 bg-[#F1F1EF] border-t border-onyx/5">
          <Container>
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="technical text-onyx/20 text-[8px]">Related Products</span>
                  <div className="w-12 h-px bg-onyx/10" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Similar <br />Products</h2>
              </div>
              <p className="technical text-onyx/40 md:text-right max-w-xs text-[10px]">Customers who viewed this item <br />also viewed.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.slice(0, 4).map(p => <ProductCard key={p._id} product={p} onQuickView={() => {}} />)}
            </div>
          </Container>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative border border-onyx/10 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSizeChart(false)}
              className="absolute top-6 right-6 text-onyx/40 hover:text-onyx w-8 h-8 rounded-full border border-onyx/10 flex items-center justify-center bg-bone hover:bg-neutral-soft transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div className="space-y-1 border-b border-onyx/10 pb-4">
                <span className="technical text-[9px] font-black uppercase tracking-widest text-chrome">Size & Measurement Standard</span>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Women's Apparel Size Guide</h3>
                <p className="text-xs text-onyx/60">Standard waist & hip measurements in inches for Leggings, Inskirts, Chudidars & Nighties.</p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-onyx/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bone text-onyx font-black uppercase tracking-wider text-[10px] border-b border-onyx/10">
                    <tr>
                      <th className="py-3 px-4">Size Code</th>
                      <th className="py-3 px-4">Waist (Inches)</th>
                      <th className="py-3 px-4">Hip (Inches)</th>
                      <th className="py-3 px-4">Garment Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-onyx/5 text-onyx font-medium">
                    <tr className="hover:bg-bone/40">
                      <td className="py-3 px-4 font-black">XS</td>
                      <td className="py-3 px-4">26" (66 cm)</td>
                      <td className="py-3 px-4">34" (86 cm)</td>
                      <td className="py-3 px-4">38" (96 cm)</td>
                    </tr>
                    <tr className="hover:bg-bone/40">
                      <td className="py-3 px-4 font-black">S</td>
                      <td className="py-3 px-4">28" (71 cm)</td>
                      <td className="py-3 px-4">36" (91 cm)</td>
                      <td className="py-3 px-4">39" (99 cm)</td>
                    </tr>
                    <tr className="hover:bg-bone/40">
                      <td className="py-3 px-4 font-black">M</td>
                      <td className="py-3 px-4">30" (76 cm)</td>
                      <td className="py-3 px-4">38" (96 cm)</td>
                      <td className="py-3 px-4">40" (101 cm)</td>
                    </tr>
                    <tr className="hover:bg-bone/40">
                      <td className="py-3 px-4 font-black">L</td>
                      <td className="py-3 px-4">32" (81 cm)</td>
                      <td className="py-3 px-4">40" (101 cm)</td>
                      <td className="py-3 px-4">41" (104 cm)</td>
                    </tr>
                    <tr className="hover:bg-bone/40">
                      <td className="py-3 px-4 font-black">XL</td>
                      <td className="py-3 px-4">34" (86 cm)</td>
                      <td className="py-3 px-4">42" (106 cm)</td>
                      <td className="py-3 px-4">42" (106 cm)</td>
                    </tr>
                    <tr className="hover:bg-bone/40">
                      <td className="py-3 px-4 font-black">XXL</td>
                      <td className="py-3 px-4">36" (91 cm)</td>
                      <td className="py-3 px-4">44" (111 cm)</td>
                      <td className="py-3 px-4">42" (106 cm)</td>
                    </tr>
                    <tr className="hover:bg-bone/40">
                      <td className="py-3 px-4 font-black">3XL</td>
                      <td className="py-3 px-4">38" (96 cm)</td>
                      <td className="py-3 px-4">46" (116 cm)</td>
                      <td className="py-3 px-4">43" (109 cm)</td>
                    </tr>
                    <tr className="hover:bg-bone/40 bg-amber-50/40">
                      <td className="py-3 px-4 font-black text-amber-900">Free Size (FS)</td>
                      <td className="py-3 px-4 text-amber-900 font-bold">28" - 42" (Stretchable)</td>
                      <td className="py-3 px-4 text-amber-900">36" - 48"</td>
                      <td className="py-3 px-4 text-amber-900">39" - 42"</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Measurement Tips */}
              <div className="bg-bone p-4 rounded-2xl space-y-2 border border-onyx/5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-onyx">How to Measure:</h4>
                <ul className="text-xs text-onyx/70 space-y-1 list-disc pl-4">
                  <li><strong>Waist:</strong> Measure around your natural waistline, keeping tape comfortably loose.</li>
                  <li><strong>Hips:</strong> Measure around the fullest part of your hips/seat.</li>
                  <li><strong>Free Size:</strong> Fabric includes high elastic stretch suitable for waist sizes 28" up to 42".</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowSizeChart(false)}
                  className="px-6 py-2.5 bg-onyx text-bone font-black text-xs rounded-full uppercase tracking-wider hover:bg-black transition-all"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

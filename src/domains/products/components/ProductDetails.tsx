'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import ProductCard from './ProductCard';
import { useCart } from '@/hooks/useCart';

/**
 * Onyx & Bone Product Details
 * Features: Tactile image galleries, kinetic typography, and liquid CTAs.
 */
export default function ProductDetails({ product, relatedProducts }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(product.processedImages?.[0]?.url || product.imageUrl);
  const [openSection, setOpenSection] = useState('details');

  // Clean up product names (e.g., "Page 015" -> "Premium Collection 015")
  let cleanName = product.name?.split('-')[0].trim() || 'Premium Apparel';
  if (/^page \d+$/i.test(cleanName)) {
    const pageNum = cleanName.match(/\d+/)[0];
    cleanName = product.category 
      ? `Premium ${product.category} ${pageNum}` 
      : `Premium Posh Wear ${pageNum}`;
  }

  // Clean up placeholder descriptions coming from database
  let displayDescription = product.description || 'Premium ethnic apparel crafted for timeless elegance and daily comfort. Designed using top-grade fabrics to provide a perfectly breathable, lightweight experience.';
  if (/from the Page \d+ collection/i.test(displayDescription)) {
    displayDescription = displayDescription.replace(/from the Page \d+ collection/i, 'from our exclusive premium collection');
  }

  const handleBuyNow = () => {
    addToCart(product);
    router.push('/cart');
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
      content: 'Complimentary domestic shipping on orders exceeding ₹999. Flat-rate shipping applied otherwise. Hassle-free returns available within 7 days of delivery receipt.',
    },
  ];

  return (
    <div className="bg-bone min-h-screen pt-0 pb-20">
      <Container>
        {/* Core Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-start">
          
          {/* Gallery Layer with High-Class FX */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 space-y-6 animate-kinetic-reveal h-fit">
            <div className="aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-tactile tactile-card border border-onyx/5 relative flex items-center justify-center p-6 md:p-8">
              <img 
                src={activeImage} 
                className="max-w-full max-h-full object-contain transition-all duration-[2s] hover:scale-105" 
                alt={cleanName} 
              />

            </div>
            
            {/* Thumbnails: Refined Scroll */}
            {product.processedImages && product.processedImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {product.processedImages.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImage(img.url)}
                    className={`w-20 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${activeImage === img.url ? 'border-chrome scale-95' : 'border-transparent opacity-30 hover:opacity-100'}`}
                  >
                    <img src={img.thumbnailUrl || img.url} className="w-full h-full object-cover" alt={`${cleanName} View ${i}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Configuration Layer */}
          <div className="lg:col-span-7 flex flex-col justify-start space-y-8 animate-kinetic-reveal [animation-delay:200ms]">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-[3px] bg-chrome" />
                  <span className="technical text-[10px] font-black uppercase tracking-[0.3em] text-onyx">
                    {product.category || 'Premium Collection'}
                  </span>
                </div>
                <div className="w-8 h-px bg-onyx/10" />
                <span className="technical text-onyx/20 text-[8px]">SKU: {product._id?.slice(-6).toUpperCase()}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase">{cleanName}</h1>
              <div className="flex items-baseline gap-4 pt-2">
                <p className="text-3xl font-black text-onyx">₹{product.price}</p>
                <span className="technical text-chrome text-[10px]">Inclusive of all taxes</span>
              </div>
            </div>

            <div className="space-y-8 py-10 border-y border-onyx/5">
              <p className="text-base leading-relaxed text-onyx/60 editorial italic max-w-md">
                {displayDescription}
              </p>
              
              {/* Product Info Row */}
              <div className="flex gap-12 pt-4">
                <div className="flex flex-col gap-2">
                  <span className="technical text-onyx/20 text-[8px]">Availability</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="technical text-onyx/20 text-[8px]">Fabric</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Premium Grade</span>
                </div>
              </div>
            </div>

            {/* CTAs: High-Velocity Buttons */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => addToCart(product)}
                  variant="outline"
                  className="h-16 flex-1 rounded-full border-onyx text-onyx hover:bg-onyx hover:text-white text-[10px] font-black tracking-[0.4em] uppercase hover:shadow-tactile transition-all duration-300"
                >
                  ADD TO CART
                </Button>
                <Button 
                  onClick={handleBuyNow}
                  className="h-16 flex-1 rounded-full bg-onyx text-white hover:bg-chrome hover:text-onyx text-[10px] font-black tracking-[0.4em] uppercase shadow-kinetic transition-all duration-300"
                >
                  BUY NOW
                </Button>
              </div>
              <p className="technical text-center opacity-20 text-[8px]">Free Delivery // Secure Payment</p>
            </div>
          </div>
        </div>

        {/* Product Detail & Spec Breakdown Section */}
        <div className="mt-32 border-t border-onyx/10 pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 animate-kinetic-reveal [animation-delay:400ms]">
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-4">
              <div className="flex items-center gap-4">
                <span className="technical text-onyx/20 text-[8px]">Product Specifications</span>
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
        <section className="mt-40 py-24 bg-[#F1F1EF] border-t border-onyx/5">
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
              {relatedProducts.slice(0, 4).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}

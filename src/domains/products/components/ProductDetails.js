'use client';

import React, { useState } from 'react';
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
  const [activeImage, setActiveImage] = useState(product.processedImages?.[0]?.url || product.imageUrl);

  const cleanName = product.name?.split('-')[0].trim();

  return (
    <div className="bg-bone min-h-screen pt-24 pb-20">
      <Container>
        {/* Core Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Gallery Layer with High-Class FX */}
          <div className="lg:col-span-7 space-y-6 animate-kinetic-reveal">
            <div className="aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-[#F1F1EF] shadow-architectural tactile-card border border-onyx/5 relative">
              <img 
                src={activeImage} 
                className="w-full h-full object-cover transition-all duration-[2s] hover:scale-105" 
                alt={cleanName} 
              />
              <div className="absolute top-6 left-6 technical text-onyx/40 text-[8px] bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                Visual_Reference // Vol_01
              </div>
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
          <div className="lg:col-span-5 flex flex-col justify-start pt-4 space-y-10 animate-kinetic-reveal [animation-delay:200ms]">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-[3px] bg-chrome" />
                  <span className="technical text-[10px] font-black uppercase tracking-[0.3em] text-onyx">
                    {product.category || 'Standard_Issue'}
                  </span>
                </div>
                <div className="w-8 h-px bg-onyx/10" />
                <span className="technical text-onyx/20 text-[8px]">SKU_{product._id?.slice(-6)}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[0.9] tracking-tighter uppercase">{cleanName}</h1>
              <div className="flex items-baseline gap-4 pt-2">
                <p className="text-3xl font-black text-onyx">₹{product.price}</p>
                <span className="technical text-chrome text-[10px]">Taxes_Included</span>
              </div>
            </div>

            <div className="space-y-8 py-10 border-y border-onyx/5">
              <p className="text-base leading-relaxed text-onyx/60 editorial italic max-w-md">
                {product.description || 'A high-frequency silhouette engineered for operational versatility and aesthetic discipline.'}
              </p>
              
              {/* Tactical Stats: Compact */}
              <div className="flex gap-12 pt-4">
                <div className="flex flex-col gap-2">
                  <span className="technical text-onyx/20 text-[8px]">Availability</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">{product.stock > 0 ? 'Deployable' : 'Stationed'}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="technical text-onyx/20 text-[8px]">Construction</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Onyx_Grade_Alpha</span>
                </div>
              </div>
            </div>

            {/* CTAs: High-Velocity Button */}
            <div className="space-y-6 pt-4">
              <div className="flex gap-4">
                <Button 
                  onClick={() => addToCart(product)}
                  className="h-16 flex-grow rounded-full bg-onyx text-white hover:bg-chrome hover:text-onyx transition-all text-[10px] font-black tracking-[0.4em] shadow-kinetic uppercase"
                >
                  DEPLOY_TO_BAG
                </Button>
              </div>
              <p className="technical text-center opacity-20 text-[8px]">Complimentary Shipping // Global_Registry_Security</p>
            </div>
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
                  <span className="technical text-onyx/20 text-[8px]">Registry_Related // 04</span>
                  <div className="w-12 h-px bg-onyx/10" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">Compatible <br />Series</h2>
              </div>
              <p className="technical text-onyx/40 md:text-right max-w-xs text-[10px]">Complementary silos engineered <br />for high-stakes layering.</p>
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

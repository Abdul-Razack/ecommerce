'use client';

import { useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import Button from '@/shared/ui/Button';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { addToCart } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug?.current || product.slug,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#FAF9F6] w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] animate-fade-in scale-95 opacity-0 [animation:fade-in_0.3s_ease-out_forwards] rounded-none">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors text-black"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-zinc-50 aspect-[4/5] md:aspect-auto">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
          {product.category && (
            <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-6">
              {product.category}
            </p>
          )}
          <h2 className="text-3xl md:text-4xl font-serif text-black mb-6 leading-tight">{product.name}</h2>
          <p className="text-xl font-bold text-black mb-10">₹{product.price?.toLocaleString('en-IN')}</p>
          
          <div className="space-y-6 mb-10">
            <p className="text-xs text-zinc-500 leading-relaxed font-light italic">
              "{product.description || "A meticulously crafted piece designed for both form and function. This garment represents the pinnacle of contemporary fashion engineering."}"
            </p>
          </div>

          <div className="flex gap-4">
            <Button size="lg" fullWidth onClick={handleAddToCart} className="bg-black text-white hover:bg-zinc-800 uppercase tracking-[0.25em] text-[10px] font-bold h-14">
              Add to Bag
            </Button>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M5 18H3c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v2M21 16v-4a2 2 0 00-2-2h-2v6h2c1.1 0 2-.9 2-2z" /><circle cx="8" cy="18" r="2" /><circle cx="16" cy="18" r="2" /></svg>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Complimentary Shipping</span>
            </div>
            <div className="flex items-center gap-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-bold">7-Day Return Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import Card from '@/shared/ui/Card';
import Skeleton from '@/shared/ui/Skeleton';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, getCartCount, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <Container className="py-20">
        <Skeleton className="h-10 w-48 mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />)}
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-64 w-full rounded-[2rem]" />
          </div>
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-bone">
        <div className="text-6xl mb-6 opacity-50">🛒</div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-onyx mb-4">Your cart is empty</h2>
        <p className="editorial text-onyx/60 mb-8 max-w-sm text-lg italic">
          Looks like you haven't added anything to your premium collection yet.
        </p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full bg-onyx text-bone hover:bg-chrome hover:text-onyx uppercase tracking-[0.3em] font-black text-[10px] h-14 px-10 transition-all duration-300 shadow-kinetic">
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 999 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  return (
    <div className="bg-bone min-h-screen pb-20 md:pb-32 pt-8 md:pt-12">
      <Container>
        {/* Header section */}
        <div className="mb-8 md:mb-12 border-b border-onyx/10 pb-6 md:pb-8 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-onyx leading-none">
            Your Cart
          </h1>
          <span className="technical text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-onyx/40 font-black">
            {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4 md:space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="group bg-white/50 border border-onyx/5 rounded-2xl md:rounded-[2rem] p-3 sm:p-4 md:p-6 flex gap-3 sm:gap-4 md:gap-6 hover:shadow-tactile transition-all duration-500 tactile-card">
                {/* Image */}
                <div className="w-20 h-28 sm:w-28 sm:h-36 md:w-32 md:h-40 bg-white flex-shrink-0 overflow-hidden rounded-xl md:rounded-2xl border border-onyx/5 relative flex items-center justify-center p-1 sm:p-2">
                  <img 
                    src={item.imageUrl || (typeof item.image === 'string' ? item.image : null) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop'}
                    alt={item.name || 'Product Image'} 
                    className="max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                
                {/* Details */}
                <div className="flex flex-col flex-grow py-1">
                  <div className="flex justify-between items-start gap-2 sm:gap-4 mb-2 sm:mb-4">
                    <div className="space-y-1 sm:space-y-1.5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="h-2 sm:h-3 w-[2px] bg-chrome" />
                        <span className="technical text-[7px] sm:text-[8px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-onyx/50 font-black">
                          Premium Collection
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm md:text-base font-black uppercase tracking-tight text-onyx leading-tight pr-2 sm:pr-4">
                        {item.name || 'Premium Item'}
                      </h3>
                      <p className="text-xs sm:text-sm md:text-base font-black text-onyx pt-0.5 sm:pt-1">
                        ₹{(item.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-neutral-soft text-onyx/40 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0 mt-0.5 sm:mt-1"
                      title="Remove Item"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sm:w-[14px] sm:h-[14px]">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 mt-auto pt-2">
                    <span className="hidden sm:inline-block technical text-[7px] sm:text-[8px] text-onyx/40 uppercase tracking-widest font-bold">Qty</span>
                    <div className="flex items-center border border-onyx/10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-white/80 overflow-hidden shadow-sm">
                      <button 
                        onClick={() => updateQuantity(item._id, Math.max(1, (item.quantity || 1) - 1))}
                        className="w-8 sm:w-10 h-full flex items-center justify-center hover:bg-neutral-soft transition-colors font-black text-onyx/70 text-xs sm:text-base"
                      >
                        −
                      </button>
                      <span className="w-6 sm:w-8 text-center text-[10px] sm:text-xs font-black">{item.quantity || 1}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                        className="w-8 sm:w-10 h-full flex items-center justify-center hover:bg-neutral-soft transition-colors font-black text-onyx/70 text-xs sm:text-base"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-32">
            <div className="bg-neutral-soft border border-onyx/10 rounded-3xl md:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-sm relative overflow-hidden">
              {/* Decorative top seam */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-chrome/30 to-transparent" />
              
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-onyx mb-6 sm:mb-8">Order Summary</h3>
              
              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                <div className="flex justify-between items-center border-b border-onyx/5 pb-3 sm:pb-4">
                  <span className="technical text-[9px] sm:text-[10px] text-onyx/60 uppercase tracking-[0.2em] font-bold">Subtotal</span>
                  <span className="font-black text-onyx text-sm sm:text-base">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center border-b border-onyx/5 pb-3 sm:pb-4">
                  <span className="technical text-[9px] sm:text-[10px] text-onyx/60 uppercase tracking-[0.2em] font-bold">Delivery</span>
                  <span className={`font-black text-[9px] sm:text-[10px] tracking-wider uppercase px-2 py-1 rounded ${deliveryCharge === 0 ? 'bg-green-100/50 text-green-700 border border-green-200/50' : 'text-onyx'}`}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[9px] sm:text-[10px] text-chrome font-bold uppercase tracking-wider text-center pt-2">
                    Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free delivery
                  </p>
                )}
              </div>

              <div className="bg-white/50 border border-onyx/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 flex justify-between items-end">
                <div>
                  <p className="technical text-[8px] sm:text-[9px] uppercase tracking-widest font-black text-onyx/40 mb-1">Total Price</p>
                  <p className="text-2xl sm:text-3xl font-black text-onyx leading-none">₹{total.toLocaleString('en-IN')}</p>
                </div>
                <p className="technical text-[7px] sm:text-[8px] text-onyx/40 uppercase tracking-widest font-bold">Incl. taxes</p>
              </div>

              <Link href="/checkout">
                <Button 
                  className="w-full h-14 sm:h-16 rounded-full bg-onyx text-bone hover:bg-chrome hover:text-onyx uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black text-[9px] sm:text-[10px] transition-all duration-300 shadow-kinetic"
                >
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-onyx/5 grid grid-cols-1 gap-3 sm:gap-4">
                <TrustIcon label="Secure Checkout Process" icon="🔒" />
                <TrustIcon label="100% Original Assured" icon="✨" />
                <TrustIcon label="Easy 7-Day Returns" icon="↩️" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

const TrustIcon = ({ label, icon }) => (
  <div className="flex items-center gap-4 bg-white/40 border border-onyx/5 p-3 rounded-xl">
    <span className="text-base grayscale opacity-70">{icon}</span>
    <span className="technical text-[9px] uppercase tracking-widest text-onyx/70 font-black">{label}</span>
  </div>
);

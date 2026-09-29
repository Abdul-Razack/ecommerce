'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import Skeleton from '@/shared/ui/Skeleton';
import { useCurrency } from '@/providers/CurrencyProvider';
import { useCoupon } from '@/hooks/useCoupon';
import { calculateTotals, FREE_DELIVERY_THRESHOLD } from '@/domains/coupons/lib/discount';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartCount, isLoaded } = useCart();
  const { formatPrice } = useCurrency();
  const {
    applied,
    isApplied,
    discount,
    freeShipping,
    applyCode,
    removeCoupon,
    applying: isCouponApplying,
    error: couponError,
  } = useCoupon();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  // Fallback authentic image resolver for seeded placeholder items
  const resolvePhotoUrl = (item: any) => {
    const url = item.imageUrl || (typeof item.image === 'string' ? item.image : null);
    if (!url) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop';
    if (url.includes('photo-1596461404969-9ae70f2830c1')) {
      const name = (item.name || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      if (cat.includes('skirt') || name.includes('pattu') || name.includes('skirt')) {
        return '/images/banner-child.png';
      } else if (cat.includes('nighty') || name.includes('night')) {
        return 'https://www.ankitadesigns.in/cdn/shop/files/350nilima.png?v=1777283189';
      }
    }
    return url;
  };

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponMessage(null);
    const success = await applyCode(code, cartItems);
    if (success) {
      setCouponInput('');
      setCouponMessage(`Coupon "${code}" applied successfully!`);
    }
  };

  if (!isLoaded) {
    return (
      <Container className="py-12 md:py-20">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <div className="lg:col-span-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 bg-bone">
        <div className="w-24 h-24 mb-6 rounded-full bg-onyx/5 border border-onyx/10 flex items-center justify-center text-4xl shadow-inner">
          🛍️
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-onyx mb-3">
          Your cart is empty
        </h2>
        <p className="text-onyx/60 mb-8 max-w-sm text-sm sm:text-base leading-relaxed">
          Looks like you haven't added anything to your bag yet. Explore our handcrafted ethnic & modern collections!
        </p>
        <Link href="/shop">
          <Button
            size="lg"
            className="rounded-full bg-onyx text-bone hover:bg-chrome hover:text-onyx uppercase tracking-[0.2em] font-black text-xs h-13 px-8 transition-all duration-300 shadow-md"
          >
            Explore Collection
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate pricing
  const { subtotal, deliveryCharge, total } = calculateTotals(
    cartItems,
    isApplied
      ? { valid: true, discount, freeShipping, giftItems: [], affectedLineIds: [], freeUnitsByLine: {} }
      : null
  );

  // Realistic MRP calculations for fashion ecommerce (Myntra/Ajio style)
  const totalMrp = cartItems.reduce((acc, item) => {
    const itemOriginal = item.originalPrice || item.compareAtPrice || Math.round((item.price || 0) * 1.4);
    return acc + itemOriginal * (item.quantity || 1);
  }, 0);
  const totalMrpDiscount = Math.max(0, totalMrp - subtotal);
  const totalSavings = totalMrpDiscount + (discount || 0);

  // Free delivery progress
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100));
  const amountNeededForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const isFreeDeliveryUnlocked = subtotal >= FREE_DELIVERY_THRESHOLD || freeShipping;

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-8 md:pb-12 pt-3 md:pt-8 text-onyx">
      <Container>
        {/* Top Stepper (Myntra / Ajio Fashion Standard) */}
        <div className="mb-5 border-b border-onyx/10 pb-4">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight uppercase text-onyx leading-none">
                Your Cart
              </h1>
              <span className="technical text-[10px] sm:text-xs uppercase tracking-wider text-onyx/50 font-bold block mt-1">
                {getCartCount()} {getCartCount() === 1 ? 'Item' : 'Items'} selected
              </span>
            </div>

            {/* Micro Trust Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-3 py-1.5 rounded-full text-[11px] font-bold">
              <span>🛡️</span>
              <span>100% SECURE CHECKOUT</span>
            </div>
          </div>

          {/* Stepper bar */}
          <div className="flex items-center justify-center max-w-sm mx-auto pt-1">
            <div className="flex items-center text-[10px] sm:text-xs font-black tracking-widest uppercase">
              <span className="text-emerald-800 flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse" />
                BAG
              </span>
              <span className="w-8 sm:w-12 h-[1px] bg-onyx/20 mx-1.5" />
              <span className="text-onyx/40 px-1 font-bold">ADDRESS</span>
              <span className="w-8 sm:w-12 h-[1px] bg-onyx/20 mx-1.5" />
              <span className="text-onyx/40 px-1 font-bold">PAYMENT</span>
            </div>
          </div>
        </div>

        {/* Free Delivery Meter */}
        <div className="mb-5 bg-white border border-onyx/10 rounded-2xl p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">{isFreeDeliveryUnlocked ? '🎉' : '🚚'}</span>
              <span>
                {isFreeDeliveryUnlocked ? (
                  <span className="text-emerald-700 font-extrabold">
                    Yay! You have unlocked FREE Express Delivery
                  </span>
                ) : (
                  <span>
                    Add <span className="text-emerald-700 font-black">{formatPrice(amountNeededForFreeDelivery)}</span> more to unlock <span className="uppercase text-emerald-700 font-black">Free Delivery</span>
                  </span>
                )}
              </span>
            </div>
            <span className="text-[11px] text-onyx/50 font-black">{freeDeliveryProgress}%</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isFreeDeliveryUnlocked ? 'bg-emerald-600' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              style={{ width: `${freeDeliveryProgress}%` }}
            />
          </div>
        </div>

        {/* Main Grid: Items on Left, Summary on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-onyx/60">
                Items in Bag ({cartItems.length})
              </span>
              <Link
                href="/shop"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                + Add More Items
              </Link>
            </div>

            {cartItems.map((item) => {
              const originalPrice = item.originalPrice || item.compareAtPrice || Math.round((item.price || 0) * 1.4);
              const discountPercent =
                originalPrice > item.price
                  ? Math.round(((originalPrice - item.price) / originalPrice) * 100)
                  : 0;

              return (
                <div
                  key={item._id}
                  className="bg-white border border-onyx/10 rounded-2xl p-3 sm:p-4 shadow-xs hover:border-onyx/20 transition-all flex flex-col gap-3"
                >
                  <div className="flex gap-3 sm:gap-4 items-start">
                    {/* Product Image: 3:4 portrait aspect ratio (Ajio / Myntra standard) */}
                    <div className="w-24 h-32 sm:w-28 sm:h-36 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-onyx/5 relative flex items-center justify-center">
                      <img
                        src={resolvePhotoUrl(item)}
                        alt={item.name || 'Product Image'}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    {/* Details Column */}
                    <div className="flex flex-col flex-grow min-w-0">
                      {/* Top row: Brand & Remove button */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 pr-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {item.category || 'Posh Pigeon'}
                          </span>
                          <h3 className="text-xs sm:text-sm font-medium text-onyx line-clamp-2 mt-1 leading-snug normal-case tracking-normal">
                            {item.name || 'Handcrafted Ethnic Apparel'}
                          </h3>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-red-50 text-onyx/40 hover:text-red-600 flex items-center justify-center transition-colors flex-shrink-0"
                          title="Remove Item"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Size and Fit pill */}
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-onyx/60 font-medium">
                        <span className="bg-neutral-100 px-2 py-0.5 rounded text-onyx/75 font-semibold">
                          Size: {item.selectedSize || item.size || 'Free Size'}
                        </span>
                      </div>

                      {/* Price row */}
                      <div className="flex flex-wrap items-baseline gap-2 mt-2">
                        <span className="text-sm sm:text-base font-black text-onyx">
                          {formatPrice(item.price || 0)}
                        </span>
                        {originalPrice > item.price && (
                          <>
                            <span className="text-xs text-onyx/40 line-through font-medium">
                              {formatPrice(originalPrice)}
                            </span>
                            <span className="text-xs font-black text-emerald-700">
                              ({discountPercent}% OFF)
                            </span>
                          </>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-onyx/5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-onyx/50">
                            Qty:
                          </span>
                          <div className="flex items-center border border-onyx/15 h-7 sm:h-8 rounded-lg bg-neutral-50 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, Math.max(1, (item.quantity || 1) - 1))}
                              className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-neutral-200 transition-colors font-black text-onyx/80 text-sm"
                            >
                              −
                            </button>
                            <span
                              data-testid="cart-item-qty"
                              className="w-6 sm:w-8 text-center text-xs font-black"
                            >
                              {item.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                              className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-neutral-200 transition-colors font-black text-onyx/80 text-sm"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-onyx">
                          Total: {formatPrice((item.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Return Guarantee Badge */}
                  <div className="bg-neutral-50 border border-onyx/5 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[11px] text-onyx/70">
                    <span className="text-emerald-700 font-bold">✓</span>
                    <span><strong className="font-bold text-onyx">7 Days Return </strong>Guarantee</span>
                  </div>
                </div>
              );
            })}

            {/* Coupons & Offers Box (Indian E-commerce Highlight) */}
            <div className="bg-white border border-onyx/10 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🏷️</span>
                <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-onyx">
                  Coupons & Offers
                </h4>
              </div>

              {isApplied ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-emerald-700 text-sm font-bold">✓</span>
                    <div>
                      <p className="text-xs font-black text-emerald-800 tracking-wider">
                        {applied?.code} APPLIED
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        {discount > 0 ? `You saved ${formatPrice(discount)}` : freeShipping ? 'Free shipping unlocked' : 'Offer applied'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-black text-red-600 hover:text-red-700 uppercase tracking-wider px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 uppercase text-xs font-bold border border-onyx/20 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-onyx bg-neutral-50 tracking-wider"
                    />
                    <button
                      type="button"
                      disabled={isCouponApplying || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="bg-onyx text-white hover:bg-emerald-700 font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isCouponApplying ? '...' : 'Apply'}
                    </button>
                  </div>

                  {couponError && (
                    <p className="text-xs text-red-600 font-bold mt-2">{couponError}</p>
                  )}
                  {couponMessage && (
                    <p className="text-xs text-emerald-700 font-bold mt-2">{couponMessage}</p>
                  )}

                  {/* Quick available coupon suggestions */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between text-xs bg-amber-50/70 border border-amber-200/70 rounded-xl px-3 py-2">
                      <div>
                        <span className="font-extrabold text-amber-900 tracking-wider">SAVE10</span>
                        <span className="text-amber-800 ml-1.5 text-[11px] font-medium">10% OFF</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('SAVE10')}
                        className="text-xs font-black text-emerald-700 hover:text-emerald-800 uppercase"
                      >
                        Apply
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-emerald-50/70 border border-emerald-200/70 rounded-xl px-3 py-2">
                      <div>
                        <span className="font-extrabold text-emerald-900 tracking-wider">FESTIVE</span>
                        <span className="text-emerald-800 ml-1.5 text-[11px] font-medium">Special Offer</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FESTIVE')}
                        className="text-xs font-black text-emerald-700 hover:text-emerald-800 uppercase"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cart Summary (Desktop Column + Source of Truth for test assertions) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white border border-onyx/10 rounded-2xl md:rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden" id="order-summary-card">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-onyx mb-4 pb-2 border-b border-onyx/5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6 text-xs sm:text-sm">
                {/* Total MRP */}
                <div className="flex justify-between items-center text-onyx/70">
                  <span>Total MRP</span>
                  <span className="font-medium">{formatPrice(totalMrp)}</span>
                </div>

                {/* Discount on MRP */}
                {totalMrpDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span>Discount on MRP</span>
                    <span className="font-bold">−{formatPrice(totalMrpDiscount)}</span>
                  </div>
                )}

                {/* Subtotal (Matches Playwright: span 'Subtotal' with sibling 'span.font-black') */}
                <div className="flex justify-between items-center border-t border-onyx/5 pt-2">
                  <span className="technical uppercase tracking-wider text-[11px] font-bold text-onyx/70">
                    Subtotal
                  </span>
                  <span className="font-black text-onyx text-sm sm:text-base">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {/* Applied Coupon Discount */}
                {isApplied && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="technical text-[10px] uppercase font-bold">
                      Coupon ({applied?.code})
                    </span>
                    <span className="font-black text-sm">
                      {discount > 0 ? `−${formatPrice(discount)}` : freeShipping ? 'FREE DELIVERY' : 'APPLIED'}
                    </span>
                  </div>
                )}

                {/* Delivery Fee */}
                <div className="flex justify-between items-center border-t border-onyx/5 pt-2">
                  <span className="text-onyx/70">Delivery Fee</span>
                  <span
                    className={`font-black text-[11px] sm:text-xs uppercase px-2 py-0.5 rounded ${
                      deliveryCharge === 0 ? 'bg-emerald-100 text-emerald-800' : 'text-onyx'
                    }`}
                  >
                    {deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}
                  </span>
                </div>

                {deliveryCharge > 0 && !isApplied && (
                  <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider text-center pt-1">
                    Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery
                  </p>
                )}
              </div>

              {/* Total Price Card */}
              <div className="bg-neutral-50 border border-onyx/5 rounded-xl p-3.5 sm:p-4 mb-5 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-extrabold text-onyx/50 mb-0.5">
                    Total Amount
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-onyx leading-none">
                    {formatPrice(total)}
                  </p>
                </div>
                <p className="text-[10px] text-onyx/40 font-bold uppercase">Incl. all taxes</p>
              </div>

              {/* Total Savings Highlight */}
              {totalSavings > 0 && (
                <div className="mb-5 bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2 text-center text-xs text-emerald-800 font-bold">
                  🎉 You are saving <span className="font-extrabold">{formatPrice(totalSavings)}</span> on this order!
                </div>
              )}

              {/* Desktop Proceed Button */}
              <div className="hidden md:block">
                <Link href="/checkout">
                  <Button className="w-full h-13 rounded-xl bg-onyx text-white hover:bg-emerald-700 uppercase tracking-wider font-black text-xs transition-all shadow-md">
                    Proceed to Checkout
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-5 pt-4 border-t border-onyx/5 grid grid-cols-2 gap-2 text-[10px] text-onyx/70">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>100% Genuine Items</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span>Easy 7-Day Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Sticky Mobile Checkout Bar (Myntra / Ajio Mobile Highlight) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-onyx/15 px-4 pt-3 pb-4 shadow-[0_-4px_25px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
          {/* Price & Savings Summary with anchor to summary */}
          <a href="#order-summary-card" className="flex flex-col text-left group">
            <span className="text-[9px] uppercase font-bold tracking-wider text-onyx/50 flex items-center gap-1">
              Total to Pay
              <span className="text-[8px] text-emerald-700 underline font-extrabold">Details</span>
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-onyx leading-none">
                {formatPrice(total)}
              </span>
              {totalSavings > 0 && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Save {formatPrice(totalSavings)}
                </span>
              )}
            </div>
          </a>

          {/* Proceed Button */}
          <Link
            href="/checkout"
            className="flex-1 max-w-[200px] h-12 bg-onyx text-white hover:bg-emerald-700 active:scale-98 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all shadow-md text-center"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

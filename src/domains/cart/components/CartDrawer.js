'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { client, urlFor } from '@/shared/lib/sanity';
import Button from '@/shared/ui/Button';

/**
 * Onyx & Bone Cart Drawer
 * Features: Liquid Slide transition, tactile item rows, and acid lime conversion accents.
 */
export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, getCartTotal, isLoaded } = useCart();
  const [crossSells, setCrossSells] = useState([]);

  useEffect(() => {
    if (isCartOpen && cartItems.length > 0) {
      const fetchCrossSells = async () => {
        const cartIds = cartItems.map(i => i._id);
        const query = `*[_type == "product" && !(_id in $cartIds)][0...4] {
          _id, name, price, slug, images, "category": category->name
        }`;
        try {
          if (client) {
            const results = await client.fetch(query, { cartIds });
            setCrossSells(results);
          }
        } catch (e) { console.error(e); }
      };
      fetchCrossSells();
    }
  }, [isCartOpen, cartItems]);

  if (!isLoaded) return null;

  const subtotal = getCartTotal();
  const delivery = subtotal >= 999 ? 0 : 50;
  const total = subtotal + delivery;

  return (
    <>
      {/* 2026 Overlay */}
      <div 
        className={`fixed inset-0 bg-onyx/40 backdrop-blur-md z-[200] transition-opacity duration-700 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* Kinetic Drawer */}
      <div className={`
        fixed top-0 right-0 h-full w-full md:w-[500px] bg-white z-[210] shadow-kinetic flex flex-col transition-transform duration-[0.8s] cubic-bezier(0.16, 1, 0.3, 1)
        ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-10 border-b border-onyx/5">
          <div>
            <h2 className="text-2xl font-black text-onyx">YOUR BAG</h2>
            <p className="technical text-onyx/30 text-[8px] mt-1">Operational_Unit_Manifest // {cartItems.length}_Items</p>
          </div>
          <button onClick={closeCart} className="w-12 h-12 rounded-full border border-onyx/10 flex items-center justify-center hover:bg-onyx hover:text-white transition-all">✕</button>
        </div>

        {/* Manifest (Items) */}
        <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar space-y-10">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <p className="editorial italic text-3xl text-onyx/20">Empty Manifest</p>
              <Button onClick={closeCart} className="technical underline underline-offset-8 decoration-chrome decoration-4">Return To Directory</Button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item._id} className="flex gap-8 group animate-kinetic-reveal">
                <div className="w-24 h-32 rounded-inner bg-bone overflow-hidden flex-shrink-0 border border-onyx/5">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex flex-col justify-between flex-grow py-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-onyx">{item.name?.split('-')[0]}</h3>
                      <p className="technical text-onyx/30">₹{item.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 border border-onyx/10 px-4 h-10 rounded-full">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="text-xs hover:text-chrome">-</button>
                      <span className="technical text-[10px]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="text-xs hover:text-chrome">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="technical text-[8px] text-onyx/20 hover:text-onyx transition-colors">REMOVE_ENTRY</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financials & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-10 bg-bone space-y-10 border-t border-onyx/5">
            <div className="space-y-4">
              <div className="flex justify-between technical text-[9px] text-onyx/40">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between technical text-[9px] text-onyx/40">
                <span>Deployment Fee</span>
                <span className={delivery === 0 ? 'text-onyx font-black' : ''}>{delivery === 0 ? 'FREE_CREDIT' : `₹${delivery}`}</span>
              </div>
              <div className="flex justify-between text-lg font-black pt-4 border-t border-onyx/10">
                <span className="technical">Total_Value</span>
                <span>₹{total}</span>
              </div>
            </div>
            
            <Link href="/checkout" onClick={closeCart}>
              <Button className="h-20 w-full rounded-full bg-onyx text-white hover:scale-[1.02] active:scale-95 transition-all text-xs font-black tracking-[0.4em] shadow-kinetic relative overflow-hidden group">
                <span className="relative z-10">INITIATE CHECKOUT</span>
                <div className="absolute inset-0 bg-chrome translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

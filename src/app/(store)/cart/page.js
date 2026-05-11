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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-black mb-2">Your cart is empty</h2>
        <p className="text-sm text-zinc-500 mb-8 max-w-xs">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Link href="/shop">
          <Button size="lg" className="uppercase tracking-widest text-xs min-w-[200px]">
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 999 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  return (
    <div className="bg-white pb-32">
      <div className="bg-zinc-50 border-b border-zinc-100 py-16 mb-16">
        <Container>
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Shopping Cart <span className="text-zinc-400 ml-2">({getCartCount()})</span>
          </h1>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-10">
            {cartItems.map((item) => (
              <div key={item._id} className="flex gap-6 pb-10 border-b border-zinc-100 last:border-0 group">
                <div className="w-24 h-32 md:w-32 md:h-40 bg-[#f5f5f5] flex-shrink-0 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
                <div className="flex flex-col flex-grow justify-between py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-black mb-1">{item.name}</h3>
                      <p className="text-sm text-zinc-500 uppercase tracking-widest text-[10px]">Premium Collection</p>
                    </div>
                    <p className="text-base font-medium text-black">₹{item.price?.toLocaleString('en-IN')}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-zinc-200 h-9">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-9 h-full flex items-center justify-center hover:bg-zinc-50 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-xs font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-9 h-full flex items-center justify-center hover:bg-zinc-50 transition-colors"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 hover:text-black transition-colors"
                      onClick={() => removeFromCart(item._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="sticky top-32">
            <Card className="bg-zinc-50 border-0" padding={true}>
              <h3 className="text-[11px] uppercase tracking-widest font-bold text-black mb-8">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="text-black font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Delivery</span>
                  <span className={deliveryCharge === 0 ? 'text-green-600 font-bold' : 'text-black font-medium'}>
                    {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[10px] text-zinc-400 italic">
                    Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free delivery
                  </p>
                )}
              </div>

              <div className="pt-6 border-t border-zinc-200 mb-8 flex justify-between items-end">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400">Total Price</p>
                  <p className="text-2xl font-bold text-black leading-none">₹{total.toLocaleString('en-IN')}</p>
                </div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Incl. of all taxes</p>
              </div>

              <Link href="/checkout">
                <Button fullWidth size="lg" className="uppercase tracking-widest text-xs h-14">
                  Proceed to Checkout
                </Button>
              </Link>

              <div className="mt-8 flex flex-col gap-3">
                <TrustIcon label="Secure Checkout" icon="🔒" />
                <TrustIcon label="Razorpay Protected" icon="🛡️" />
                <TrustIcon label="Easy 7-Day Returns" icon="↩️" />
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

const TrustIcon = ({ label, icon }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm">{icon}</span>
    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{label}</span>
  </div>
);

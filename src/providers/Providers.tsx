'use client';

import { SessionProvider } from 'next-auth/react';
import { CurrencyProvider } from './CurrencyProvider';
import { CartProvider } from '@/hooks/useCart';
import { CouponProvider } from '@/hooks/useCoupon';
import { WishlistProvider } from '@/hooks/useWishlist';
import { RecentlyViewedProvider } from '@/hooks/useRecentlyViewed';
import { ToastProvider } from '@/shared/ui/Toast';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CurrencyProvider>
          <CartProvider>
            <CouponProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  {children}
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CouponProvider>
          </CartProvider>
        </CurrencyProvider>
      </ToastProvider>
    </SessionProvider>
  );
}

'use client';

import { SessionProvider } from 'next-auth/react';
import { CurrencyProvider } from './CurrencyProvider';
import { CartProvider } from '@/hooks/useCart';
import { WishlistProvider } from '@/hooks/useWishlist';
import { RecentlyViewedProvider } from '@/hooks/useRecentlyViewed';
import { ToastProvider } from '@/shared/ui/Toast';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CurrencyProvider>
          <CartProvider>
            <WishlistProvider>
              <RecentlyViewedProvider>
                {children}
              </RecentlyViewedProvider>
            </WishlistProvider>
          </CartProvider>
        </CurrencyProvider>
      </ToastProvider>
    </SessionProvider>
  );
}

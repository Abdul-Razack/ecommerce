'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '@/hooks/useCart';
import { WishlistProvider } from '@/hooks/useWishlist';
import { RecentlyViewedProvider } from '@/hooks/useRecentlyViewed';
import { ToastProvider } from '@/shared/ui/Toast';

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              {children}
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}

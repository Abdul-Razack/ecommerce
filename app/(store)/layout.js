'use client';

import { CartProvider } from '@/hooks/useCart';
import { ToastProvider } from '@/components/ui/Toast';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';

export default function StoreLayout({ children }) {
  return (
    <CartProvider>
      <ToastProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </ToastProvider>
    </CartProvider>
  );
}

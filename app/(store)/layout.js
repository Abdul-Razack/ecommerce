'use client';

import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/components/ui/Toast';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';

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

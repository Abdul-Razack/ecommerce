'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import Container from './Container';

/**
 * Detached Navigation (2026 DTC Overhaul)
 * A floating, pill-shaped bar with kinetic feedback.
 */
export default function Navbar() {
  const { getCartCount, isLoaded, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none">
      <nav className={`
        pointer-events-auto flex items-center justify-between
        max-w-fit px-5 h-12 rounded-full transition-all duration-700
        ${isScrolled 
          ? 'glass-chrome scale-95 shadow-kinetic text-onyx translate-y-[-5px]' 
          : 'bg-[#F1F1EF]/40 backdrop-blur-xl border border-onyx/5 shadow-tactile text-onyx'
        }
      `}>
        {/* Brand */}
        <Link href="/" className="text-base md:text-lg font-black tracking-[0.2em] md:mr-10 hover:scale-105 transition-transform flex items-center gap-2">
          ENERGY <span className="text-[8px] opacity-20">®</span>
        </Link>

        {/* Directory Links: Desktop Only */}
        <div className="hidden md:flex items-center gap-6 mr-10 border-r border-onyx/5 pr-10 h-6">
          {[
            { name: 'Identity', href: '/about' },
            { name: 'Directory', href: '/shop' },
            { name: 'Orders', href: '/orders' }
          ].map((link) => (
            <Link 
              key={link.name}
              href={link.href}
              className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-opacity"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action: Shopping Bag */}
        <button 
          onClick={openCart}
          className="flex items-center gap-4 group hover:scale-105 transition-transform"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100">Bag</span>
          <div className="bg-chrome w-10 h-7 rounded-full flex items-center justify-center relative shadow-sm">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-onyx">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {isLoaded && getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-onyx text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                {getCartCount()}
              </span>
            )}
          </div>
        </button>
      </nav>
    </header>
  );
}

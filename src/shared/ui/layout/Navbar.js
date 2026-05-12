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
        <Link href="/" className="text-sm md:text-lg font-black tracking-[0.2em] flex-shrink-0 flex items-center gap-1">
          ENERGY <span className="text-[7px] md:text-[8px] opacity-20">®</span>
        </Link>

        {/* Directory Links: Refined for all screens */}
        <div className="flex items-center gap-4 md:gap-8 mx-4 md:mx-10 md:border-r border-onyx/10 md:pr-10 h-6 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {[
            { name: 'Identity', href: '/about' },
            { name: 'Directory', href: '/shop' },
            { name: 'Orders', href: '/orders' }
          ].map((link) => (
            <Link 
              key={link.name}
              href={link.href}
              className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${pathname === link.href ? 'text-onyx opacity-100' : 'opacity-20 hover:opacity-100'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action: Shopping Bag */}
        <button 
          onClick={openCart}
          className="flex-shrink-0 flex items-center group hover:scale-105 transition-transform"
        >
          <div className="bg-chrome w-9 h-7 md:w-10 md:h-7 rounded-full flex items-center justify-center relative shadow-sm">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-onyx">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {isLoaded && getCartCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-onyx text-white text-[6px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">
                {getCartCount()}
              </span>
            )}
          </div>
        </button>
      </nav>
    </header>
  );
}

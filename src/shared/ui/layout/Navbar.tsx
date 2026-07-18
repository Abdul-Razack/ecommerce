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
export default function Navbar({ user, signInUrl, onSignOut }) {
  const { getCartCount, isLoaded, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClose = () => setIsUserDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isUserDropdownOpen]);

  const userDisplayName = user?.firstName || user?.email?.split('@')[0];

  return (
    <>
      {/* Top scroll mask to hide elements peeking behind the floating navbar */}
      <div className={`fixed top-0 left-0 right-0 h-12 bg-white/90 backdrop-blur-md z-[90] transition-opacity duration-500 pointer-events-none ${isScrolled ? 'opacity-100' : 'opacity-0'}`} />
      
      <header className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none">
        <nav className={`
          pointer-events-auto flex items-center justify-between
          max-w-fit px-5 h-12 rounded-full transition-all duration-700
          ${isScrolled 
            ? 'bg-black/95 scale-95 shadow-kinetic text-white translate-y-[-5px] border border-white/10' 
            : 'bg-black text-white border border-white/10 shadow-tactile'
          }
        `}>
        {/* Brand Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center">
          <img src="/images/logo.png" alt="Posh Pigeon Logo" className="h-6 md:h-7 w-auto object-contain" />
        </Link>

        {/* Directory Links: Refined for all screens */}
        <div className="flex items-center gap-4 md:gap-8 mx-4 md:mx-8 md:border-r border-white/10 md:pr-8 h-6 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {[
            { name: 'About', href: '/about' },
            { name: 'Shop', href: '/shop' },
            { name: 'Orders', href: user ? '/account/orders' : '/orders' }
          ].map((link) => (
            <Link 
              key={link.name}
              href={link.href}
              className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${pathname === link.href ? 'text-white opacity-100' : 'text-white/40 hover:text-white hover:opacity-100'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Action Zone: Cart icon first, then User Dropdown */}
        <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
          {/* 1. Shopping Bag Button */}
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

          {/* 2. User Action Block with Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {user ? (
              <>
                <button 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-onyx text-[#F1F1EF] flex items-center justify-center text-[9px] md:text-[10px] font-black select-none shadow-sm transition-all hover:scale-105 border-none cursor-pointer focus:outline-none"
                >
                  {(userDisplayName?.split(' ')[0] || 'U').charAt(0).toUpperCase()}
                </button>

                {/* Premium Float Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-10 mt-2 w-48 bg-[#F1F1EF] backdrop-blur-2xl border border-onyx/10 rounded-2xl p-4 shadow-kinetic space-y-3 flex flex-col z-[150] animate-deploy animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pb-2 border-b border-onyx/5 truncate">
                      <span className="technical text-[7px] text-onyx/30 uppercase tracking-widest block mb-1">Account</span>
                      <span className="text-[8px] font-black uppercase tracking-[0.1em] text-onyx truncate block">
                        {userDisplayName}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left text-[8px] font-black uppercase tracking-[0.25em] text-red-600 hover:text-red-800 transition-all cursor-pointer bg-transparent border-none p-0 pt-1"
                    >
                      LOGOUT →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <a 
                href={signInUrl}
                className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white opacity-40 hover:opacity-100 hover:text-chrome transition-all"
              >
                LOGIN
              </a>
            )}
          </div>
        </div>
      </nav>
      <style jsx global>{`
        @keyframes deploy {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-deploy {
          animation: deploy 0.25s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
      `}</style>
      </header>
    </>
  );
}

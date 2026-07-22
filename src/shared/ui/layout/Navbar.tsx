'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import Container from './Container';

export default function Navbar({ user, signInUrl, onSignOut }) {
  const { getCartCount, isLoaded, openCart } = useCart();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClose = () => setIsUserDropdownOpen(false);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, [isUserDropdownOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userDisplayName = user?.firstName || user?.email?.split('@')[0];

  return (
    <header className="sticky top-0 left-0 right-0 z-[100] w-full bg-white shadow-sm font-sans">
      {/* 1. Top Announcement Bar */}
      <div className="bg-black text-white border-b border-white/5 relative">
        <Container className="max-w-[1400px] h-9 flex items-center justify-center px-4 md:px-8 text-[9px] md:text-[10px] uppercase font-bold tracking-widest relative">
          <div className="text-center">
            FREE SHIPPING ON ALL ORDERS OVER ₹999 | EASY 7-DAY RETURNS
          </div>
          <div className="hidden md:flex items-center gap-6 text-[9px] font-bold text-zinc-400 absolute right-4 md:right-8">
            <Link href="/about" className="hover:text-white transition-colors">Store Locator</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-white transition-colors">Help</Link>
          </div>
        </Container>
      </div>

      {/* 2. Main Navigation Header */}
      <div className="bg-bone/90 backdrop-blur-md transition-colors duration-300">
        <Container className="max-w-[1400px] h-20 md:h-24 flex items-center justify-between gap-4 px-4 md:px-8">
          
          {/* Left: Brand Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              <img src="/images/logo.png" alt="Posh Pigeon Logo" className="h-10 md:h-12 w-auto object-contain py-1" />
            </Link>
          </div>

          {/* Center: Directory Links (Desktop Only) */}
          <div className="hidden lg:flex flex-none items-center justify-center gap-8 xl:gap-10">
            {[
              { name: 'NEW IN', href: '/shop' },
              { name: 'LEGGINGS', href: '/shop?category=leggings' },
              { name: 'NIGHTIES', href: '/shop?category=nighty' },
              { name: 'INSKIRTS', href: '/shop?category=inskirt' },
              { name: 'SAREES', href: '/shop?category=sarees' },
              { name: 'ABOUT', href: '/about' }
            ].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-black hover:-translate-y-0.5 ${
                    isActive 
                      ? 'text-black' 
                      : 'text-zinc-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right: Action Zone (Search, Wishlist, Profile, Cart) */}
          <div className="flex-1 flex justify-end items-center gap-3 md:gap-5">
            
            {/* Search Input Bar (Desktop/Tablet) */}
            <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-48 xl:w-64">
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors bg-transparent border-none p-0 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-full border border-zinc-200/50 bg-white/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black/20 text-[11px] font-medium placeholder-zinc-400 text-black transition-all"
              />
            </form>

            {/* Mobile Search Icon (redirects to shop page) */}
            <Link href="/shop" className="lg:hidden p-2 text-zinc-600 hover:text-black transition-colors" title="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {user ? (
                <>
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-8 h-8 rounded-full bg-black text-bone flex items-center justify-center text-xs font-black select-none shadow-sm transition-all hover:scale-105 border-none cursor-pointer focus:outline-none"
                  >
                    {(userDisplayName?.split(' ')[0] || 'U').charAt(0).toUpperCase()}
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-10 mt-2 w-48 bg-bone border border-zinc-200/50 rounded-2xl p-4 shadow-kinetic space-y-3 flex flex-col z-[150] animate-deploy">
                      <div className="pb-2 border-b border-zinc-200/50 truncate">
                        <span className="technical text-[7px] text-zinc-500 uppercase tracking-widest block mb-1">Account</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-black truncate block">
                          {userDisplayName}
                        </span>
                      </div>
                      <Link 
                        href="/account"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full text-left text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors block pb-1 border-b border-zinc-200/50"
                      >
                        MY DASHBOARD →
                      </Link>
                      <button 
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left text-[9px] font-black uppercase tracking-[0.2em] text-rose-600 hover:text-rose-800 transition-colors cursor-pointer bg-transparent border-none p-0 pt-1"
                      >
                        LOGOUT →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <a 
                  href={signInUrl}
                  className="p-2 text-zinc-600 hover:text-black transition-colors flex items-center justify-center"
                  title="Login"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </a>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link href="/shop" className="p-2 text-zinc-600 hover:text-red-500 transition-colors flex items-center justify-center" title="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </Link>

            {/* Shopping Cart Bag Icon */}
            <button 
              onClick={openCart}
              className="p-2 text-zinc-600 hover:text-black transition-colors flex items-center justify-center relative group"
              title="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {isLoaded && getCartCount() > 0 && (
                <span className="absolute top-0 right-0 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {getCartCount()}
                </span>
              )}
            </button>

          </div>
        </Container>
      </div>

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
  );
}

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
      <div className="bg-black text-white h-9 flex items-center justify-between px-4 md:px-8 text-[9px] md:text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
        <div className="flex-1 text-center md:text-left">
          FREE SHIPPING ON ALL ORDERS OVER ₹999 | EASY 7-DAY RETURNS
        </div>
        <div className="hidden md:flex items-center gap-6 text-[9px] font-bold text-zinc-400">
          <Link href="/about" className="hover:text-white transition-colors">Store Locator</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-white transition-colors">Help</Link>
        </div>
      </div>

      {/* 2. Main Navigation Header */}
      <div className="border-b border-zinc-150 bg-white/95 backdrop-blur-md">
        <Container className="max-w-7xl h-16 md:h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
            <img src="/images/logo.png" alt="Posh Pigeon Logo" className="h-7 md:h-9 w-auto object-contain" />
          </Link>

          {/* Directory Links (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {[
              { name: 'NEW IN', href: '/shop' },
              { name: 'LEGGINGS', href: '/shop?category=leggings' },
              { name: 'NIGHTIES', href: '/shop?category=nighties' },
              { name: 'INSKIRTS', href: '/shop?category=inskirts' },
              { name: 'SAREES', href: '/shop?category=sarees' },
              { name: 'ABOUT', href: '/about' }
            ].map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] transition-colors py-2 border-b-2 ${
                    isActive 
                      ? 'text-black border-black' 
                      : 'text-zinc-500 hover:text-black border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Zone (Search, Wishlist, Profile, Cart) */}
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* Search Input Bar (Desktop/Tablet) */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-xs w-44 lg:w-60">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-full border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black text-[11px] font-medium placeholder-zinc-400 text-black transition-all"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors bg-transparent border-none p-0 cursor-pointer">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
            </form>

            {/* Mobile Search Icon (redirects to shop page) */}
            <Link href="/shop" className="md:hidden p-2 text-zinc-700 hover:text-black transition-colors" title="Search">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
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
                    className="w-8 h-8 rounded-full bg-black text-[#F1F1EF] flex items-center justify-center text-xs font-black select-none shadow-sm transition-all hover:scale-105 border-none cursor-pointer focus:outline-none"
                  >
                    {(userDisplayName?.split(' ')[0] || 'U').charAt(0).toUpperCase()}
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-10 mt-2 w-48 bg-white border border-zinc-150 rounded-2xl p-4 shadow-kinetic space-y-3 flex flex-col z-[150] animate-deploy">
                      <div className="pb-2 border-b border-zinc-100 truncate">
                        <span className="technical text-[7px] text-zinc-400 uppercase tracking-widest block mb-1">Account</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-black truncate block">
                          {userDisplayName}
                        </span>
                      </div>
                      <Link 
                        href="/account"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="w-full text-left text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-black transition-colors block pb-1 border-b border-zinc-50"
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
                  className="p-2 text-zinc-700 hover:text-black transition-colors flex items-center justify-center"
                  title="Login"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </a>
              )}
            </div>

            {/* Wishlist Icon */}
            <Link href="/shop" className="p-2 text-zinc-700 hover:text-red-500 transition-colors flex items-center justify-center" title="Wishlist">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </Link>

            {/* Shopping Cart Bag Icon */}
            <button 
              onClick={openCart}
              className="p-2 text-zinc-700 hover:text-black transition-colors flex items-center justify-center relative group"
              title="Shopping Cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {isLoaded && getCartCount() > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
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

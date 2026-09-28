'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useCurrency } from '@/providers/CurrencyProvider';
import Container from './Container';
import { handleSignOut } from '@/app/actions';
import { 
  Sparkles, 
  Shirt, 
  Crown, 
  Heart, 
  Moon, 
  Shield, 
  Gem, 
  Flower2, 
  Search, 
  User as UserIcon, 
  ShoppingBag, 
  Menu, 
  ChevronDown,
  ArrowRight,
  Check 
} from 'lucide-react';

const CATEGORY_ITEMS = [
  { name: 'Leggings & Churidar', href: '/shop?category=leggings', Icon: Sparkles },
  { name: 'Chudidar Suits', href: '/shop?category=chudidar', Icon: Shirt },
  { name: 'Festive Lehenga', href: '/shop?category=lehenga', Icon: Crown },
  { name: 'Kids Silk Skirt', href: '/shop?category=children-silk-skirt', Icon: Heart },
  { name: 'Cotton Nighties', href: '/shop?category=nighty', Icon: Moon },
  { name: 'Saree Inskirts', href: '/shop?category=inskirt', Icon: Shield },
  { name: 'Silk & Cotton Sarees', href: '/shop?category=sarees', Icon: Gem },
  { name: 'Kurtis & Tunics', href: '/shop?category=kurtis', Icon: Flower2 },
];

export default function Navbar({ user, signInUrl }) {
  const { getCartCount, isLoaded, openCart } = useCart();
  const { currency, setCurrency, formatPrice } = useCurrency();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleClose = () => {
      setIsUserDropdownOpen(false);
      setIsCategoryMenuOpen(false);
      setIsCurrencyDropdownOpen(false);
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userDisplayName = user?.firstName || user?.email?.split('@')[0];

  return (
    <header className="sticky top-0 left-0 right-0 z-[100] w-full bg-white shadow-sm font-sans">
      {/* 1. Slim Announcement Bar */}
      <div className="bg-black text-white border-b border-white/5">
        <Container className="h-8 flex items-center justify-between gap-4 text-[9px] uppercase font-bold tracking-widest">
          <div className="truncate">
            FREE SHIPPING ON ALL ORDERS OVER {formatPrice(999)} | EASY 7-DAY RETURNS
          </div>
          <div className="flex items-center gap-3 text-zinc-400 flex-shrink-0">
            <div className="hidden md:flex items-center gap-3 text-[9px]">
              <Link href="/about" className="hover:text-white transition-colors">Help</Link>
              <span>•</span>
            </div>
            
            {/* Custom Currency Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                  setIsUserDropdownOpen(false);
                  setIsCategoryMenuOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-zinc-300 hover:text-white font-bold cursor-pointer outline-none uppercase py-0.5 px-1.5 rounded transition-colors text-[9px] hover:bg-white/10"
                aria-label="Select Currency"
                aria-expanded={isCurrencyDropdownOpen}
              >
                <span>{currency === 'INR' ? 'INR (₹)' : 'MYR (RM)'}</span>
                <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-200 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-40 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-[200] animate-deploy">
                  <div className="px-2.5 py-1 text-[8px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-800/80 mb-1">
                    Select Currency
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency('INR');
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer border-none text-left ${
                      currency === 'INR'
                        ? 'bg-white/15 text-white font-black'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center text-[9px] font-black">₹</span>
                      <span>INR (₹)</span>
                    </span>
                    {currency === 'INR' && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrency('MYR');
                      setIsCurrencyDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider transition-all cursor-pointer border-none text-left ${
                      currency === 'MYR'
                        ? 'bg-white/15 text-white font-black'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-200 flex items-center justify-center text-[8px] font-black">RM</span>
                      <span>MYR (RM)</span>
                    </span>
                    {currency === 'MYR' && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* 2. Short Compact Navigation Header */}
      <div className="bg-bone/95 backdrop-blur-md border-b border-zinc-100">
        <Container className="h-14 md:h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
                setIsCurrencyDropdownOpen(false);
              }}
              className="lg:hidden p-1.5 text-zinc-700 hover:text-black focus:outline-none"
              title="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <img src="/images/logo.png" alt="Posh Pigeon Logo" className="h-7 md:h-8 w-auto object-contain" />
            </Link>
          </div>

          {/* Center: Clean Compact Links */}
          <div className="hidden lg:flex items-center justify-center gap-6 xl:gap-8">
            <Link 
              href="/shop"
              className={`text-[10px] xl:text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:text-black ${
                pathname === '/shop' ? 'text-black font-black border-b-2 border-black pb-0.5' : 'text-zinc-600'
              }`}
            >
              SHOP ALL
            </Link>

            {/* Dropdown for All Categories */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setIsCategoryMenuOpen(!isCategoryMenuOpen);
                  setIsUserDropdownOpen(false);
                  setIsCurrencyDropdownOpen(false);
                }}
                className={`flex items-center gap-1 text-[10px] xl:text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:text-black cursor-pointer bg-transparent border-none p-0 ${
                  isCategoryMenuOpen ? 'text-black' : 'text-zinc-600'
                }`}
              >
                <span>CATEGORIES</span>
                <ChevronDown className="w-3 h-3 stroke-[2.5]" />
              </button>

              {isCategoryMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-9 mt-1 w-64 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-3 grid grid-cols-1 gap-1 z-[150] animate-deploy">
                  <div className="px-3 py-1.5 border-b border-zinc-100 text-[8px] font-black uppercase tracking-widest text-zinc-400">
                    Women's Apparel Range
                  </div>
                  {CATEGORY_ITEMS.map((cat) => {
                    const IconComponent = cat.Icon;
                    return (
                      <Link
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-50 hover:text-black rounded-lg transition-colors"
                      >
                        <IconComponent className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link 
              href="/shop?category=sarees"
              className={`text-[10px] xl:text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:text-black ${
                pathname.includes('sarees') ? 'text-black font-black border-b-2 border-black pb-0.5' : 'text-zinc-600'
              }`}
            >
              SAREES
            </Link>

            <Link 
              href="/shop?category=leggings"
              className={`text-[10px] xl:text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:text-black ${
                pathname.includes('leggings') ? 'text-black font-black border-b-2 border-black pb-0.5' : 'text-zinc-600'
              }`}
            >
              LEGGINGS
            </Link>

            <Link 
              href="/shop?category=chudidar"
              className={`text-[10px] xl:text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:text-black ${
                pathname.includes('chudidar') ? 'text-black font-black border-b-2 border-black pb-0.5' : 'text-zinc-600'
              }`}
            >
              CHUDIDAR
            </Link>

            <Link 
              href="/shop?category=children-silk-skirt"
              className={`text-[10px] xl:text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:text-black ${
                pathname.includes('children-silk-skirt') ? 'text-black font-black border-b-2 border-black pb-0.5' : 'text-zinc-600'
              }`}
            >
              KIDS WEAR
            </Link>
          </div>

          {/* Right: Actions (Search, Account, Cart) */}
          <div className="flex items-center gap-3">
            
            {/* Compact Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative w-40 xl:w-52">
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors bg-transparent border-none p-0 cursor-pointer">
                <Search className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-9 pr-3 rounded-full border border-zinc-200/80 bg-white/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-black text-[10px] font-medium text-black transition-all"
              />
            </form>

            {/* Profile Dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {user ? (
                <>
                  <button 
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-[11px] font-black shadow-sm transition-all hover:scale-105 border-none cursor-pointer"
                  >
                    {(userDisplayName?.split(' ')[0] || 'U').charAt(0).toUpperCase()}
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-9 mt-1 w-44 bg-white border border-zinc-200 rounded-xl p-3 shadow-xl space-y-2 flex flex-col z-[150] animate-deploy">
                      <div className="pb-2 border-b border-zinc-100 truncate">
                        <span className="text-[7px] text-zinc-400 uppercase tracking-widest block">Signed in as</span>
                        <span className="text-[9px] font-bold text-black truncate block">{userDisplayName}</span>
                      </div>
                      <Link 
                        href="/account"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="text-[9px] font-black uppercase tracking-wider text-zinc-600 hover:text-black transition-colors flex items-center justify-between py-1"
                      >
                        <span>MY DASHBOARD</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <button 
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          handleSignOut();
                        }}
                        className="text-[9px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-colors cursor-pointer bg-transparent border-none p-0 text-left pt-1 border-t border-zinc-100 flex items-center justify-between"
                      >
                        <span>LOGOUT</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <a 
                  href={signInUrl}
                  className="p-1.5 text-zinc-600 hover:text-black transition-colors flex items-center justify-center"
                  title="Login"
                >
                  <UserIcon className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Shopping Cart Bag Icon */}
            <button 
              onClick={openCart}
              className="p-1.5 text-zinc-700 hover:text-black transition-colors flex items-center justify-center relative"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {isLoaded && getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {getCartCount()}
                </span>
              )}
            </button>

          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-100 bg-white px-4 py-3 space-y-3 text-xs font-bold uppercase tracking-wider animate-deploy">
            <Link 
              href="/shop" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-black border-b border-zinc-50"
            >
              SHOP ALL PRODUCTS
            </Link>
            <div className="py-1 text-[9px] font-black tracking-widest text-zinc-400">CATEGORIES</div>
            {CATEGORY_ITEMS.map((cat) => {
              const IconComponent = cat.Icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 text-zinc-600 hover:text-black pl-2"
                >
                  <IconComponent className="w-4 h-4 text-zinc-500" />
                  <span>{cat.name}</span>
                </Link>
              );
            })}

            {/* Mobile Currency Selector */}
            <div className="pt-3 border-t border-zinc-100">
              <div className="text-[9px] font-black tracking-widest text-zinc-400 uppercase mb-2">CURRENCY</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('INR');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer border ${
                    currency === 'INR'
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[9px] font-black">₹</span>
                  <span>INR (₹)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency('MYR');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-bold tracking-wider transition-all cursor-pointer border ${
                    currency === 'MYR'
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[8px] font-black">RM</span>
                  <span>MYR (RM)</span>
                </button>
              </div>
            </div>

            {/* Mobile Help Link */}
            <div className="pt-1 border-t border-zinc-100">
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-[10px] font-bold text-zinc-600 hover:text-black tracking-wider"
              >
                <span>HELP & ABOUT US</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes deploy {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-deploy {
          animation: deploy 0.2s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
      `}</style>
    </header>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

const MobileNav = ({ user, signInUrl, onSignOut }) => {
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const [mounted, setMounted] = React.useState(false);
  const cartCount = getCartCount();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: '/', label: 'HOME', icon: <HomeIcon />, isExternal: false },
    { href: '/shop', label: 'SHOP', icon: <ShopIcon />, isExternal: false },
    { href: '/cart', label: 'CART', icon: <CartIcon count={cartCount} />, isExternal: false },
    { href: user ? '/account/orders' : '/orders', label: 'ORDERS', icon: <OrdersIcon />, isExternal: false },
    user 
      ? { onClick: onSignOut, label: 'LOGOUT', icon: <UserIcon /> }
      : { href: signInUrl, label: 'LOGIN', icon: <UserIcon />, isExternal: true }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center h-24 z-50 px-4 pb-4 rounded-t-[2.5rem] shadow-depth-3">
      {navItems.map((item) => {
        const isActive = mounted && pathname === item.href;
        const content = (
          <>
            <div className={`transition-all duration-500 ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-white/40'}`}>
              {item.icon}
            </div>
            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.2em] leading-none">{item.label}</span>
          </>
        );

        if (item.onClick) {
          return (
            <button 
              key={item.label} 
              onClick={() => item.onClick()}
              className="flex flex-col items-center justify-center gap-3 text-white/30 hover:text-white transition-all duration-500 scale-100 hover:scale-110 bg-transparent border-none p-0 cursor-pointer"
            >
              {content}
            </button>
          );
        }

        if (item.isExternal) {
          return (
            <a 
              key={item.label} 
              href={item.href}
              className="flex flex-col items-center justify-center gap-3 text-white/30 hover:text-white transition-all duration-500 scale-100 hover:scale-110"
            >
              {content}
            </a>
          );
        }

        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center justify-center gap-3 transition-all duration-500 ${isActive ? 'text-white scale-110' : 'text-white/30'}`}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
};

const OrdersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ShopIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const CartIcon = ({ count }) => (
  <div className="relative">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[6px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-depth-1">
        {count}
      </span>
    )}
  </div>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default MobileNav;

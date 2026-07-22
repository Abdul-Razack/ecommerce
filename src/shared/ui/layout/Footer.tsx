'use client';

import React from 'react';
import Link from 'next/link';
import Container from './Container';

/**
 * Onyx Doormat Footer (2026 DTC Overhaul)
 * High-utility navigation with monochromatic depth.
 */
export default function Footer() {
  return (
    <footer className="bg-onyx text-white rounded-t-[3rem] py-20 relative overflow-hidden mt-24 md:mt-32">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-16">
          {/* Brand & Manifesto */}
          <div className="md:col-span-4 space-y-6">
            <img src="/images/logo.png" alt="Posh Pigeon Logo" className="h-12 w-auto object-contain opacity-80" />
            <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
              Premium Quality apparel for every woman. Unmatched Comfort and Style.
            </p>
            {/* Newsletter: Compact Pill */}
            <div className="relative max-w-sm mt-8">
              <input 
                type="email" 
                placeholder="Your Email Address" 
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-6 text-sm technical focus:outline-none focus:border-chrome/50"
              />
              <button className="absolute right-2 top-2 bottom-2 px-6 rounded-full bg-bone text-onyx text-[9px] font-black tracking-widest hover:bg-chrome transition-all uppercase">
                JOIN
              </button>
            </div>
          </div>

          {/* Links: Compact Grid */}
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { title: 'Shop', links: [{name: 'Leggings', href: '/shop?category=leggings'}, {name: 'Nighty', href: '/shop?category=nighty'}, {name: 'Inskirt', href: '/shop?category=inskirt'}, {name: 'Sarees', href: '/shop?category=sarees'}] },
              { title: 'Policy', links: [{name: 'Size Guide', href: '/about'}, {name: 'Returns & Replacements', href: '/about'}, {name: 'About Us', href: '/about'}] },
              { title: 'Support', links: [{name: 'Order Tracking', href: '/orders'}, {name: 'Privacy Policy', href: '/about'}, {name: 'Secure Payment', href: '/about'}] }
            ].map((col) => (
              <div key={col.title} className="space-y-4">
                <span className="technical text-[10px] text-white/20">{col.title}</span>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="text-xs technical opacity-60 hover:opacity-100 hover:text-chrome transition-all block">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-10 text-[10px] technical opacity-20 uppercase tracking-[0.2em]">
          <span>© 2026 Posh Pigeon Collective</span>
          <div className="flex gap-8 mt-4 md:mt-0">
            {['Instagram', 'Twitter', 'Laboratory'].map(social => (
              <span key={social} className="hover:text-white cursor-pointer transition-colors uppercase">{social}</span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

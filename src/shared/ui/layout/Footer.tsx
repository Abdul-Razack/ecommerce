'use client';

import React from 'react';
import Link from 'next/link';
import Container from './Container';

/**
 * Onyx Doormat Footer (Responsive Mobile & Desktop Overhaul)
 */
export default function Footer() {
  return (
    <footer className="bg-onyx text-white rounded-t-[2.5rem] md:rounded-t-[3rem] py-10 md:py-16 relative overflow-hidden mt-6 md:mt-10 pb-16 md:pb-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-12 border-b border-white/10 pb-12 md:pb-16">
          {/* Brand & Newsletter */}
          <div className="md:col-span-4 space-y-4 md:space-y-6">
            <img
              src="/images/logo.png"
              alt="Posh Pigeon Logo"
              className="h-8 md:h-12 w-auto object-contain opacity-90"
            />
            <p className="text-xs md:text-sm text-zinc-400 max-w-xs leading-relaxed font-normal">
              Premium Quality apparel for every woman. Unmatched Comfort and Style.
            </p>

            {/* Newsletter: Compact Pill */}
            <div className="relative max-w-sm mt-6 md:mt-8">
              <input
                type="email"
                placeholder="Your Email Address"
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 md:py-4 px-5 md:px-6 text-xs md:text-sm font-medium focus:outline-none focus:border-white/30 text-white placeholder:text-zinc-500 placeholder:text-xs md:placeholder:text-sm placeholder:font-normal placeholder:tracking-normal"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 px-5 md:px-6 rounded-full bg-bone text-onyx text-[9px] md:text-[10px] font-black tracking-wider hover:bg-white transition-all uppercase cursor-pointer">
                JOIN
              </button>
            </div>
          </div>

          {/* Links: Compact Mobile-Friendly Grid */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-8 pt-4 md:pt-0">
            {[
              {
                title: 'Shop',
                links: [
                  { name: 'Leggings', href: '/shop?category=leggings' },
                  { name: 'Nighty', href: '/shop?category=nighty' },
                  { name: 'Inskirt', href: '/shop?category=inskirt' },
                  { name: 'Sarees', href: '/shop?category=sarees' },
                ],
              },
              {
                title: 'Policy',
                links: [
                  { name: 'Size Guide', href: '/about' },
                  { name: 'Returns & Replacements', href: '/about' },
                  { name: 'About Us', href: '/about' },
                ],
              },
              {
                title: 'Support',
                links: [
                  { name: 'Order Tracking', href: '/orders' },
                  { name: 'Privacy Policy', href: '/about' },
                  { name: 'Secure Payment', href: '/about' },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="space-y-3 md:space-y-4">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.18em] text-white/40 block">
                  {col.title}
                </span>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-[11px] md:text-xs font-medium text-zinc-300 hover:text-white transition-all block tracking-wide hover:translate-x-0.5 duration-200"
                      >
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
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 md:pt-10 text-[9px] md:text-[10px] font-medium text-zinc-500 uppercase tracking-widest gap-4 md:gap-0 text-center md:text-left">
          <span>© 2026 Posh Pigeon Collective. All rights reserved.</span>
          <div className="flex gap-6 md:gap-8">
            {['Instagram', 'Twitter', 'Laboratory'].map((social) => (
              <span
                key={social}
                className="hover:text-white cursor-pointer transition-colors uppercase"
              >
                {social}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}

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
    <footer className="bg-onyx text-white rounded-t-[3rem] py-20 relative overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-b border-white/5 pb-16">
          {/* Brand & Manifesto */}
          <div className="md:col-span-4 space-y-6">
            <h2 className="text-4xl font-black tracking-tighter">ENERGY <span className="text-xs align-top opacity-20">®</span></h2>
            <p className="editorial italic text-white/40 max-w-xs text-sm leading-relaxed">
              Engineering silhouettes for those who lead with silent intensity. Discipline is the only interface.
            </p>
            {/* Newsletter: Compact Pill */}
            <div className="relative max-w-sm mt-8">
              <input 
                type="email" 
                placeholder="Order Tracking Email" 
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
              { title: 'Collection', links: ['New Arrivals', 'Performance', 'Experimental'] },
              { title: 'Protocol', links: ['Size Protocol', 'Operational Returns', 'Our Ethos'] },
              { title: 'Support', links: ['Order Tracking', 'Privacy Protocol', 'Secure Registry'] }
            ].map((col) => (
              <div key={col.title} className="space-y-4">
                <span className="technical text-[10px] text-white/20">{col.title}</span>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <Link href="/shop" className="text-xs technical opacity-60 hover:opacity-100 hover:text-chrome transition-all block">
                        {link}
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
          <span>© 2026 Onyx & Bone Operational Collective</span>
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

import React from 'react';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import Link from 'next/link';

/**
 * Onyx & Bone 2026 About Page
 * Refined editorial narrative with high-class atmospheric depth.
 */
export const metadata = {
  title: 'Our Protocol - ENERGY',
  description: 'The story behind India\'s premium quality women leggings brand.',
};

export default function AboutPage() {
  return (
    <main className="bg-bone min-h-screen pt-32 space-y-40">
      
      {/* 01. CINEMATIC HERO */}
      <section className="relative h-[70vh] flex flex-col justify-center overflow-hidden">
        <Container>
          <div className="max-w-4xl space-y-8 z-10 relative">
            <span className="technical text-onyx/30 tracking-[0.6em] animate-kinetic-reveal">Premium Leggings for Women</span>
            <h1 className="text-[clamp(3.5rem,10vw,8rem)] leading-[0.8] animate-kinetic-reveal [animation-delay:200ms] uppercase font-black">
              Beyond <br/> 
              <span className="editorial italic lowercase font-normal text-onyx/30">comfort</span>
            </h1>
          </div>
        </Container>
        {/* Backdrop Element */}
        <div className="absolute right-0 top-0 w-1/2 h-full hidden lg:block opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=1920&auto=format&fit=crop" 
            className="w-full h-full object-cover grayscale"
            alt="Performance Detail"
          />
        </div>
      </section>

      {/* 02. THE DIRECTIVE (MANIFESTO) */}
      <section className="py-24 border-y border-onyx/[0.03]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                <span className="technical text-onyx/20">The_Manifesto</span>
                <h2 className="text-5xl md:text-7xl leading-[0.9] uppercase font-black">
                  WE BELIEVE IN THE POWER OF <span className="editorial italic lowercase font-normal text-onyx/30">intention.</span>
                </h2>
              </div>
              <p className="text-xl text-onyx/60 max-w-2xl leading-relaxed editorial italic">
                ENERGY was founded on a singular premise: that women leggings should provide extreme comfort, flexibility, and durability. We believe in top-grade fabrics that match your daily flow.
              </p>
              
              {/* Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8">
                <div className="space-y-4">
                  <h4 className="technical text-onyx font-black">Fabric Grade</h4>
                  <p className="text-sm text-onyx/50 leading-relaxed uppercase tracking-tight">Top-tier stretchable fabrics designed for sweat-wicking, skin-friendliness, and non-transparency.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="technical text-onyx font-black">Elegance</h4>
                  <p className="text-sm text-onyx/50 leading-relaxed uppercase tracking-tight">A rich aesthetic language delivering unmatched color depth and perfect form retention.</p>
                </div>
              </div>
            </div>
            
            {/* Visual Anchor */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[3/4] rounded-[3rem] overflow-hidden tactile-card studio-glow">
                <img 
                  src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000&auto=format&fit=crop" 
                  alt="Vision" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2s]"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 03. THE PILLARS (VALUE CARDS) */}
      <section className="py-24">
        <Container>
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-24 gap-8">
            <h2 className="text-6xl leading-none uppercase font-black">The <br/>Protocol</h2>
            <p className="technical text-onyx/40 max-w-xs md:text-right">Core values that define our approach to global engineering.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <ValueCard 
              number="01"
              title="PRECISION"
              description="Every seam is stitched with extreme care to ensure maximum durability and dynamic flexibility."
            />
            <ValueCard 
              number="02"
              title="DISCIPLINE"
              description="We focus on pure comfort and breathability, giving you zero distractions through your busy days."
            />
            <ValueCard 
              number="03"
              title="COLLECTIVE"
              description="ENERGY brings the finest range of women activewear and daily leggings, catering to comfort-seekers across India."
            />
          </div>
        </Container>
      </section>

      {/* 04. FINAL CTA */}
      <section className="py-40 bg-onyx text-white rounded-t-[4rem]">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase">
              JOIN THE <br/> <span className="text-chrome">EVOLUTION</span>
            </h2>
            <Link href="/shop" className="inline-block pt-8">
              <Button className="h-20 px-16 rounded-full bg-chrome text-onyx text-[12px] font-black tracking-[0.5em] shadow-kinetic hover:scale-105 transition-transform uppercase">
                EXPLORE SHOP
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

const ValueCard = ({ number, title, description }) => (
  <div className="space-y-8 group">
    <div className="text-5xl technical text-onyx/10 group-hover:text-chrome transition-colors duration-700">{number}</div>
    <div className="h-px bg-onyx/5 w-full" />
    <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
    <p className="text-base text-onyx/50 leading-relaxed editorial italic">{description}</p>
  </div>
);

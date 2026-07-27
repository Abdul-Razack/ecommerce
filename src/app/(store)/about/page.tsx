import React from 'react';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import Link from 'next/link';

export const metadata = {
  title: 'Our Story - Posh Pigeon',
  description: 'Discover Posh Pigeon, India\'s premium women\'s clothing brand offering high-grade stretchable leggings, elegant sarees, cozy nighties, and comfortable inskirts.',
};

export default function AboutPage() {
  return (
    <main className="bg-bone min-h-screen pt-12 pb-0 space-y-16 md:space-y-24 overflow-x-hidden">
      
      {/* 01. VIBRANT HERO */}
      <section className="relative min-h-[65vh] flex flex-col justify-center overflow-hidden py-8 md:py-12">
        {/* Soft colorful ambient glowing background blobs */}
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-amber-200/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-[120px] pointer-events-none" />
        
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8 z-10 relative">
              <span className="inline-block text-[10px] tracking-[0.6em] font-black uppercase text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200/50 animate-kinetic-reveal">
                Premium Clothing for Women
              </span>
              <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.9] animate-kinetic-reveal [animation-delay:200ms] uppercase font-black text-onyx">
                Wear your <br/> 
                <span className="editorial italic lowercase font-normal text-rose-600 bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">confidence</span>
              </h1>
              <p className="text-base md:text-lg text-onyx/70 max-w-xl leading-relaxed animate-kinetic-reveal [animation-delay:300ms]">
                At Posh Pigeon, we create apparel that empowers women in their daily lives. We believe in crafting premium apparel that seamlessly blends style, maximum stretchability, and exceptional quality.
              </p>
              <div className="flex flex-wrap gap-4 pt-4 animate-kinetic-reveal [animation-delay:400ms]">
                <Link href="/shop">
                  <Button variant="primary" size="lg" className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200/40">
                    Explore Shop
                  </Button>
                </Link>
                <Link href="#story">
                  <Button variant="outline" size="lg" className="border-onyx/20 text-onyx hover:bg-onyx hover:text-white">
                    Our Journey
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Colorful Hero Image */}
            <div className="lg:col-span-5 relative w-full h-[350px] md:h-[500px] rounded-super overflow-hidden shadow-architectural animate-kinetic-reveal [animation-delay:300ms]">
              <img 
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop" 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                alt="Colorful Premium Women's Apparel"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 text-white">
                <span className="technical text-[9px] text-amber-200 tracking-wider">EST. 2024</span>
                <p className="text-xl font-bold uppercase tracking-tight">The Posh Pigeon Lookbook</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 02. OUR ORIGIN STORY */}
      <section id="story" className="py-12 md:py-16 bg-white/60 border-y border-onyx/[0.04] relative">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Story Image */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-kinetic group">
                <img 
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop" 
                  alt="Vibrant Traditional Saree" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/40 via-transparent to-transparent pointer-events-none" />
              </div>
              {/* Highlight badge floating */}
              <div className="absolute -bottom-6 -right-6 bg-amber-500 text-white p-6 rounded-inner shadow-lg max-w-[200px] space-y-2">
                <span className="technical text-[8px] text-amber-100">OUR COMMITMENT</span>
                <p className="text-xs font-black uppercase tracking-tight leading-tight">100% Skin-Friendly Fabrics</p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <span className="technical text-rose-600 font-bold tracking-widest">01 / The_Origin</span>
                <h2 className="text-4xl md:text-6xl leading-[0.95] uppercase font-black text-onyx">
                  Crafting comfortable <br/> 
                  <span className="editorial italic lowercase font-normal text-rose-600">masterpieces.</span>
                </h2>
              </div>
              <p className="text-lg text-onyx/70 leading-relaxed font-sans">
                Posh Pigeon was founded in India with a clear mission: to create top-grade apparel that women can live in. From beautiful daily-wear sarees to ultra-comfortable nighties, shapewear, and stretchable leggings, our focus is always on material integrity.
              </p>
              <p className="text-base text-onyx/60 leading-relaxed font-sans">
                We select premium combed cottons, durable spandex blends, and skin-friendly synthetic yarns. Our fabrics are designed for excellent sweat-wicking, perfect breathability, and absolute opacity (non-transparency) — allowing you to move through your day with zero hesitations and ultimate peace of mind.
              </p>
              
              {/* Material Badges */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-onyx/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <h4 className="text-xs tracking-wider uppercase font-black text-onyx">Flex-Stretch Technology</h4>
                  </div>
                  <p className="text-xs text-onyx/50 leading-relaxed uppercase">Our leggings offer four-way stretch, conforming to your body without losing shape over time.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h4 className="text-xs tracking-wider uppercase font-black text-onyx">Deep Color Retention</h4>
                  </div>
                  <p className="text-xs text-onyx/50 leading-relaxed uppercase">We use advanced reactive dyes, ensuring your sarees and nighties stay vibrant after countless washes.</p>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 03. CATEGORY SHOWCASE (LEGGINS, SAREES, NIGHTIES, INSKIRTS) */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-bone via-orange-50/30 to-bone">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12 space-y-4">
            <span className="technical text-amber-600 font-bold tracking-widest">02 / OUR CATEGORIES</span>
            <h2 className="text-4xl md:text-5xl uppercase font-black text-onyx">Explore our signature range</h2>
            <p className="text-sm text-onyx/60 font-sans">Every item is crafted with premium fabrics and tailored with meticulous detail to match your unique needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Category 1: Leggings */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-tactile group hover:shadow-kinetic transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
              <div className="relative aspect-[4/5] overflow-hidden w-full">
                <img 
                  src="https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=600&auto=format&fit=crop" 
                  alt="Premium Leggings"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-rose-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                  Leggings
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-onyx uppercase tracking-tight">Ultra-Stretch Leggings</h3>
                  <p className="text-xs text-onyx/60 leading-relaxed font-sans">Four-way stretchable knit fabric that feels like a second skin. Dynamic comfort that lasts all day.</p>
                </div>
                <Link href="/shop?category=leggings" className="inline-block w-full">
                  <span className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-rose-600/20 text-[10px] font-black uppercase tracking-wider text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300">
                    Shop Leggings
                  </span>
                </Link>
              </div>
            </div>

            {/* Category 2: Sarees */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-tactile group hover:shadow-kinetic transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
              <div className="relative aspect-[4/5] overflow-hidden w-full">
                <img 
                  src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop" 
                  alt="Elegant Sarees"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-amber-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                  Sarees
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-onyx uppercase tracking-tight">Elegant Sarees</h3>
                  <p className="text-xs text-onyx/60 leading-relaxed font-sans">Rich, traditional fabrics presenting exceptional color depth and flawless drape. Perfect for all seasons.</p>
                </div>
                <Link href="/shop?category=sarees" className="inline-block w-full">
                  <span className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-amber-600/20 text-[10px] font-black uppercase tracking-wider text-amber-600 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all duration-300">
                    Shop Sarees
                  </span>
                </Link>
              </div>
            </div>

            {/* Category 3: Nighties */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-tactile group hover:shadow-kinetic transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
              <div className="relative aspect-[4/5] overflow-hidden w-full">
                <img 
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=600&auto=format&fit=crop" 
                  alt="Cozy Nighty & Loungewear"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-purple-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                  Nighties
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-onyx uppercase tracking-tight">Cozy Loungewear</h3>
                  <p className="text-xs text-onyx/60 leading-relaxed font-sans">Ultra-soft nighties and house coats made with light, breathable cotton. Pure relaxation for cozy nights.</p>
                </div>
                <Link href="/shop?category=nighty" className="inline-block w-full">
                  <span className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-purple-600/20 text-[10px] font-black uppercase tracking-wider text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300">
                    Shop Nighties
                  </span>
                </Link>
              </div>
            </div>

            {/* Category 4: Inskirts */}
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-tactile group hover:shadow-kinetic transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
              <div className="relative aspect-[4/5] overflow-hidden w-full">
                <img 
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" 
                  alt="Comfort Inskirts"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-teal-600 text-white text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm">
                  Inskirts
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-black text-onyx uppercase tracking-tight">Premium Inskirts</h3>
                  <p className="text-xs text-onyx/60 leading-relaxed font-sans">Soft, anti-chafing inskirts designed to form the perfect, seamless foundation under your favorite sarees.</p>
                </div>
                <Link href="/shop?category=inskirt" className="inline-block w-full">
                  <span className="inline-flex items-center justify-center w-full py-3 rounded-xl border border-teal-600/20 text-[10px] font-black uppercase tracking-wider text-teal-600 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all duration-300">
                    Shop Inskirts
                  </span>
                </Link>
              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* 04. THE COMFORT PROTOCOL (VALUES & TRUST) */}
      <section className="py-12 md:py-16 bg-white/40 border-t border-onyx/[0.04]">
        <Container>
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 md:mb-12 gap-6">
            <div>
              <span className="technical text-rose-600 font-bold tracking-widest">03 / THE PROTOCOL</span>
              <h2 className="text-4xl md:text-5xl uppercase font-black text-onyx mt-2">Our customer promise</h2>
            </div>
            <p className="text-sm text-onyx/50 max-w-sm md:text-right font-sans">Premium service standards that shape our e-commerce experience throughout India.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ValueCard 
              number="01"
              title="PRECISE TAILORING"
              description="Every seam is double-stitched with durable, flex-stretch thread. This ensures high durability, prevents fraying, and delivers clean finishing for premium comfort."
              colorClass="group-hover:text-rose-500"
            />
            <ValueCard 
              number="02"
              title="DELIVERY ASSURANCE"
              description="Enjoy free delivery across India on all orders above ₹999. Every package is sealed in high-grade sanitary packing, guaranteeing your items arrive in pristine condition."
              colorClass="group-hover:text-amber-500"
            />
            <ValueCard 
              number="03"
              title="EASY 7-DAY RETURNS"
              description="Not the perfect fit? We offer an easy, hassle-free 7-day return policy. Swap sizes or get a full refund easily with our user-friendly portal."
              colorClass="group-hover:text-teal-500"
            />
          </div>
        </Container>
      </section>

      {/* 05. FINAL VIBRANT CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-tr from-rose-950 via-onyx to-indigo-950 text-white rounded-t-[3.5rem] relative overflow-hidden shadow-architectural">
        {/* Glow ambient spots inside CTA */}
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-rose-500/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px]" />
        
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10">
            <span className="technical text-rose-400 tracking-[0.4em] font-bold">JOIN THE POSH PIGEON CLUB</span>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] uppercase">
              EXPERIENCE A NEW <br/> 
              <span className="editorial italic lowercase font-normal text-amber-400 bg-gradient-to-r from-amber-400 via-rose-300 to-indigo-200 bg-clip-text text-transparent">level of comfort</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto text-sm md:text-base font-sans">
              Update your wardrobe with our newest collections of premium leggings, classic sarees, and cozy nighties. Handcrafted with the finest fabrics.
            </p>
            <div className="inline-block pt-6">
              <Link href="/shop">
                <Button className="h-16 px-12 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-black tracking-[0.4em] hover:scale-105 hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-300 uppercase border-none">
                  SHOP THE COLLECTION
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

const ValueCard = ({ number, title, description, colorClass }) => (
  <div className="p-8 rounded-[2rem] bg-white border border-onyx/[0.04] shadow-tactile group hover:shadow-kinetic hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between space-y-6">
    <div className="space-y-4">
      <div className={`text-4xl font-black tracking-tight transition-colors duration-500 text-onyx/15 ${colorClass}`}>{number}</div>
      <h3 className="text-xl font-black uppercase tracking-tight text-onyx">{title}</h3>
      <p className="text-sm text-onyx/65 leading-relaxed font-sans">{description}</p>
    </div>
    <div className="h-0.5 bg-gradient-to-r from-transparent via-onyx/5 to-transparent w-full pt-1" />
  </div>
);

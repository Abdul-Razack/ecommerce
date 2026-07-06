import React from 'react';
import Link from 'next/link';
import { client } from '@/shared/lib/sanity';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import ProductCard from '@/domains/products/components/ProductCard';

export const revalidate = 60;

export default async function Homepage() {
  // 01. Fetch Latest Deployments (New Arrivals)
  const latestProducts = await client.fetch(`*[_type == "product"] | order(_createdAt desc)[0...4] {
    _id,
    name,
    price,
    comparePrice,
    stock,
    "imageUrl": coalesce(mainImage.asset->url, externalImageUrl),
    "category": category->name,
    "slug": slug.current,
    variants
  }`);

  return (
    <main className="bg-white pt-24 pb-40">
      
      {/* 01. EDITORIAL HERO - Left EXACTLY as it is */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-10 z-10 relative">
              <div className="technical flex items-center gap-4 animate-kinetic-reveal">
                <span className="w-12 h-px bg-onyx/10" />
                Premium Collection // Vol. 26
              </div>
              <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.85] animate-kinetic-reveal [animation-delay:200ms] font-black uppercase">
                Women's <br />
                <span className="editorial italic lowercase font-normal text-onyx/30">wear</span> <br />
                Redefined <span className="text-chrome text-xl align-top">®</span>
              </h1>
              <p className="text-lg text-onyx/50 max-w-sm editorial italic animate-kinetic-reveal [animation-delay:400ms]">
                India's finest collection of premium women's Leggings, Nighties, Inskirts, and Sarees.
              </p>
              <div className="pt-8 flex flex-wrap gap-8 animate-kinetic-reveal [animation-delay:600ms]">
                <Link href="/shop">
                  <Button className="h-16 px-12 rounded-full bg-onyx text-white hover:bg-chrome hover:text-onyx transition-all text-[10px] font-black tracking-[0.4em] shadow-2xl">
                    EXPLORE SHOP
                  </Button>
                </Link>
                <Link href="#collections" className="flex items-center gap-6 group cursor-pointer hover:scale-105 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-full border border-onyx/20 flex items-center justify-center group-hover:bg-onyx group-hover:text-white transition-all">
                    <span className="text-lg">↓</span>
                  </div>
                  <span className="technical opacity-40 group-hover:opacity-100 transition-opacity">Discover</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/5] w-full max-w-[450px] mx-auto rounded-[3rem] overflow-hidden">
                <img src="/images/hero.webp" className="w-full h-full object-cover" alt="Posh Pigeon Hero" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 02. PREMIUM SHADES / COLLECTIONS FOCUS */}
      <section id="collections" className="py-24 border-t border-zinc-100">
        <Container>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">Premium Shades</h2>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Explore curated categories designed for everyday elegance</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pill 1: Leggings */}
            <div className="bg-[#FFA8A8] h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Leggings Gallery</h4>
                <Link href="/shop?category=leggings">
                  <span className="inline-block text-[9px] bg-white text-zinc-950 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer">
                    Click Now
                  </span>
                </Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=300&auto=format&fit=crop" 
                alt="Leggings Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-white/10"
              />
            </div>

            {/* Pill 2: Nighty */}
            <div className="bg-[#C1E1C1] h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Nighty Fashion</h4>
                <Link href="/shop?category=nighty">
                  <span className="inline-block text-[9px] bg-white text-zinc-950 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer">
                    Shop Now
                  </span>
                </Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=300&auto=format&fit=crop" 
                alt="Nighty Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-white/10"
              />
            </div>

            {/* Pill 3: Inskirt */}
            <div className="bg-[#FFF9C4] h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Inskirt Core</h4>
                <Link href="/shop?category=inskirt">
                  <span className="inline-block text-[9px] bg-white text-zinc-950 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer">
                    Explore
                  </span>
                </Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=300&auto=format&fit=crop" 
                alt="Inskirt Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-white/10"
              />
            </div>

            {/* Pill 4: Sarees */}
            <div className="bg-[#D7CCC8] h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-zinc-900 tracking-wider">Sarees Style</h4>
                <Link href="/shop?category=sarees">
                  <span className="inline-block text-[9px] bg-white text-zinc-950 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-black hover:text-white transition-colors cursor-pointer">
                    View Saree
                  </span>
                </Link>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=300&auto=format&fit=crop" 
                alt="Sarees Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-white/10"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 03. SPRING SALE PROMOTIONAL BANNER SECTION */}
      <section className="py-12 border-t border-zinc-100">
        <Container>
          <div className="bg-[#1A3A2B] rounded-3xl overflow-hidden shadow-kinetic grid grid-cols-1 md:grid-cols-12 relative items-stretch min-h-[280px]">
            {/* Left Content Column */}
            <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center space-y-4 text-white z-10">
              <div className="flex items-center gap-2">
                <span className="text-chrome font-black text-[9px] tracking-[0.2em] uppercase">✦ Limited Time Offer</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none text-white">
                Spring Sale is Live!
              </h3>
              <p className="text-xs text-white/70 font-medium tracking-wide">
                Enjoy up to 40% off on selected clothing collections.
              </p>
              <Link href="/shop" className="pt-2 block">
                <span className="inline-block text-[9px] bg-[#DCA095] hover:bg-white text-zinc-950 font-black px-6 py-3 rounded-full uppercase tracking-widest transition-colors cursor-pointer">
                  Explore Deals →
                </span>
              </Link>
            </div>

            {/* Overlapping Badge Circle */}
            <div className="hidden md:flex absolute left-[38%] top-1/2 -translate-y-1/2 z-20 w-28 h-28 bg-[#DCA095] text-white rounded-full border-[6px] border-[#F8F6F4] flex flex-col items-center justify-center shadow-lg pointer-events-none">
              <span className="text-[9px] uppercase tracking-widest font-black opacity-80">Up To</span>
              <span className="text-xl font-black leading-none my-0.5">40%</span>
              <span className="text-[9px] uppercase tracking-widest font-black opacity-80">Off</span>
            </div>

            {/* Right Banner Image Column */}
            <div className="md:col-span-7 relative min-h-[200px] md:min-h-full">
              <img 
                src="/promo_flatlay.png" 
                className="w-full h-full object-cover" 
                alt="Spring Sale Flatlay" 
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 04. NEW ARRIVALS CARD SECTION */}
      <section className="py-20 border-t border-zinc-100 bg-[#FAF9F5]">
        <Container>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tight text-black">New Arrivals</h2>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Fresh off the loom: browse our newly arrived collections</p>
          </div>

          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {latestProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-400 italic text-xs uppercase tracking-wider font-bold">
              New arrivals are currently being loaded. Check back soon!
            </div>
          )}
        </Container>
      </section>

      {/* 05. FINAL CTA */}
      <section className="py-40 text-center bg-white border-t border-zinc-100">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase">
              JOIN THE <br/> <span className="text-chrome">COLLECTION</span>
            </h2>
            <Link href="/shop" className="inline-block pt-8">
              <Button className="h-20 px-16 rounded-full bg-onyx text-white text-[12px] font-black tracking-[0.5em] shadow-kinetic hover:scale-105 transition-transform uppercase">
                EXPLORE SHOP
              </Button>
            </Link>
          </div>
        </Container>
      </section>

    </main>
  );
}

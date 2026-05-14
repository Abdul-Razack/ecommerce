import React from 'react';
import Link from 'next/link';
import { client } from '@/shared/lib/sanity';
import Container from '@/shared/ui/layout/Container';
import ProductCard from '@/domains/products/components/ProductCard';
import Button from '@/shared/ui/Button';

/**
 * Onyx & Bone 2026 Homepage (Operational Directory)
 */
export default async function Homepage() {
  // 01. Fetch Latest Deployments
  const latestProducts = await client.fetch(`*[_type == "product"] | order(_createdAt desc)[0...4] {
    _id, name, price, images,
    "imageUrl": coalesce(images[0].asset->url, mainImage.asset->url),
    "category": category->name,
    "slug": slug.current
  }`);

  // 02. Fetch Categories with their Products
  const categoriesWithProducts = await client.fetch(`*[_type == "category"] | order(name asc)[0...3] {
    _id,
    name,
    "products": *[_type == "product" && references(^._id)][0...4] {
      _id, name, price, images,
      "imageUrl": coalesce(images[0].asset->url, mainImage.asset->url),
      "category": category->name,
      "slug": slug.current
    }
  }`);

  // 03. Global Categories for the Bento Grid
  const allCategories = categoriesWithProducts.map(c => c.name);

  return (
    <main className="bg-bone pt-24 pb-40">
      
      {/* 01. EDITORIAL HERO */}
      <section className="relative overflow-hidden pt-12 pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-6 space-y-10 z-10 relative">
              <div className="technical flex items-center gap-4 animate-kinetic-reveal">
                <span className="w-12 h-px bg-onyx/10" />
                Premium Collection // Vol. 26
              </div>
              <h1 className="text-[clamp(3.5rem,8vw,6.5rem)] leading-[0.85] animate-kinetic-reveal [animation-delay:200ms] font-black uppercase">
                Leggings <br />
                <span className="editorial italic lowercase font-normal text-onyx/30">fashion</span> <br />
                Redefined <span className="text-chrome text-xl align-top">®</span>
              </h1>
              <p className="text-lg text-onyx/50 max-w-sm editorial italic animate-kinetic-reveal [animation-delay:400ms]">
                India's finest collection of premium women's leggings and activewear.
              </p>
              <div className="pt-8 flex flex-wrap gap-8 animate-kinetic-reveal [animation-delay:600ms]">
                <Link href="/shop">
                  <Button className="h-16 px-12 rounded-full bg-onyx text-white hover:bg-chrome hover:text-onyx transition-all text-[10px] font-black tracking-[0.4em] shadow-2xl">
                    EXPLORE SHOP
                  </Button>
                </Link>
                <Link href="#manifesto" className="flex items-center gap-6 group cursor-pointer hover:scale-105 transition-transform duration-500">
                  <div className="w-12 h-12 rounded-full border border-onyx/20 flex items-center justify-center group-hover:bg-onyx group-hover:text-white transition-all">
                    <span className="text-lg">↓</span>
                  </div>
                  <span className="technical opacity-40 group-hover:opacity-100 transition-opacity">Discover</span>
                </Link>
              </div>
            </div>
            <div className="lg:col-span-6 relative">
              <div className="relative aspect-[4/5] w-full max-w-[450px] mx-auto rounded-[3rem] overflow-hidden">
                <img src="/images/hero.webp" className="w-full h-full object-cover" alt="Aura Ethnic Hero" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 02. BENTO DIRECTORY: ARCHITECTURAL ANCHORS */}
      <section id="manifesto" className="py-12 border-y border-onyx/[0.03]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Cinematic Hero Card: Full Click */}
            <Link 
              href={`/shop/${latestProducts[0]?.slug}`}
              className="md:col-span-8 bg-onyx rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative group h-[450px] md:h-[650px] block cursor-pointer transition-all duration-700 hover:scale-[1.01] shadow-architectural tactile-card"
            >
              <img 
                src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-60 transition-transform duration-[3s] group-hover:scale-110" 
                alt="Elite Performance" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/80 via-transparent to-transparent" />
              <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-between z-10">
                <div>
                  <span className="technical text-white/40 tracking-[0.4em] animate-pulse text-[8px] md:text-[10px]">Trending Now // 2026</span>
                  <h2 className="text-4xl md:text-[7rem] text-white leading-[0.9] md:leading-[0.8] uppercase font-black mt-4 md:mt-6 tracking-tighter">
                    {latestProducts[0]?.name?.split(' ')[0] || 'Elite'} <br />
                    <span className="editorial italic lowercase font-normal text-white/30">collection</span>
                  </h2>
                </div>
                <div className="flex items-center gap-6 md:gap-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-chrome text-onyx flex items-center justify-center font-black text-xl md:text-2xl group-hover:scale-110 transition-transform shadow-kinetic">↗</div>
                  <div className="technical text-white/60 text-[10px] md:text-xs">
                    <span className="block text-chrome">Shop Now // Available</span>
                    <span className="opacity-40">Latest Collection</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Tactical Sidebar: Full Click */}
            <div className="md:col-span-4 flex flex-col gap-8">
              {/* Tier 01: Onyx Glass */}
              <Link 
                href={`/shop?category=${allCategories[0]}`}
                className="bg-onyx rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col justify-center border border-white/10 min-h-[220px] md:min-h-[310px] group cursor-pointer transition-all duration-700 hover:bg-onyx/90 shadow-architectural tactile-card text-white"
              >
                <div className="space-y-4">
                  <span className="technical text-white/40 text-[9px]">Top Categories</span>
                  <h3 className="text-3xl md:text-5xl leading-[0.9] uppercase font-black tracking-tighter text-white">
                    {allCategories[0] || 'Churidar'} <br />
                    <span className="editorial italic lowercase font-normal text-white/30">leggings</span>
                  </h3>
                  <span className="technical border-b border-chrome pb-2 group-hover:text-chrome transition-all w-max block mt-4 text-[10px] md:text-xs">Shop Category</span>
                </div>
              </Link>

              {/* Tier 02: Cloud Glass */}
              <Link 
                href={`/shop?category=${allCategories[1] || 'all'}`}
                className="bg-[#F1F1EF]/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col justify-center relative overflow-hidden min-h-[220px] md:min-h-[310px] group cursor-pointer transition-all duration-700 hover:bg-[#F1F1EF]/60 shadow-architectural tactile-card border border-onyx/5"
              >
                <div className="relative z-10 space-y-4">
                  <span className="technical text-onyx/40 text-[9px]">Discover More</span>
                  <h3 className="text-3xl md:text-5xl leading-[0.9] uppercase font-black tracking-tighter text-onyx">
                    {allCategories[1] || 'Ankle Length'} <br />
                    <span className="editorial italic lowercase font-normal text-onyx/30">leggings</span>
                  </h3>
                  <div className="technical text-onyx/60 group-hover:text-onyx transition-colors flex items-center gap-4 mt-4 text-[10px] md:text-xs">
                    Explore Collection <span className="text-chrome">→</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 04. LATEST DEPLOYMENTS: MINIMAL SLIDER */}
      <section id="registry" className="py-20 bg-[#F1F1EF] border-t border-onyx/5 overflow-hidden">
        <Container>
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-8 px-4 md:px-0">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="technical text-[10px] opacity-20 tracking-widest">NEW ARRIVALS</span>
                <div className="w-12 h-px bg-onyx/10" />
              </div>
              <h2 className="text-4xl md:text-7xl leading-[0.8] uppercase font-black tracking-tighter">New <br />Arrivals</h2>
            </div>
            <p className="technical max-w-xs md:text-right opacity-40">The finest leggings crafted for supreme comfort and perfect fit.</p>
          </div>
          
          <div className="minimal-slider -mx-4 px-4 md:mx-0 md:px-0">
            {latestProducts.map((product) => (
              <div key={product._id} className="w-[260px] md:w-[320px]">
                <ProductCard product={product} />
              </div>
            ))}
            <div className="w-20 flex-none" />
          </div>
        </Container>
      </section>

      {/* 05. CATEGORY DIRECTORY: MINIMAL SLIDERS */}
      {categoriesWithProducts.filter(cat => cat.products?.length > 0).map((category, index) => (
        <section key={category._id} className={`py-20 border-t border-onyx/5 overflow-hidden ${index % 2 === 0 ? 'bg-bone' : 'bg-[#F1F1EF]'}`}>
          <Container>
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8 px-4 md:px-0">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="technical text-[10px] opacity-20 tracking-widest">CATEGORY_0{index + 2}</span>
                  <div className="w-12 h-px bg-onyx/10" />
                </div>
                <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8]">{category.name}</h3>
              </div>
              <Link href={`/shop?category=${category.name}`} className="technical border-b border-chrome pb-2 hover:text-chrome transition-all mb-4">
                View All →
              </Link>
            </div>
            
            <div className="minimal-slider -mx-4 px-4 md:mx-0 md:px-0">
              {category.products.map((product) => (
                <div key={product._id} className="w-[260px] md:w-[320px]">
                  <ProductCard product={product} />
                </div>
              ))}
              <div className="w-20 flex-none" />
            </div>
          </Container>
        </section>
      ))}

      {/* 06. FINAL CTA */}
      <section className="py-40 text-center bg-bone">
        <Container>
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.8] uppercase">
              JOIN THE <br/> <span className="text-chrome">TREND</span>
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

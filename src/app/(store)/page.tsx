import React from 'react';
import Link from 'next/link';
import { client } from '@/shared/lib/sanity';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import ProductCard from '@/domains/products/components/ProductCard';

export const dynamic = 'force-dynamic';

export default async function Homepage() {
  // Fetch multiple sets of products for different category sections
  const [leggingsProducts, sareesProducts, nightyProducts] = await Promise.all([
    client.fetch(`*[_type == "product" && category->slug.current == "leggings"] | order(_createdAt desc)[0...4] {
      _id, name, price, comparePrice, stock,
      "imageUrl": coalesce(mainImage.asset->url, select(externalImageUrl != "" => externalImageUrl), variants[0].images[0].asset->url, select(variants[0].externalImageUrls[0] != "" => variants[0].externalImageUrls[0])),
      "category": category->name, "slug": slug.current, variants
    }`, {}, { next: { revalidate: 0 } }),
    
    client.fetch(`*[_type == "product" && category->slug.current == "sarees"] | order(_createdAt desc)[0...4] {
      _id, name, price, comparePrice, stock,
      "imageUrl": coalesce(mainImage.asset->url, select(externalImageUrl != "" => externalImageUrl), variants[0].images[0].asset->url, select(variants[0].externalImageUrls[0] != "" => variants[0].externalImageUrls[0])),
      "category": category->name, "slug": slug.current, variants
    }`, {}, { next: { revalidate: 0 } }),
    
    client.fetch(`*[_type == "product" && category->slug.current == "nighty"] | order(_createdAt desc)[0...4] {
      _id, name, price, comparePrice, stock,
      "imageUrl": coalesce(mainImage.asset->url, select(externalImageUrl != "" => externalImageUrl), variants[0].images[0].asset->url, select(variants[0].externalImageUrls[0] != "" => variants[0].externalImageUrls[0])),
      "category": category->name, "slug": slug.current, variants
    }`, {}, { next: { revalidate: 0 } })
  ]);

  return (
    <main className="bg-bone pb-40">
      
      {/* 01. EDITORIAL HERO */}
      <section className="relative w-full bg-bone min-h-[450px] lg:min-h-[600px] flex items-center py-12 lg:py-0">
        {/* Background Image for Large Screens */}
        <div className="absolute inset-0 z-0 hidden lg:block">
          <img 
            src="/images/banner-1.png" 
            alt="Hero Banner Background" 
            className="w-full h-full object-cover object-top" 
          />
        </div>
        
        {/* Mobile Background Image (dimmed overlay for text readability) */}
        <div className="absolute inset-0 z-0 lg:hidden opacity-50">
          <img 
            src="/images/banner.png" 
            alt="Hero Banner Background" 
            className="w-full h-full object-cover object-[right_top]" 
          />
        </div>

        <Container className="relative z-10 w-full pt-10 pb-32 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-6 max-w-lg bg-white/40 lg:bg-transparent p-6 lg:p-0 rounded-3xl backdrop-blur-sm lg:backdrop-blur-none">
              <span className="technical text-onyx tracking-[0.4em] uppercase">Posh Pigeon Premium</span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-onyx leading-[1.05]">
                WEAR YOUR <br/>
                <span className="editorial italic lowercase font-normal text-onyx">confidence</span>
              </h1>
              <p className="text-sm md:text-base text-onyx font-medium leading-relaxed font-sans">
                Trendy pieces. Timeless style. Posh Pigeon has everything you need to look and feel your best.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/shop">
                  <span className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-onyx text-bone hover:bg-black transition-colors text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-md">
                    SHOP NEW IN
                  </span>
                </Link>
                <Link href="#collections">
                  <span className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-onyx/20 text-onyx hover:bg-onyx hover:text-bone hover:border-onyx transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer">
                    EXPLORE COLLECTIONS
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Container>

        {/* Floating Features Bar (Desktop Only) */}
        <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 z-20 hidden lg:flex justify-center">
          <div className="bg-white border border-gray-150/50 rounded-full shadow-kinetic px-10 py-5 max-w-5xl w-full flex justify-between items-center divide-x divide-gray-100">
            {/* Feature 1 */}
            <div className="flex items-center gap-4 px-6 first:pl-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7.88a1 1 0 01.97 1.2l-.96 4.8a1 1 0 01-.97.8H13" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-black">Free Shipping</p>
                <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">On orders over ₹999</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 px-6 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-black">Easy Returns</p>
                <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">7-Day Return Policy</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 px-6 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-black">Secure Payment</p>
                <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">100% Secure Checkout</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 px-6 last:pr-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-black">Premium Quality</p>
                <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">Made in India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Features Bar */}
      <div className="lg:hidden bg-white border-y border-gray-150 py-6 px-4">
        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-black flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7.88a1 1 0 01.97 1.2l-.96 4.8a1 1 0 01-.97.8H13" /></svg>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-black">Free Shipping</p>
              <p className="text-[8px] text-gray-400 font-medium uppercase mt-0.5">Over ₹999</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-black flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-black">Easy Returns</p>
              <p className="text-[8px] text-gray-400 font-medium uppercase mt-0.5">7-Day Returns</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-black flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-black">Secure Pay</p>
              <p className="text-[8px] text-gray-400 font-medium uppercase mt-0.5">100% Encrypted</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-black flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-black">Premium Quality</p>
              <p className="text-[8px] text-gray-400 font-medium uppercase mt-0.5">Made in India</p>
            </div>
          </div>
        </div>
      </div>

      {/* 02. PREMIUM SHADES / COLLECTIONS FOCUS */}
      <section id="collections" className="py-24 border-t border-onyx/5">
        <Container>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Premium Shades</h2>
            <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Explore curated categories designed for everyday elegance</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pill 1: Leggings */}
            <div className="bg-neutral-soft h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow border border-onyx/5">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-onyx tracking-wider">Leggings Gallery</h4>
                <Link href="/shop?category=leggings">
                  <span className="inline-block text-[9px] bg-bone text-onyx border border-onyx/10 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-onyx hover:text-bone transition-colors cursor-pointer">
                    Click Now
                  </span>
                </Link>
              </div>
              <img 
                src="https://assets0.mirraw.com/images/8288550/RoyalBlue_4fe606c6-8430-41df-812b-c2b0eb46bb6d_zoom.jpg?1600076914" 
                alt="Leggings Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-onyx/5"
              />
            </div>

            {/* Pill 2: Nighty */}
            <div className="bg-[#E6DFD3] h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow border border-onyx/5">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-onyx tracking-wider">Nighty Fashion</h4>
                <Link href="/shop?category=nighty">
                  <span className="inline-block text-[9px] bg-bone text-onyx border border-onyx/10 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-onyx hover:text-bone transition-colors cursor-pointer">
                    Shop Now
                  </span>
                </Link>
              </div>
              <img 
                src="https://www.ankitadesigns.in/cdn/shop/files/350nilima.png?v=1777283189" 
                alt="Nighty Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-onyx/5"
              />
            </div>

            {/* Pill 3: Inskirt */}
            <div className="bg-[#DFD8CD] h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow border border-onyx/5">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-onyx tracking-wider">Inskirt Core</h4>
                <Link href="/shop?category=inskirt">
                  <span className="inline-block text-[9px] bg-bone text-onyx border border-onyx/10 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-onyx hover:text-bone transition-colors cursor-pointer">
                    Explore
                  </span>
                </Link>
              </div>
              <img 
                src="https://jisboutique.com/cdn/shop/files/24_166af726-83fd-4c7c-a62f-54444fbbefc3.jpg?v=1718281040" 
                alt="Inskirt Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-onyx/5"
              />
            </div>

            {/* Pill 4: Sarees */}
            <div className="bg-[#E2DCD3] h-36 rounded-full p-6 pl-10 flex items-center justify-between overflow-hidden relative group hover:shadow-lg transition-shadow border border-onyx/5">
              <div className="space-y-2 z-10">
                <h4 className="text-xs font-black uppercase text-onyx tracking-wider">Sarees Style</h4>
                <Link href="/shop?category=sarees">
                  <span className="inline-block text-[9px] bg-bone text-onyx border border-onyx/10 font-black px-4 py-2 rounded-full uppercase tracking-wider hover:bg-onyx hover:text-bone transition-colors cursor-pointer">
                    View Saree
                  </span>
                </Link>
              </div>
              <img 
                src="https://pochampallysarees.com/cdn/shop/files/PureSoftSilkBlueYellowSari.jpg?v=1762248060" 
                alt="Sarees Focus" 
                className="h-full w-24 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mr-2 border border-onyx/5"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 03. LEGGINGS COLLECTION */}
      <section className="py-20 border-t border-onyx/5">
        <Container>
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Leggings Collection</h2>
              <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Premium stretch and comfort for your everyday.</p>
            </div>
            <Link href="/shop?category=leggings" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4 hidden md:block">
              Shop Leggings
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {leggingsProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* 04. SPRING SALE PROMOTIONAL BANNER SECTION */}
      <section className="py-12 border-t border-onyx/5">
        <Container>
          <div className="bg-onyx rounded-3xl overflow-hidden shadow-kinetic grid grid-cols-1 md:grid-cols-12 relative items-stretch min-h-[280px]">
            {/* Left Content Column */}
            <div className="md:col-span-5 p-8 md:p-12 flex flex-col justify-center space-y-4 text-bone z-10">
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
                src="/images/poster-image.png" 
                className="w-full h-full object-cover" 
                alt="Spring Sale Flatlay" 
              />
            </div>
          </div>
        </Container>
      </section>

      {/* 05. SAREES COLLECTION */}
      <section className="py-20 border-t border-onyx/5 bg-neutral-soft">
        <Container>
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Exclusive Sarees</h2>
              <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Timeless elegance woven into every thread.</p>
            </div>
            <Link href="/shop?category=sarees" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4 hidden md:block">
              Shop Sarees
            </Link>
          </div>

          {sareesProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {sareesProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-zinc-400 italic text-xs uppercase tracking-wider font-bold">
              Sarees collection is currently being loaded. Check back soon!
            </div>
          )}
        </Container>
      </section>

      {/* 06. NIGHTWEAR COLLECTION */}
      <section className="py-20 border-t border-onyx/5">
        <Container>
          <div className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Nightwear & Sleepwear</h2>
              <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Luxurious comfort for your evenings.</p>
            </div>
            <Link href="/shop?category=nighty" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4 hidden md:block">
              Shop Nightwear
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {nightyProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Container>
      </section>



      {/* 08. FINAL CTA */}
      <section className="py-16 md:py-20 text-center bg-bone border-t border-onyx/5">
        <Container>
          <div className="max-w-4xl mx-auto bg-neutral-soft border border-onyx/10 rounded-[2.5rem] md:rounded-[4rem] py-14 md:py-16 px-6 md:px-10 shadow-sm relative overflow-hidden">
            {/* Decorative subtle gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
            
            <div className="relative max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight uppercase text-onyx">
                JOIN THE <span className="text-chrome">COLLECTION</span>
              </h2>
              <Link href="/shop" className="inline-block pt-4">
                <Button className="h-14 md:h-16 px-10 md:px-14 bg-onyx text-bone text-[9px] md:text-[11px] font-black tracking-[0.4em] shadow-kinetic hover:scale-105 transition-transform uppercase rounded-full">
                  EXPLORE SHOP
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </main>
  );
}

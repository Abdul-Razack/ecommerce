import React from 'react';
import Link from 'next/link';
import { client } from '@/shared/lib/sanity';
import Container from '@/shared/ui/layout/Container';
import Button from '@/shared/ui/Button';
import ProductCard from '@/domains/products/components/ProductCard';
import HeroSlider from './components/HeroSlider';
import PromoBannerSlider from './components/PromoBannerSlider';
import JsonLd from '@/shared/ui/JsonLd';
import { faqSchema, breadcrumbSchema, siteUrl } from '@/shared/lib/seo';
import { homepageFaqs, BRAND } from '@/shared/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Posh Pigeon — Women\'s Apparel: Leggings, Chudidars, Lehengas, Sarees & Nighties',
  description:
    'Shop premium women\'s textiles & apparel: 4-way stretch leggings, designer chudidars, festive lehengas, kids silk skirts (pattupavadai), cotton nighties & soft sarees. Free shipping over ₹999.',
  alternates: {
    canonical: siteUrl(),
  },
  openGraph: {
    title: 'Posh Pigeon — Women\'s Apparel & Textiles Destination',
    description: 'Shop premium stretchable leggings, chudidars, lehengas, kids silk skirts, nighties & sarees at Posh Pigeon.',
    url: siteUrl(),
    images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: 'Posh Pigeon Women Apparel' }],
  },
};

function formatServerPrice(priceInINR: number) {
  const envCurrency = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY;
  const envRegion = process.env.NEXT_PUBLIC_SERVER_REGION;
  
  let currency = 'INR';
  if (envCurrency === 'INR' || envCurrency === 'MYR') {
    currency = envCurrency;
  } else if (envRegion === 'MY' || envRegion === 'malaysia' || envRegion === 'Malaysia') {
    currency = 'MYR';
  }
  
  const rate = parseFloat(process.env.NEXT_PUBLIC_INR_TO_MYR_EXCHANGE_RATE || '0.053');
  
  if (currency === 'INR') {
    return `₹${Math.round(priceInINR).toLocaleString('en-IN')}`;
  } else {
    const converted = priceInINR * rate;
    return `RM ${converted.toLocaleString('en-MY', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export default async function Homepage() {
  const productFields = `
    _id, name, price, comparePrice, stock,
    "imageUrl": coalesce(mainImage.asset->url, select(externalImageUrl != "" => externalImageUrl), variants[0].images[0].asset->url, select(variants[0].externalImageUrls[0] != "" => variants[0].externalImageUrls[0])),
    "category": category->name, "slug": slug.current, variants
  `;

  // Fetch multiple sets of products for all women's apparel sections
  const [
    homePage,
    leggingsProducts,
    chudidarProducts,
    lehengaProducts,
    kidsSkirtProducts,
    sareesProducts,
    nightyProducts
  ] = await Promise.all([
    client.fetch(`*[_type == "homePage"][0]{
      ...,
      hero {
        ...,
        "images": images[].asset->url
      },
      promotionalBanners[] {
        ...,
        "image": coalesce(image.asset->url, customImageUrl)
      }
    }`, {}, { next: { revalidate: 0 } }),
    client.fetch(`*[_type == "product" && category->slug.current == "leggings"] | order(_createdAt desc)[0...4] { ${productFields} }`, {}, { next: { revalidate: 0 } }),
    client.fetch(`*[_type == "product" && category->slug.current == "chudidar"] | order(_createdAt desc)[0...4] { ${productFields} }`, {}, { next: { revalidate: 0 } }),
    client.fetch(`*[_type == "product" && category->slug.current == "lehenga"] | order(_createdAt desc)[0...4] { ${productFields} }`, {}, { next: { revalidate: 0 } }),
    client.fetch(`*[_type == "product" && category->slug.current == "children-silk-skirt"] | order(_createdAt desc)[0...4] { ${productFields} }`, {}, { next: { revalidate: 0 } }),
    client.fetch(`*[_type == "product" && category->slug.current == "sarees"] | order(_createdAt desc)[0...4] { ${productFields} }`, {}, { next: { revalidate: 0 } }),
    client.fetch(`*[_type == "product" && category->slug.current == "nighty"] | order(_createdAt desc)[0...4] { ${productFields} }`, {}, { next: { revalidate: 0 } })
  ]);

  return (
    <main className="bg-bone pb-40">
      {/* SEO: FAQ + Breadcrumb JSON-LD */}
      <JsonLd data={faqSchema(homepageFaqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: siteUrl('/') },
        ])}
      />

      {/* 01. EDITORIAL HERO */}
      <section className="relative w-full bg-bone min-h-[480px] lg:min-h-[620px] flex items-center py-12 lg:py-0">
        
        {/* Multi-Image Hero Slider Component */}
        <HeroSlider images={homePage?.hero?.images || []} />

        <Container className="relative z-10 w-full pt-10 pb-32 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6 max-w-xl bg-white/60 lg:bg-transparent p-6 lg:p-0 rounded-3xl backdrop-blur-md lg:backdrop-blur-none border border-white/40 lg:border-none shadow-xl lg:shadow-none">
              <span className="technical text-onyx tracking-[0.4em] uppercase font-bold text-[10px]">Posh Pigeon Women's Apparel</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-onyx leading-[1.08]">
                Elegance in Every <br />
                <span className="editorial italic lowercase font-normal text-onyx">textile & thread</span>
              </h1>
              <p className="text-sm md:text-base text-onyx/80 font-medium leading-relaxed font-sans">
                Discover our signature collection of stretchable leggings, designer chudidars, festive lehengas, kids silk skirts (Pattupavadai), cotton nighties & sarees crafted for your everyday comfort and festive grace.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/shop">
                  <span className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-onyx text-bone hover:bg-black transition-colors text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-md">
                    SHOP ALL WOMEN'S WEAR
                  </span>
                </Link>
                <Link href="#categories">
                  <span className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-onyx/20 text-onyx hover:bg-onyx hover:text-bone hover:border-onyx transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer">
                    EXPLORE CATEGORIES
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </Container>

        {/* Floating Features Bar (Desktop Only) */}
        <div className="absolute bottom-0 translate-y-1/2 left-0 right-0 z-20 hidden lg:flex justify-center">
          <div className="bg-white border border-gray-150/50 rounded-full shadow-kinetic px-10 py-5 max-w-5xl 2xl:max-w-6xl w-full flex justify-between items-center divide-x divide-gray-100">
            {/* Feature 1 */}
            <div className="flex items-center gap-4 px-6 first:pl-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-black">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10M13 8h7.88a1 1 0 01.97 1.2l-.96 4.8a1 1 0 01-.97.8H13" /></svg>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-black">Free Shipping</p>
                <p className="text-[9px] text-gray-400 font-medium uppercase mt-0.5 tracking-wider">On orders over {formatServerPrice(999)}</p>
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

      {/* 02. FULL WOMEN'S APPAREL CATEGORY GRID */}
      <section id="categories" className="py-24 border-t border-onyx/5">
        <Container>
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Women's Textiles & Apparel Range</h2>
            <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Explore all specialized women & kids apparel sections</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                tag: 'Leggings',
                title: 'Stretch Leggings',
                href: '/shop?category=leggings',
                buttonText: 'Shop Leggings →',
                img: 'https://assets0.mirraw.com/images/8288550/RoyalBlue_4fe606c6-8430-41df-812b-c2b0eb46bb6d_zoom.jpg?1600076914'
              },
              {
                num: '02',
                tag: 'Chudidar',
                title: 'Chudidar & Suits',
                href: '/shop?category=chudidar',
                buttonText: 'Shop Chudidars →',
                img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'
              },
              {
                num: '03',
                tag: 'Lehenga',
                title: 'Festive Lehenga',
                href: '/shop?category=lehenga',
                buttonText: 'Shop Lehengas →',
                img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop'
              },
              {
                num: '04',
                tag: 'Kids Wear',
                title: 'Kids Pattupavadai',
                href: '/shop?category=children-silk-skirt',
                buttonText: 'Shop Kids Wear →',
                img: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop'
              },
              {
                num: '05',
                tag: 'Sleepwear',
                title: 'Cotton Nighties',
                href: '/shop?category=nighty',
                buttonText: 'Shop Nighties →',
                img: 'https://www.ankitadesigns.in/cdn/shop/files/350nilima.png?v=1777283189'
              },
              {
                num: '06',
                tag: 'Foundation',
                title: 'Saree Inskirts',
                href: '/shop?category=inskirt',
                buttonText: 'Shop Inskirts →',
                img: 'https://jisboutique.com/cdn/shop/files/24_166af726-83fd-4c7c-a62f-54444fbbefc3.jpg?v=1718281040'
              },
              {
                num: '07',
                tag: 'Ethnic',
                title: 'Silk Sarees',
                href: '/shop?category=sarees',
                buttonText: 'Shop Sarees →',
                img: 'https://pochampallysarees.com/cdn/shop/files/PureSoftSilkBlueYellowSari.jpg?v=1762248060'
              },
              {
                num: '08',
                tag: 'Daily Ethnic',
                title: 'Kurtis & Tunics',
                href: '/shop?category=kurtis',
                buttonText: 'Shop Kurtis →',
                img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop'
              }
            ].map((card) => (
              <div 
                key={card.num}
                className="bg-[#EFECE6] hover:bg-[#EAE5DD] h-44 rounded-[1.75rem] p-5 flex items-center justify-between overflow-hidden relative group shadow-sm hover:shadow-md transition-all border border-onyx/5"
              >
                <div className="flex flex-col justify-between h-full py-0.5 pr-2 z-10 flex-1 min-w-0">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-chrome block mb-1">
                      {card.num} / {card.tag}
                    </span>
                    <h4 className="text-xs font-black uppercase text-onyx tracking-wider leading-tight truncate">
                      {card.title}
                    </h4>
                  </div>
                  <Link href={card.href} className="inline-block mt-2">
                    <span className="inline-flex items-center text-[9px] bg-white text-onyx border border-onyx/10 font-black px-3.5 py-2 rounded-full uppercase tracking-wider hover:bg-onyx hover:text-bone transition-colors cursor-pointer whitespace-nowrap shadow-xs">
                      {card.buttonText}
                    </span>
                  </Link>
                </div>

                <div className="w-24 sm:w-28 xl:w-28 h-full flex-shrink-0 ml-2.5 rounded-2xl overflow-hidden border border-black/5 shadow-xs">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 03. CHUDIDAR & SALWAR SUITS SECTION */}
      {chudidarProducts.length > 0 && (
        <section className="py-20 border-t border-onyx/5 bg-neutral-soft">
          <Container>
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-chrome">Traditional Elegance</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Designer Chudidar Collection</h2>
                <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Ready-to-wear Salwar Kameez & dress materials for all occasions.</p>
              </div>
              <Link href="/shop?category=chudidar" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4 hidden md:block">
                View All Chudidar →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {chudidarProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 04. LEGGINGS COLLECTION */}
      <section className="py-20 border-t border-onyx/5">
        <Container>
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-chrome">Daily Comfort Essential</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Leggings & Churidar Bottoms</h2>
              <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Premium 4-way stretchable combed cotton for all-day freedom.</p>
            </div>
            <Link href="/shop?category=leggings" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4 hidden md:block">
              Shop Leggings →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {leggingsProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* 05. FESTIVE AD BANNER CAROUSEL SECTION */}
      {homePage?.promotionalBanner?.isActive !== false && (
        <section className="py-12 border-t border-onyx/5">
          <Container>
            <PromoBannerSlider
              banners={homePage?.promotionalBanners || []}
              fallbackBanner={homePage?.promotionalBanner}
            />
          </Container>
        </section>
      )}

      {/* 06. LEHENGA & KIDS SILK SKIRTS SECTION */}
      {(lehengaProducts.length > 0 || kidsSkirtProducts.length > 0) && (
        <section className="py-20 border-t border-onyx/5 bg-neutral-soft">
          <Container>
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-chrome">Festive & Traditional</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Lehengas & Kids Pattupavadai</h2>
                <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Grand celebration wear for mothers and little ones.</p>
              </div>
              <div className="flex gap-4 hidden md:flex">
                <Link href="/shop?category=lehenga" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4">
                  Shop Lehengas
                </Link>
                <Link href="/shop?category=children-silk-skirt" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4">
                  Shop Kids Silk Skirts
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[...lehengaProducts, ...kidsSkirtProducts].slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 07. SAREES COLLECTION */}
      <section className="py-20 border-t border-onyx/5">
        <Container>
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-chrome">Ethnic Grace</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Exclusive Silk & Cotton Sarees</h2>
              <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Timeless weaves, rich palettes and flawless drape.</p>
            </div>
            <Link href="/shop?category=sarees" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4 hidden md:block">
              Shop Sarees →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {sareesProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* 08. NIGHTWEAR COLLECTION */}
      <section className="py-20 border-t border-onyx/5 bg-neutral-soft">
        <Container>
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-chrome">Pure Cotton Comfort</span>
              <h2 className="text-3xl font-black uppercase tracking-tight text-onyx">Nighties & Loungewear</h2>
              <p className="text-xs uppercase tracking-widest text-onyx/50 font-medium">Soft, breathable cotton nightgowns and feeding nightwear.</p>
            </div>
            <Link href="/shop?category=nighty" className="text-[10px] font-black uppercase tracking-widest hover:text-onyx text-onyx/70 underline decoration-2 underline-offset-4 hidden md:block">
              Shop Nightwear →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {nightyProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </Container>
      </section>

      {/* 09. FINAL CTA */}
      <section className="py-16 md:py-20 text-center bg-bone border-t border-onyx/5">
        <Container>
          <div className="max-w-4xl 2xl:max-w-5xl mx-auto bg-white border border-onyx/10 rounded-[2.5rem] md:rounded-[4rem] py-14 md:py-16 px-6 md:px-10 shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-soft to-transparent pointer-events-none" />

            <div className="relative max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase text-onyx">
                EXPLORE POSH PIGEON <span className="text-chrome">COLLECTIONS</span>
              </h2>
              <p className="text-xs text-onyx/70 font-medium uppercase tracking-widest">
                From everyday leggings & inskirts to grand sarees, chudidars & lehengas.
              </p>
              <Link href="/shop" className="inline-block pt-4">
                <Button className="h-14 md:h-16 px-10 md:px-14 bg-onyx text-bone text-[9px] md:text-[11px] font-black tracking-[0.4em] shadow-kinetic hover:scale-105 transition-transform uppercase rounded-full">
                  EXPLORE FULL SHOP
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

    </main>
  );
}

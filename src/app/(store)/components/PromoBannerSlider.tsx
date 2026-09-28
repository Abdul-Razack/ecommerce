'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface PromoBannerItem {
  _key?: string;
  isActive?: boolean;
  tag?: string;
  heading?: string;
  subtext?: string;
  discount?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: string;
  customImageUrl?: string;
}

interface PromoBannerSliderProps {
  banners: PromoBannerItem[];
  fallbackBanner?: {
    isActive?: boolean;
    heading?: string;
    subtext?: string;
    discount?: string;
  };
}

export default function PromoBannerSlider({ banners, fallbackBanner }: PromoBannerSliderProps) {
  // Filter active banners
  const activeBanners = (banners || []).filter((b) => b.isActive !== false);

  // If no banners provided, build default list with both Spring Sale & Kids Silk Skirt
  const effectiveBanners: PromoBannerItem[] =
    activeBanners.length > 0
      ? activeBanners
      : [
          {
            _key: 'default-spring-sale',
            tag: "✦ Exclusive Women's Festives",
            heading: fallbackBanner?.heading || 'SPRING SALE IS LIVE!',
            subtext:
              fallbackBanner?.subtext ||
              'Enjoy up to 40% off on selected clothing collections.',
            discount: fallbackBanner?.discount || '40%',
            buttonText: 'Explore Deals →',
            buttonLink: '/shop',
            image: '/images/poster-image.png',
          },
          {
            _key: 'default-kids-silk-skirt',
            tag: "✦ Children's Special Collection",
            heading: "GIRLS SILK SKIRT (PATTUPAVADAI)",
            subtext:
              'Handcrafted traditional silk skirts for little girls with pure zari borders & festive grace.',
            discount: '30%',
            buttonText: 'Shop Kids Wear →',
            buttonLink: '/shop?category=children-silk-skirt',
            image: '/images/banner-child.png',
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Auto-slide every 5 seconds when not hovered
  useEffect(() => {
    if (effectiveBanners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % effectiveBanners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [effectiveBanners.length, isHovered]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + effectiveBanners.length) % effectiveBanners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % effectiveBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        // swipe left -> next
        setCurrentIndex((prev) => (prev + 1) % effectiveBanners.length);
      } else {
        // swipe right -> prev
        setCurrentIndex((prev) => (prev - 1 + effectiveBanners.length) % effectiveBanners.length);
      }
    }
    touchStartX.current = null;
  };

  const currentBanner = effectiveBanners[currentIndex] || effectiveBanners[0];
  const bannerImage = currentBanner.image || currentBanner.customImageUrl || '/images/poster-image.png';

  return (
    <div
      className="relative bg-onyx rounded-3xl overflow-hidden shadow-kinetic group min-h-[380px] lg:min-h-[420px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full min-h-[380px] lg:min-h-[420px]">
        {effectiveBanners.map((banner, idx) => {
          const isActive = idx === currentIndex;
          const bgImg = banner.image || banner.customImageUrl || '/images/poster-image.png';

          return (
            <div
              key={banner._key || idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out grid grid-cols-1 md:grid-cols-12 items-stretch ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Left Column: Text & CTA */}
              <div className="md:col-span-5 p-8 md:p-12 lg:p-14 flex flex-col justify-center space-y-4 text-bone z-10 bg-onyx/90 md:bg-onyx">
                <div className="flex items-center gap-2">
                  <span className="text-chrome font-black text-[9px] tracking-[0.2em] uppercase">
                    {banner.tag || "✦ Exclusive Women's Festives"}
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none text-white">
                  {banner.heading || 'Spring Sale is Live!'}
                </h3>

                <p className="text-xs md:text-sm text-white/70 font-medium tracking-wide leading-relaxed max-w-md">
                  {banner.subtext || 'Enjoy up to 40% off on selected clothing collections.'}
                </p>

                <div className="pt-2">
                  <Link href={banner.buttonLink || '/shop'}>
                    <span className="inline-block text-[9px] bg-[#DCA095] hover:bg-white text-zinc-950 font-black px-7 py-3.5 rounded-full uppercase tracking-widest transition-colors cursor-pointer shadow-md hover:scale-105 active:scale-95 duration-200">
                      {banner.buttonText || 'Explore Deals →'}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Center Floating Discount Badge (Desktop Only) */}
              {banner.discount && (
                <div className="hidden md:flex absolute left-[38%] top-1/2 -translate-y-1/2 z-20 w-28 h-28 bg-[#DCA095] text-white rounded-full border-[6px] border-[#18181B] flex flex-col items-center justify-center shadow-xl pointer-events-none transition-transform duration-500 group-hover:scale-105">
                  <span className="text-[9px] uppercase tracking-widest font-black opacity-80 leading-none">
                    Up To
                  </span>
                  <span className="text-2xl font-black leading-none my-1">
                    {banner.discount}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest font-black opacity-80 leading-none">
                    Off
                  </span>
                </div>
              )}

              {/* Right Column: Banner Image */}
              <div className="md:col-span-7 relative min-h-[240px] md:min-h-full overflow-hidden bg-black/40">
                <img
                  src={bgImg}
                  alt={banner.heading || 'Promotional Ad Banner'}
                  className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-700"
                />
                {/* Mobile overlay for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-transparent to-transparent md:hidden" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Slider Controls (Only shown if multiple banners) */}
      {effectiveBanners.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 z-30 flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Banner"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-sm font-bold transition-all hover:scale-110 active:scale-95 shadow-lg"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Banner"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center text-sm font-bold transition-all hover:scale-110 active:scale-95 shadow-lg"
            >
              ›
            </button>
          </div>

          {/* Dots Indicator & Counter */}
          <div className="absolute left-6 bottom-4 md:left-12 md:bottom-6 z-30 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {effectiveBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-8 bg-[#DCA095]'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] technical font-bold text-white/50 tracking-widest pl-1">
              {String(currentIndex + 1).padStart(2, '0')} / {String(effectiveBanners.length).padStart(2, '0')}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

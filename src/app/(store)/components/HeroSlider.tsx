'use client';

import { useState, useEffect } from 'react';

interface HeroSliderProps {
  images: string[];
}

export default function HeroSlider({ images }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no images are provided, use a default fallback
  const validImages = images && images.length > 0 ? images : ['/images/banner-1.png'];
  
  useEffect(() => {
    // If there's only 1 image or none, don't run the interval
    if (validImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % validImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [validImages.length]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-onyx">
      {validImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt={`Hero Banner ${index + 1}`}
            className="w-full h-full object-cover object-top"
          />
          {/* Mobile Background dimming overlay for text readability - applied to all images */}
          <div className="absolute inset-0 z-0 lg:hidden bg-white/50 backdrop-blur-[2px]"></div>
        </div>
      ))}

      {/* Navigation Dots (Only show if multiple images exist) */}
      {validImages.length > 1 && (
        <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center gap-3 lg:bottom-12">
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-onyx w-8' : 'bg-onyx/30 hover:bg-onyx/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowRight, Leaf, Shield, HeartHandshake, Award } from 'lucide-react';

export default function HeroSection({ heroConfig, navigateTo, sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_hero) === 0) return null;

  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      tagline: 'NATURAL • HEALTHY • SUSTAINABLE',
      titlePart1: 'Better Choices',
      titlePart2: 'Better Life.',
      description: 'Discover natural, healthy and premium products for a smarter, happier everyday life.',
      ctaText: 'Shop Now',
      ctaLink: '/products',
      packagingImg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      jarsImg: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
      scriptQuote: 'Good Products, Brighter Days.'
    },
    {
      tagline: '100% CERTIFIED ORGANIC ESSENTIALS',
      titlePart1: 'Pure Superfoods',
      titlePart2: 'Pure Vitality.',
      description: 'Farm-fresh chia seeds, pure herbal teas, cold-pressed oils & natural pantry staples.',
      ctaText: 'Explore Catalog',
      ctaLink: '/products',
      packagingImg: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
      jarsImg: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      scriptQuote: 'Nature Nurtures You.'
    }
  ];

  // Auto-slide effect every 4.5 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const currentSlide = slides[activeSlide] || slides[0];

  const handleCta = () => {
    if (navigateTo) navigateTo('/products', { view: 'all_products' });
  };

  return (
    <section 
      className="relative bg-[#fbf9f5] border-b border-gray-200/70 overflow-hidden" 
      data-reticle-target="hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Soft Natural Lighting Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Content Column (6 cols) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8 z-10 text-center lg:text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-[#164e3f] uppercase font-sans">
                {currentSlide.tagline}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] leading-[1.1] font-serif tracking-tight text-gray-950 font-bold">
              {currentSlide.titlePart1} <br />
              <span className="text-[#164e3f] italic font-serif font-normal">
                {currentSlide.titlePart2}
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              {currentSlide.description}
            </p>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                type="button"
                onClick={handleCta}
                className="bg-[#124734] hover:bg-[#0a2e22] text-white px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center gap-2.5 cursor-pointer"
                data-reticle-target="hero-shop-now-btn"
              >
                <span>{currentSlide.ctaText}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Trust Badges Bar (Mockup Section 2 Footer) */}
            <div className="pt-6 sm:pt-8 border-t border-gray-200/80">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                    <Leaf size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">100% Natural</h5>
                    <p className="text-[10px] text-gray-500">Pure origin</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                    <Shield size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Safe for Family</h5>
                    <p className="text-[10px] text-gray-500">Zero toxics</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                    <HeartHandshake size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Eco Friendly</h5>
                    <p className="text-[10px] text-gray-500">Sustainable</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                    <Award size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Trusted Quality</h5>
                    <p className="text-[10px] text-gray-500">Lab verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Composition (6 cols) */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            {/* Script Text Flourish matching Mockup */}
            <div className="absolute top-2 right-4 z-20 hidden sm:block text-right pointer-events-none">
              <span className="font-serif italic text-2xl text-emerald-900/70 block leading-tight font-medium drop-shadow-sm">
                {currentSlide.scriptQuote}
              </span>
              <span className="text-xs text-emerald-800 font-sans block mt-0.5">🌿 ValueLife Organics</span>
            </div>

            {/* Hero Visual Collage Container */}
            <div className="relative w-full max-w-lg aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center">
              {/* Natural Wood/Stone Circular Halo */}
              <div className="absolute inset-2 bg-gradient-to-tr from-amber-100/60 via-emerald-100/50 to-white/90 rounded-[40px] shadow-lg border border-white/60" />

              {/* Main Product Kraft Packaging Image */}
              <div className="relative z-10 w-4/5 h-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
                <img
                  src={currentSlide.packagingImg}
                  alt="ValueLife Natural Products"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Organic Harvest</span>
                    <h4 className="text-xs font-extrabold text-gray-900">ValueLife Signature Packaging</h4>
                  </div>
                  <span className="bg-[#124734] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                    Certified
                  </span>
                </div>
              </div>

              {/* Secondary Floating Accent Visual */}
              <div className="absolute -bottom-4 -left-4 z-20 w-36 sm:w-44 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden xs:block">
                <img
                  src={currentSlide.jarsImg}
                  alt="Organic Seeds & Honey Jars"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Carousel Dots */}
        <div className="mt-8 flex justify-center items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? 'w-6 bg-[#164e3f]' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

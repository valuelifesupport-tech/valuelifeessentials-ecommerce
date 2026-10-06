import React, { useState, useEffect } from 'react';
import { ArrowRight, Leaf, Shield, HeartHandshake, Award } from 'lucide-react';
import { getApiUrl, resolveImgUrl } from '../../api/config';

export default function HeroSection({
  heroConfig,
  navigateTo,
  sectionsConfig,
  heroSlides: propHeroSlides,
  activeSlideIndex: propActiveIndex,
  onSlideChange
}) {
  const [internalActiveSlide, setInternalActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slides, setSlides] = useState([
    {
      id: 1,
      slide_type: 'SPLIT',
      tagline: 'NATURAL • HEALTHY • SUSTAINABLE',
      title_part1: 'Better Choices',
      title_part2: 'Better Life.',
      description: 'Discover natural, healthy and premium products for a smarter, happier everyday life.',
      cta_text: 'Shop Now',
      cta_link: '/products',
      packaging_img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      jars_img: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=600&q=80',
      script_quote: 'Good Products, Brighter Days.'
    },
    {
      id: 2,
      slide_type: 'SPLIT',
      tagline: '100% Nature pure Essentials',
      title_part1: 'Pure Superfoods',
      title_part2: 'Pure Vitality.',
      description: 'Farm-fresh chia seeds, pure herbal teas, cold-pressed oils & natural pantry staples.',
      cta_text: 'Explore Catalog',
      cta_link: '/products',
      packaging_img: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
      jars_img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      script_quote: 'Nature Nurtures You.'
    }
  ]);

  // Sync prop heroSlides if provided
  useEffect(() => {
    if (propHeroSlides && Array.isArray(propHeroSlides) && propHeroSlides.length > 0) {
      setSlides(propHeroSlides);
    }
  }, [propHeroSlides]);

  // Fetch dynamic hero slides from API if propHeroSlides not provided
  useEffect(() => {
    if (propHeroSlides && Array.isArray(propHeroSlides) && propHeroSlides.length > 0) return;

    let isMounted = true;
    fetch(getApiUrl('/api/hero-slides'))
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter(s => s.is_active === undefined || Number(s.is_active) === 1);
          if (activeOnly.length > 0) {
            setSlides(activeOnly);
          }
        }
      })
      .catch(err => {
        console.warn('Could not fetch hero slides, using fallback:', err.message);
      });
    return () => { isMounted = false; };
  }, [propHeroSlides]);

  const activeSlide = propActiveIndex !== undefined ? propActiveIndex : internalActiveSlide;

  // Auto-slide effect every 4.5 seconds if propActiveIndex is not controlled
  useEffect(() => {
    if (propActiveIndex !== undefined) return;
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setInternalActiveSlide(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length, propActiveIndex]);

  const isHeroDisabled = (sectionsConfig && (Number(sectionsConfig.show_hero) === 0 || sectionsConfig.show_hero === false)) || (heroConfig && (Number(heroConfig.hero_enabled) === 0 || heroConfig.hero_enabled === false || heroConfig.hero_enabled === '0'));
  if (isHeroDisabled) return null;

  const currentSlide = slides[activeSlide] || slides[0] || {};
  const isFullBanner = currentSlide.slide_type === 'FULL_BANNER';

  const handleCta = (link) => {
    const targetLink = link || currentSlide.cta_link || currentSlide.ctaLink || '/products';
    if (navigateTo) {
      if (targetLink.startsWith('/pages/')) {
        const slug = targetLink.replace('/pages/', '');
        navigateTo(targetLink, { view: 'page', slug });
      } else if (targetLink === '/offers') {
        navigateTo('/offers', { view: 'offers' });
      } else {
        navigateTo(targetLink, { view: 'all_products' });
      }
    }
  };

  const handleDotClick = (idx) => {
    setInternalActiveSlide(idx);
    if (typeof onSlideChange === 'function') {
      onSlideChange(idx);
    }
  };

  // Dynamic trust badges from sectionsConfig
  const showTrustBadges = sectionsConfig?.show_trust_badges !== undefined ? Number(sectionsConfig.show_trust_badges) !== 0 : true;
  const trustBadge1Title = sectionsConfig?.trust_badge_1_title || '100% Natural';
  const trustBadge1Sub = sectionsConfig?.trust_badge_1_sub || 'Pure origin';
  const trustBadge2Title = sectionsConfig?.trust_badge_2_title || 'Safe for Family';
  const trustBadge2Sub = sectionsConfig?.trust_badge_2_sub || 'Zero toxics';
  const trustBadge3Title = sectionsConfig?.trust_badge_3_title || 'Eco Friendly';
  const trustBadge3Sub = sectionsConfig?.trust_badge_3_sub || 'Sustainable';
  const trustBadge4Title = sectionsConfig?.trust_badge_4_title || 'Trusted Quality';
  const trustBadge4Sub = sectionsConfig?.trust_badge_4_sub || 'Lab verified';

  return (
    <section 
      className="relative bg-[#fbf9f5] border-b border-gray-200/70 overflow-hidden text-slate-900" 
      data-reticle-target="hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Soft Natural Lighting Accents for Split mode */}
      {!isFullBanner && (
        <>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* OPTION 1: FULL SCREEN GRAPHIC BANNER SLIDE */}
      {isFullBanner ? (
        <div 
          onClick={() => currentSlide.cta_link && handleCta(currentSlide.cta_link)}
          className={`relative w-full overflow-hidden group ${currentSlide.cta_link ? 'cursor-pointer' : ''}`}
        >
          <div className="relative w-full min-h-[300px] sm:min-h-[400px] lg:min-h-[480px] bg-slate-950 flex items-center justify-center overflow-hidden">
            <picture className="w-full h-full block">
              {currentSlide.mobile_banner_img && (
                <source 
                  media="(max-width: 640px)" 
                  srcSet={resolveImgUrl(currentSlide.mobile_banner_img)} 
                />
              )}
              <img
                src={resolveImgUrl(currentSlide.banner_img || currentSlide.packaging_img)}
                alt={currentSlide.title_part1 || 'ValueLife Full Screen Promotional Banner'}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
              />
            </picture>

            {/* Optional Overlay Text (If enabled in admin) */}
            {Number(currentSlide.show_overlay_text) === 1 && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                  <div className="max-w-xl space-y-4 text-white">
                    {currentSlide.tagline && (
                      <span className="inline-block bg-emerald-600/90 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full shadow">
                        {currentSlide.tagline}
                      </span>
                    )}
                    {currentSlide.title_part1 && (
                      <h2 className="text-3xl sm:text-5xl font-black font-serif tracking-tight leading-tight">
                        {currentSlide.title_part1}{' '}
                        {currentSlide.title_part2 && (
                          <span className="text-emerald-300 italic font-serif font-normal">
                            {currentSlide.title_part2}
                          </span>
                        )}
                      </h2>
                    )}
                    {currentSlide.description && (
                      <p className="text-xs sm:text-base text-gray-200 line-clamp-2 leading-relaxed">
                        {currentSlide.description}
                      </p>
                    )}
                    {currentSlide.cta_text && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCta(currentSlide.cta_link);
                          }}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3 rounded-full text-xs sm:text-sm uppercase tracking-wider inline-flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                        >
                          <span>{currentSlide.cta_text}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* OPTION 2: STANDARD SPLIT CONTENT SLIDE */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column (6 cols) */}
            <div className="lg:col-span-6 space-y-5 z-10 text-center lg:text-left">
              {/* Tagline Pill */}
              <div className="inline-flex items-center gap-2">
                <span className="text-[11px] sm:text-xs font-black tracking-[0.2em] text-[#164e3f] uppercase font-sans">
                  {currentSlide.tagline || currentSlide.badge_text || 'NATURAL • HEALTHY • SUSTAINABLE'}
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl leading-[1.15] font-serif tracking-tight text-gray-950 font-bold">
                {currentSlide.title_part1 || currentSlide.titlePart1 || 'Better Choices'} <br />
                <span className="text-[#164e3f] italic font-serif font-normal">
                  {currentSlide.title_part2 || currentSlide.titlePart2 || 'Better Life.'}
                </span>
              </h1>

              {/* Subtitle Description */}
              <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {currentSlide.description}
              </p>

              {/* CTA Button */}
              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={() => handleCta(currentSlide.cta_link || currentSlide.ctaLink)}
                  className="bg-[#124734] hover:bg-[#0a2e22] text-white px-7 py-3 rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 inline-flex items-center gap-2 cursor-pointer"
                  data-reticle-target="hero-shop-now-btn"
                >
                  <span>{currentSlide.cta_text || currentSlide.ctaText || 'Shop Now'}</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Trust Badges Bar */}
              {showTrustBadges && (
                <div className="pt-5 border-t border-gray-200/80">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                        <Leaf size={13} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-900">{trustBadge1Title}</h5>
                        <p className="text-[9px] text-gray-500">{trustBadge1Sub}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                        <Shield size={13} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-900">{trustBadge2Title}</h5>
                        <p className="text-[9px] text-gray-500">{trustBadge2Sub}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                        <HeartHandshake size={13} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-900">{trustBadge3Title}</h5>
                        <p className="text-[9px] text-gray-500">{trustBadge3Sub}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100/80 text-[#164e3f] flex items-center justify-center shrink-0">
                        <Award size={13} />
                      </div>
                      <div>
                        <h5 className="text-[11px] font-bold text-gray-900">{trustBadge4Title}</h5>
                        <p className="text-[9px] text-gray-500">{trustBadge4Sub}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Visual Composition (6 cols) */}
            <div className="lg:col-span-6 relative flex justify-center items-center">
              {/* Script Text Flourish matching Mockup */}
              {(currentSlide.script_quote || currentSlide.scriptQuote) && (
                <div className="absolute top-1 right-2 z-20 hidden sm:block text-right pointer-events-none">
                  <span className="font-serif italic text-xl text-emerald-900/70 block leading-tight font-medium drop-shadow-sm">
                    {currentSlide.script_quote || currentSlide.scriptQuote}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-sans block mt-0.5">🌿 ValueLife Organics</span>
                </div>
              )}

              {/* Hero Visual Collage Container */}
              <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center">
                {/* Natural Halo */}
                <div className="absolute inset-2 bg-gradient-to-tr from-amber-100/60 via-emerald-100/50 to-white/90 rounded-[32px] shadow-lg border border-white/60" />

                {/* Main Product Kraft Packaging Image */}
                <div className="relative z-10 w-4/5 h-4/5 rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
                  <img
                    src={resolveImgUrl(currentSlide.packaging_img || currentSlide.packagingImg)}
                    alt="ValueLife Natural Products"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-white/40 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 block">Organic Harvest</span>
                      <h4 className="text-[11px] font-extrabold text-gray-900">ValueLife Signature Packaging</h4>
                    </div>
                    <span className="bg-[#124734] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                      Certified
                    </span>
                  </div>
                </div>

                {/* Secondary Floating Accent Visual */}
                {(currentSlide.jars_img || currentSlide.jarsImg) && (
                  <div className="absolute -bottom-3 -left-3 z-20 w-32 h-32 rounded-xl overflow-hidden shadow-xl border-4 border-white hidden xs:block">
                    <img
                      src={resolveImgUrl(currentSlide.jars_img || currentSlide.jarsImg)}
                      alt="Organic Seeds & Honey Jars"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Carousel Dots (Works across both Split & Full Banner modes) */}
      {slides.length > 1 && (
        <div className="py-4 flex justify-center items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleDotClick(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? 'w-6 bg-[#164e3f]' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

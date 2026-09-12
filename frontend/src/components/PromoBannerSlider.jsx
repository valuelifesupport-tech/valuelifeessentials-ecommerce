import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShoppingBag, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PromoBannerSlider({ navigateTo, sectionsConfig, banners }) {
  if (sectionsConfig && Number(sectionsConfig.show_promo_banners) === 0) return null;

  const defaultSlides = [
    {
      id: 1,
      image: '/images/organic_garden_banner.jpg',
      badge: '🔥 100% Certified Bio-Fertilizers & Soil Boosters',
      title: 'Boost Plant Growth & Soil Fertility Naturally',
      subtitle: 'Premium vermicompost, mustard cake powder, and seaweed bio-extracts sourced directly from certified organic farms.',
      ctaText: 'Shop Bio Fertilizers',
      ctaLink: '/products',
      tag: 'BESTSELLER'
    },
    {
      id: 2,
      image: '/images/plant_booster_banner.jpg',
      badge: '🪴 Hydroponics & Terrace Gardening Essentials',
      title: 'Revitalize Indoor Plants & Home Vegetable Gardens',
      subtitle: 'Nutrient-rich liquid plant elixirs and organic neem oil pest protection for flourishing green leaves.',
      ctaText: 'Explore Growth Elixirs',
      ctaLink: '/offers',
      tag: 'LIMITED DEAL'
    }
  ];

  const slides = (banners && banners.length > 0) ? banners.map(b => ({
    id: b.id,
    image: b.image_url || '/images/organic_garden_banner.jpg',
    badge: b.subtitle || '🔥 100% Certified Bio-Fertilizers & Soil Boosters',
    title: b.title || 'Boost Plant Growth & Soil Fertility Naturally',
    subtitle: b.subtitle || 'Premium vermicompost, mustard cake powder, and seaweed bio-extracts sourced directly from certified organic farms.',
    ctaText: 'Shop Bio Fertilizers',
    ctaLink: b.link_url || '/products'
  })) : defaultSlides;

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleCta = () => {
    const activeSlide = slides[currentSlide];
    if (typeof navigateTo === 'function' && activeSlide?.ctaLink) {
      navigateTo(activeSlide.ctaLink, { view: 'all_products', category: null, collection: null });
    } else {
      const catalogEl = document.getElementById('products-grid');
      if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slide = slides[currentSlide] || slides[0];

  return (
    <div className="relative max-w-7xl mx-auto px-4 my-6">
      {/* ANIMATED PROMO BANNER CAROUSEL CARD (PART 1 - PROMO BANNER SLIDER) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-950 group min-h-[320px] sm:min-h-[400px] flex items-center">
        {/* BACKGROUND IMAGE WITH SMOOTH TRANSITION */}
        <div className="absolute inset-0 z-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
        </div>

        {/* BANNER CONTENT OVERLAY */}
        <div className="relative z-20 p-6 sm:p-12 max-w-2xl space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full shadow-lg">
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>{slide.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-['Outfit'] leading-tight tracking-tight">
            {slide.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            {slide.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={handleCta}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-950/80 transition-all hover:scale-105 cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span>{slide.ctaText}</span>
              <ArrowRight size={16} />
            </button>

            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/30">
              <ShieldCheck size={16} /> 100% Organic Certified
            </span>
          </div>
        </div>

        {/* CAROUSEL CONTROLS */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          className="absolute left-4 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all opacity-80 hover:opacity-100 cursor-pointer hidden sm:flex"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          className="absolute right-4 z-30 p-2.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white border border-white/20 backdrop-blur-md transition-all opacity-80 hover:opacity-100 cursor-pointer hidden sm:flex"
        >
          <ChevronRight size={20} />
        </button>

        {/* DOT INDICATORS */}
        <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-emerald-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// INDIVIDUAL COMPONENT PART 2 - LIVE SOCIAL PROOF SALES TICKER
export function SalesTickerNotification({ sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_sales_ticker) === 0) return null;

  const defaultTickers = [
    { name: 'Rohan Sharma', city: 'New Delhi', item: '5kg Organic Vermicompost', time: '2m ago' },
    { name: 'Priya Patel', city: 'Bengaluru', item: '1L Liquid Seaweed Extract', time: '4m ago' },
    { name: 'Amit Verma', city: 'Mumbai', item: '2kg Neem Cake Powder', time: '6m ago' },
    { name: 'Neha Gupta', city: 'Pune', item: 'Organic Epsom Salt Booster', time: '8m ago' }
  ];

  let liveTickers = defaultTickers;
  if (sectionsConfig && sectionsConfig.sales_ticker_json) {
    try {
      const parsed = typeof sectionsConfig.sales_ticker_json === 'string' 
        ? JSON.parse(sectionsConfig.sales_ticker_json) 
        : sectionsConfig.sales_ticker_json;
      if (Array.isArray(parsed) && parsed.length > 0) {
        liveTickers = parsed;
      }
    } catch(e) {}
  }

  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveTickers.length);
    }, 4500);
    return () => clearInterval(tickerTimer);
  }, [liveTickers.length]);

  const ticker = liveTickers[tickerIndex] || defaultTickers[0];

  return (
    <div className="max-w-7xl mx-auto px-4 my-3">
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-3 shadow-xl backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-3 font-medium text-slate-300 min-w-0">
          <span className="flex h-3 w-3 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div className="truncate">
            <strong className="text-white font-bold">{ticker.name}</strong> from <span className="text-emerald-400 font-bold">{ticker.city}</span> just purchased <strong className="text-amber-300 font-bold">{ticker.item}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-[11px]">
          <span className="bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">{ticker.time}</span>
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">✓ Verified Buyer</span>
        </div>
      </div>
    </div>
  );
}

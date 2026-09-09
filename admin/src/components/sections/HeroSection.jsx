import { getApiUrl, resolveImgUrl } from '../../api/config';
import React from 'react';
import { ShoppingBag, Sparkles, ArrowRight, ShieldCheck, Truck, Award, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ heroConfig, navigateTo, sectionsConfig }) {
  if (sectionsConfig && Number(sectionsConfig.show_hero) === 0) return null;

  const config = heroConfig || {
    hero_enabled: 1,
    active_style: 'SPLIT',
    badge_text: '100% Certified Organic Superfoods',
    title: 'Pure Farm-Fresh Organic Groceries & Wellness Supplies',
    subtitle: 'Delivering chemical-free superfoods, edible seeds, virgin oils & herbal supplements straight from certified organic farms.',
    primary_btn_text: 'Shop Catalog Now',
    primary_btn_link: '/products',
    secondary_btn_text: 'Explore Organic Offers',
    secondary_btn_link: '/offers',
    image_url: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1000&q=80',
    bg_image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    card_1_title: 'Edible Chia & Flax Seeds',
    card_1_sub: 'Rich in Omega-3 & Fiber',
    card_1_img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    card_2_title: 'Pure Ashwagandha Powder',
    card_2_sub: '100% Natural Immunity Booster',
    card_2_img: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=600&q=80'
  };

  if (config.hero_enabled === 0 || config.hero_enabled === '0') return null;

  const {
    active_style = 'SPLIT',
    badge_text = '100% Certified Organic Superfoods',
    title = 'Pure Farm-Fresh Organic Groceries & Wellness Supplies',
    subtitle = 'Delivering chemical-free superfoods, edible seeds, virgin oils & herbal supplements straight from certified organic farms.',
    primary_btn_text = 'Shop Catalog Now',
    primary_btn_link = '/products',
    secondary_btn_text = 'Explore Organic Offers',
    secondary_btn_link = '/offers',
    image_url = 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1000&q=80',
    bg_image_url = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
    card_1_title = 'Edible Chia & Flax Seeds',
    card_1_sub = 'Rich in Omega-3 & Fiber',
    card_1_img = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
    card_2_title = 'Pure Ashwagandha Powder',
    card_2_sub = '100% Natural Immunity Booster',
    card_2_img = 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=600&q=80'
  } = config;

  const resolveImageUrl = (url) => {
    return resolveImgUrl(url);
  };

  const formattedImageUrl = resolveImageUrl(image_url);
  const formattedBgImageUrl = resolveImageUrl(bg_image_url);
  const formattedCard1Img = resolveImageUrl(card_1_img);
  const formattedCard2Img = resolveImageUrl(card_2_img);

  const handleCtaClick = (link) => {
    if (typeof navigateTo === 'function') {
      navigateTo('/products', { view: 'all_products', category: null, collection: null });
    } else {
      const catalogEl = document.getElementById('products-grid') || document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '/#catalog';
      }
    }
  };

  // STYLE 1: SHOPIFY-GRADE SPLIT HERO
  if (active_style === 'SPLIT') {
    return (
      <div className="relative bg-gradient-to-br from-[#0f281e] via-[#143d2b] to-[#1b4332] text-white overflow-hidden py-12 md:py-16">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-7 space-y-6">
            {badge_text && (
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-inner">
                <Sparkles size={14} className="text-emerald-400" />
                <span>{badge_text}</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-['Outfit'] leading-[1.15] text-white">
              {title}
            </h1>

            <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
              {subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {primary_btn_text && (
                <button
                  onClick={() => handleCtaClick(primary_btn_link)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <ShoppingBag size={18} /> {primary_btn_text}
                </button>
              )}

              {secondary_btn_text && (
                <button
                  onClick={() => handleCtaClick(secondary_btn_link)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>{secondary_btn_text}</span> <ArrowRight size={16} />
                </button>
              )}
            </div>

            {/* TRUST BADGES BAR */}
            <div className="pt-6 border-t border-emerald-800/60 grid grid-cols-3 gap-3 text-emerald-200 text-xs font-bold">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
                <span>100% Certified Organic</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-emerald-400 shrink-0" />
                <span>Fast Home Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={18} className="text-emerald-400 shrink-0" />
                <span>Direct Farmer Sourced</span>
              </div>
            </div>
          </div>

          {/* RIGHT FLOATING HERO CARD */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 group">
              <img
                src={formattedImageUrl || 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1000&q=80'}
                alt="Organic Hero"
                className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/15 text-white space-y-1 shadow-2xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 size={16} /> Verified Lab Tested Pure Batch
                </div>
                <span className="font-extrabold text-sm block">100% Chemical & Pesticide Free Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STYLE 2: CINEMATIC FULLSCREEN HERO
  if (active_style === 'CINEMATIC') {
    return (
      <div className="relative w-full min-h-[500px] sm:min-h-[560px] flex items-center justify-center text-center text-white overflow-hidden bg-slate-950">
        <img
          src={formattedBgImageUrl || formattedImageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80'}
          alt="Cinematic Organic Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/40" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 space-y-6 py-16">
          {badge_text && (
            <span className="inline-block bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
              {badge_text}
            </span>
          )}

          <h1 className="text-4xl sm:text-6xl font-black font-['Outfit'] tracking-tight text-white leading-tight drop-shadow-md">
            {title}
          </h1>

          <p className="text-slate-200 text-sm sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {primary_btn_text && (
              <button
                onClick={() => handleCtaClick(primary_btn_link)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-8 py-4 rounded-2xl text-sm uppercase tracking-wider shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105 cursor-pointer"
              >
                {primary_btn_text}
              </button>
            )}

            {secondary_btn_text && (
              <button
                onClick={() => handleCtaClick(secondary_btn_link)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold px-7 py-4 rounded-2xl text-sm transition-all cursor-pointer"
              >
                {secondary_btn_text}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // STYLE 3: BENTO GRID HERO
  if (active_style === 'BENTO') {
    return (
      <div className="bg-slate-950 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* MAIN GIANT BENTO CARD */}
          <div className="lg:col-span-2 relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/40 p-8 flex flex-col justify-between min-h-[380px] shadow-2xl">
            <div className="space-y-4 relative z-10 max-w-xl">
              {badge_text && (
                <span className="text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-900/60 border border-emerald-700 px-3 py-1 rounded-md inline-block">
                  {badge_text}
                </span>
              )}
              <h2 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] leading-tight">
                {title}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm">{subtitle}</p>
            </div>

            <div className="pt-6 relative z-10">
              <button
                onClick={() => handleCtaClick(primary_btn_link)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag size={16} /> {primary_btn_text}
              </button>
            </div>

            <img
              src={formattedImageUrl || 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=1000&q=80'}
              alt="Bento Hero Main"
              className="absolute right-0 bottom-0 w-80 h-80 object-cover opacity-35 rounded-tl-full pointer-events-none"
            />
          </div>

          {/* SECONDARY 2 BENTO CARDS */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 flex items-center gap-4 shadow-xl group hover:border-emerald-700 transition-colors">
              <img src={formattedCard1Img || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80'} alt={card_1_title} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase">OFFER FEATURE</span>
                <h4 className="font-extrabold text-white text-base">{card_1_title}</h4>
                <p className="text-xs text-slate-400 font-medium">{card_1_sub}</p>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 flex items-center gap-4 shadow-xl group hover:border-emerald-700 transition-colors">
              <img src={formattedCard2Img || 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23a2a?auto=format&fit=crop&w=600&q=80'} alt={card_2_title} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-400 uppercase">HEALTH & WELLNESS</span>
                <h4 className="font-extrabold text-white text-base">{card_2_title}</h4>
                <p className="text-xs text-slate-400 font-medium">{card_2_sub}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STYLE 4: MINIMALIST EDITORIAL HERO
  return (
    <div className="bg-emerald-50/60 border-b border-emerald-100 py-12 px-4 text-slate-900">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {badge_text && (
          <span className="text-xs font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 border border-emerald-200 px-4 py-1.5 rounded-full inline-block">
            🌱 {badge_text}
          </span>
        )}

        <h1 className="text-3xl sm:text-5xl font-black font-['Outfit'] tracking-tight text-emerald-950 leading-tight">
          {title}
        </h1>

        <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* UPLOADER HERO IMAGE IN MINIMALIST STYLE */}
        {formattedImageUrl && (
          <div className="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white my-4">
            <img 
              src={formattedImageUrl} 
              alt={title} 
              className="w-full h-72 sm:h-96 object-cover" 
            />
          </div>
        )}

        <div className="pt-2 flex justify-center gap-4">
          {primary_btn_text && (
            <button
              onClick={() => handleCtaClick(primary_btn_link)}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              {primary_btn_text}
            </button>
          )}

          {secondary_btn_text && (
            <button
              onClick={() => handleCtaClick(secondary_btn_link)}
              className="bg-white hover:bg-gray-100 text-emerald-950 border border-emerald-200 font-extrabold px-7 py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
            >
              {secondary_btn_text}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import HeroSection from '../../../sections/HeroSection';
import PromoBannerSlider from '../../../sections/PromoBannerSlider';
import { DEFAULT_FALLBACK_SVG, resolveImgUrl } from '../../../../utils/resolveImgUrl';

export default function StorefrontPreview({ sectionsConfig, heroConfig, banners, categories, products, settingsForm }) {
  return (
    <div className="w-full sticky top-6 space-y-3" data-reticle-target="admin-sections-preview-canvas">
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
              LIVE REAL-TIME STOREFRONT PREVIEW
            </span>
          </div>
          <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-800">
            100% Live Sync
          </span>
        </div>

        {/* BROWSER FRAME MOCKUP */}
        <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
          <div className="bg-slate-900 px-3 py-2 border-b border-slate-800 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="bg-slate-950 px-4 py-0.5 rounded-md text-[10px] text-slate-400 font-mono border border-slate-800 truncate max-w-xs">
              http://localhost:5173 (Live Sections Preview)
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Realtime Canvas</span>
          </div>

          <div className="p-2 space-y-3 max-h-[720px] overflow-y-auto bg-slate-950/80 custom-scrollbar">
            {/* SECTION 1: HEADER ANNOUNCEMENT BAR */}
            {sectionsConfig.show_announcement === 1 ? (
              <div className="bg-[#1b4332] text-white text-[10px] py-1 px-3 rounded-lg border border-emerald-900 flex justify-between items-center shadow">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="bg-[#52b788] text-[#1b4332] font-black text-[8px] px-1.5 py-0.2 rounded-full uppercase">SALE</span>
                  <span className="truncate">{settingsForm.announcement_text || 'Get 15% OFF! Use Code: ORGANIC15'}</span>
                </div>
                <span className="text-[9px] text-emerald-300 font-bold">🇮🇳 (₹)</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                📢 1. Top Announcement Bar (DISABLED)
              </div>
            )}

            {/* SECTION 2: HERO SECTION */}
            {sectionsConfig.show_hero === 1 ? (
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60 p-1">
                <HeroSection heroConfig={heroConfig} navigateTo={() => {}} sectionsConfig={sectionsConfig} />
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🦸 2. Hero Banner Showcase (DISABLED)
              </div>
            )}

            {/* SECTION 3: TRUST BADGES */}
            {sectionsConfig.show_trust_badges === 1 ? (
              <div className="bg-white p-2.5 rounded-xl text-slate-900 grid grid-cols-2 gap-2 text-[10px] shadow">
                <div className="flex items-center gap-1.5"><span>🌱</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_1_title || '100% Organic'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_1_sub || 'Chemical-free'}</span></div></div>
                <div className="flex items-center gap-1.5"><span>🚚</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_2_title || 'Fast Delivery'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_2_sub || 'Across India'}</span></div></div>
                <div className="flex items-center gap-1.5"><span>💳</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_3_title || 'Partial COD'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_3_sub || '20% deposit'}</span></div></div>
                <div className="flex items-center gap-1.5"><span>⭐</span> <div><strong className="block leading-tight">{sectionsConfig.trust_badge_4_title || 'Top Rating'}</strong><span className="text-[9px] text-gray-500">{sectionsConfig.trust_badge_4_sub || '4.9 ★ Reviews'}</span></div></div>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🌱 3. Trust & Service Badges (DISABLED)
              </div>
            )}

            {/* SECTION 4: PROMO BANNERS SLIDER */}
            {sectionsConfig.show_promo_banners === 1 ? (
              <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60 p-1">
                <PromoBannerSlider navigateTo={() => {}} sectionsConfig={sectionsConfig} banners={banners} />
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🖼️ 4. Animated Promo Banner Slider (DISABLED)
              </div>
            )}

            {/* SECTION 5: CATEGORIES CIRCULAR SLIDER */}
            {sectionsConfig.show_categories_slider === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-black text-white font-['Outfit'] block">{sectionsConfig.category_slider_title || 'Shop By Categories'}</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.slice(0, 6).map(c => (
                    <div key={c.id} className="p-2 bg-slate-850 rounded-xl text-center shrink-0 w-20 border border-slate-800">
                      <div className="text-base mb-0.5">🌿</div>
                      <span className="text-[9px] font-bold text-slate-300 block truncate">{c.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                ⭕ 5. Circular Category Slider (DISABLED)
              </div>
            )}

            {/* SECTION 6: BEST SELLERS SHOWCASE */}
            {sectionsConfig.show_bestsellers === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-amber-400 font-['Outfit']">{sectionsConfig.bestsellers_title || '🔥 Best Seller Products'}</span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-800">{sectionsConfig.bestsellers_badge || 'HIGH DEMAND'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {products.slice(0, 2).map(p => (
                    <div key={p.id} className="p-2 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1">
                      <img src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} alt={p.title} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_SVG; }} className="w-full h-16 object-contain rounded bg-white" />
                      <span className="font-bold text-white block text-[10px] truncate">{p.title}</span>
                      <span className="text-emerald-400 font-black text-[10px]">₹{p.price_inr}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🔥 6. Best Seller Showcase Grid (DISABLED)
              </div>
            )}

            {/* SECTION 7: MAIN CATALOG GRID */}
            {sectionsConfig.show_catalog_grid === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-black text-white font-['Outfit'] block">🛍️ Main Catalog & Pill Filters</span>
                <div className="grid grid-cols-2 gap-2">
                  {products.slice(2, 4).map(p => (
                    <div key={p.id} className="p-2 bg-slate-850 rounded-xl border border-slate-800 text-xs space-y-1">
                      <img src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} alt={p.title} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_SVG; }} className="w-full h-16 object-contain rounded bg-white" />
                      <span className="font-bold text-white block text-[10px] truncate">{p.title}</span>
                      <span className="text-emerald-400 font-black text-[10px]">₹{p.price_inr}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🛍️ 7. Main Product Catalog & Filters (DISABLED)
              </div>
            )}

            {/* SECTION 8: FOOTER */}
            {sectionsConfig.show_footer === 1 ? (
              <div className="bg-[#1b4332] text-white p-3 rounded-xl text-[10px] space-y-1 border border-emerald-900 shadow">
                <span className="font-extrabold text-xs block">🌱 VALUELIFE ESSENTIALS Footer</span>
                <p className="opacity-80 text-[9px]">Your 100% trusted online organic store.</p>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🦶 8. Storefront Footer & Links (DISABLED)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

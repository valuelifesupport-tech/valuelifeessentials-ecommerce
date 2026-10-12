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
              {import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173'} (Live Sections Preview)
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
            {(Number(sectionsConfig.show_hero) === 1 || sectionsConfig.show_hero === true) ? (
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

            {/* SECTION 6: FEATURED PRODUCTS */}
            {sectionsConfig.show_featured_products === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-black text-emerald-400 font-['Outfit'] block">✨ Featured Products Showcase</span>
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
                ✨ 6. Featured Products Grid (DISABLED)
              </div>
            )}

            {/* SECTION 7: EDITORIAL PROMO BANNER */}
            {sectionsConfig.show_editorial_promo === 1 ? (
              <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 p-3 rounded-xl border border-emerald-800/50 flex justify-between items-center text-xs">
                <div>
                  <span className="bg-amber-400/20 text-amber-300 font-black text-[8px] px-2 py-0.5 rounded-full uppercase">SPECIAL EDITORIAL</span>
                  <p className="text-white font-extrabold text-xs mt-1">Pure Products, Happier Lives</p>
                  <p className="text-slate-400 text-[9px]">Flat 20% Off Natural Essentials</p>
                </div>
                <span className="text-xl">🌿</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                📰 7. Editorial Promo Banner (DISABLED)
              </div>
            )}

            {/* SECTION 8: WHY CHOOSE VALUELIFE */}
            {sectionsConfig.show_why_choose_us === 1 ? (
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[10px] grid grid-cols-3 gap-1.5 text-center text-slate-300">
                <div className="p-1.5 bg-slate-850 rounded-lg"><span>🌱</span><p className="font-bold text-[9px] mt-0.5">100% Organic</p></div>
                <div className="p-1.5 bg-slate-850 rounded-lg"><span>⚡</span><p className="font-bold text-[9px] mt-0.5">Eco Packing</p></div>
                <div className="p-1.5 bg-slate-850 rounded-lg"><span>🛡️</span><p className="font-bold text-[9px] mt-0.5">Lab Certified</p></div>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🛡️ 8. Why Choose ValueLife (DISABLED)
              </div>
            )}

            {/* SECTION 9: BEST SELLERS SHOWCASE */}
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
                🔥 9. Best Seller Showcase Grid (DISABLED)
              </div>
            )}

            {/* SECTION 10: BRAND STORY */}
            {sectionsConfig.show_brand_story === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1 text-[10px]">
                <span className="text-[8px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded uppercase">OUR STORY</span>
                <p className="text-xs font-extrabold text-white">A Healthier Tomorrow Together</p>
                <p className="text-slate-400 line-clamp-2">At ValueLife, we bring you high-quality natural essentials for everyday vitality.</p>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                📖 10. Our Brand Story (DISABLED)
              </div>
            )}

            {/* SECTION 11: TESTIMONIALS */}
            {sectionsConfig.show_testimonials === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[10px]">
                <span className="text-xs font-black text-yellow-400 font-['Outfit'] block">⭐ Customer Reviews (4.9 / 5.0)</span>
                <div className="p-2 bg-slate-850 rounded-lg text-slate-300 italic">
                  "Truly remarkable pure quality. The best unadulterated cold-pressed oil in India!"
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                ⭐ 11. Customer Testimonials (DISABLED)
              </div>
            )}

            {/* SECTION 12: BLOGS */}
            {sectionsConfig.show_blog_section === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1 text-[10px]">
                <span className="text-xs font-black text-indigo-400 font-['Outfit'] block">✍️ Wellness & Organic Journal</span>
                <p className="text-slate-300 font-bold">Top 5 Morning Habits for Natural Immunity & Energy</p>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                ✍️ 12. Wellness Journal & Blogs (DISABLED)
              </div>
            )}

            {/* SECTION 13: MAIN CATALOG GRID */}
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
                🛍️ 13. Main Product Catalog & Filters (DISABLED)
              </div>
            )}

            {/* SECTION 14: INSTAGRAM FEED */}
            {sectionsConfig.show_instagram_feed === 1 ? (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-pink-400 font-['Outfit']">📸 Follow Us On Instagram</span>
                  <span className="text-[9px] text-pink-300 font-mono">@valuelife_essentials</span>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="aspect-square bg-slate-850 rounded border border-slate-700/60 flex items-center justify-center text-xs">
                      📸
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                📸 14. Instagram Feed (6-Grid) (DISABLED)
              </div>
            )}

            {/* SECTION 15: NEWSLETTER BANNER */}
            {sectionsConfig.show_newsletter === 1 ? (
              <div className="bg-slate-900/90 p-3 rounded-xl border border-sky-800/60 flex justify-between items-center text-[10px]">
                <div>
                  <span className="text-xs font-black text-sky-400 font-['Outfit'] block">✉️ Stay in the Loop</span>
                  <p className="text-slate-400 text-[9px]">Subscribe for 15% discount on your first order.</p>
                </div>
                <span className="px-2 py-1 bg-sky-500 text-slate-950 font-black rounded text-[9px]">Subscribe</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                ✉️ 15. Newsletter Subscribe Banner (DISABLED)
              </div>
            )}

            {/* SECTION 9: FOOTER */}
            {sectionsConfig.show_footer === 1 ? (
              <div className="bg-[#1b4332] text-white p-3 rounded-xl text-[10px] space-y-1 border border-emerald-900 shadow">
                <span className="font-extrabold text-xs block">🌱 VALUELIFE ESSENTIALS Footer</span>
                <p className="opacity-80 text-[9px]">Your 100% trusted online organic store.</p>
              </div>
            ) : (
              <div className="p-2 rounded-lg border border-dashed border-slate-800 text-center text-[10px] text-slate-600 font-bold">
                🦶 9. Storefront Footer & Links (DISABLED)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

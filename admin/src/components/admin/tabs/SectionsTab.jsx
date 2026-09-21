import React from 'react';
import SectionToggleCard from './sections/SectionToggleCard';
import SalesTickerManager from './sections/SalesTickerManager';
import StorefrontPreview from './sections/StorefrontPreview';

export default function SectionsTab({
  sectionsConfig = {},
  setSectionsConfig,
  handleSectionsConfigSubmit,
  updateAndSaveSectionToggle,
  setActiveTab,
  orders = [],
  banners = [],
  categories = [],
  products = [],
  settingsForm = {},
  heroConfig = {},
  showToast
}) {
  return (
    <div className="space-y-6 w-full" data-reticle-target="admin-sections-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">STOREFRONT SECTIONS CONTROL</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">Master Website Sections Control Center</h3>
        <p className="text-xs text-slate-400">Enable, disable, reorder, and customize headlines & subtext for every single section of your storefront in real time with 50-50 side-by-side live canvas preview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        <div className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <form onSubmit={handleSectionsConfigSubmit} className="space-y-5 text-xs" data-reticle-target="admin-sections-form">
            <SectionToggleCard
              icon={<span className="p-2 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-xl text-lg">📢</span>}
              title="1. Top Header Announcement Bar"
              description="Promotional banner ticker displayed at the very top of the website header."
              configKey="show_announcement"
              value={sectionsConfig.show_announcement}
              onToggle={updateAndSaveSectionToggle}
              extraActions={
                <button
                  type="button"
                  onClick={() => setActiveTab('announcement')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                  data-reticle-target="admin-edit-announcement-link"
                >
                  ✏️ Edit Content
                </button>
              }
            />

            <SectionToggleCard
              icon={<span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">🦸</span>}
              title="2. Hero Banner Showcase"
              description="Main storefront hero banner featuring headlines, CTA buttons, and background images."
              configKey="show_hero"
              value={sectionsConfig.show_hero}
              onToggle={updateAndSaveSectionToggle}
              extraActions={
                <button
                  type="button"
                  onClick={() => setActiveTab('hero')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                  data-reticle-target="admin-edit-hero-link"
                >
                  ✏️ Edit Content
                </button>
              }
            />

            <SectionToggleCard
              icon={<span className="p-2 bg-blue-950/60 border border-blue-800 text-blue-400 rounded-xl text-lg">🌱</span>}
              title="3. Trust & Service Badges Row"
              description="Highlights key value propositions (100% Organic, Fast Delivery, Partial COD, Top Rating)."
              configKey="show_trust_badges"
              value={sectionsConfig.show_trust_badges}
              onToggle={updateAndSaveSectionToggle}
            >
              {sectionsConfig.show_trust_badges === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Badge 1: Title & Subtitle</label>
                    <input type="text" value={sectionsConfig.trust_badge_1_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_1_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                    <input type="text" value={sectionsConfig.trust_badge_1_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_1_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Badge 2: Title & Subtitle</label>
                    <input type="text" value={sectionsConfig.trust_badge_2_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_2_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                    <input type="text" value={sectionsConfig.trust_badge_2_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_2_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Badge 3: Title & Subtitle</label>
                    <input type="text" value={sectionsConfig.trust_badge_3_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_3_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                    <input type="text" value={sectionsConfig.trust_badge_3_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_3_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Badge 4: Title & Subtitle</label>
                    <input type="text" value={sectionsConfig.trust_badge_4_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_4_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white mb-1" placeholder="Title" />
                    <input type="text" value={sectionsConfig.trust_badge_4_sub || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, trust_badge_4_sub: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300" placeholder="Subtitle" />
                  </div>
                </div>
              )}
            </SectionToggleCard>

            <SectionToggleCard
              icon={<span className="p-2 bg-purple-950/60 border border-purple-800 text-purple-400 rounded-xl text-lg">🖼️</span>}
              title="4. Photorealistic Animated Promo Banner Slider (Part 1)"
              description="High-converting animated banner carousel card."
              configKey="show_promo_banners"
              value={sectionsConfig.show_promo_banners}
              onToggle={updateAndSaveSectionToggle}
              extraActions={
                <button
                  type="button"
                  onClick={() => setActiveTab('banners')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  ✏️ Edit Banners
                </button>
              }
            />

            <SectionToggleCard
              icon={<span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">⚡</span>}
              title="4B. Live Social Proof Sales Ticker (Part 2)"
              description='Floating customer purchase ticker ("Priya Patel from Bengaluru just purchased...")'
              configKey="show_sales_ticker"
              value={sectionsConfig.show_sales_ticker}
              onToggle={updateAndSaveSectionToggle}
              isTicker={true}
            >
              <SalesTickerManager 
                sectionsConfig={sectionsConfig}
                setSectionsConfig={setSectionsConfig}
                orders={orders}
                showToast={showToast}
              />
            </SectionToggleCard>

            <SectionToggleCard
              icon={<span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">⭕</span>}
              title="5. Shop By Categories Circular Slider"
              description="Horizontal infinite carousel displaying category circular badges."
              configKey="show_categories_slider"
              value={sectionsConfig.show_categories_slider}
              onToggle={updateAndSaveSectionToggle}
            >
              {sectionsConfig.show_categories_slider === 1 && (
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Section Title</label>
                  <input 
                    type="text"
                    value={sectionsConfig.category_slider_title || ''}
                    onChange={(e) => setSectionsConfig({ ...sectionsConfig, category_slider_title: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    placeholder="e.g. Shop By Categories"
                  />
                </div>
              )}
            </SectionToggleCard>

            <SectionToggleCard
              icon={<span className="p-2 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-xl text-lg">🔥</span>}
              title="6. Best Seller Products Showcase"
              description="Curated highlight grid displaying top-selling products on storefront."
              configKey="show_bestsellers"
              value={sectionsConfig.show_bestsellers}
              onToggle={updateAndSaveSectionToggle}
            >
              {sectionsConfig.show_bestsellers === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Badge Tag</label>
                    <input type="text" value={sectionsConfig.bestsellers_badge || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, bestsellers_badge: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Section Title</label>
                    <input type="text" value={sectionsConfig.bestsellers_title || ''} onChange={(e) => setSectionsConfig({ ...sectionsConfig, bestsellers_title: e.target.value })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Max Display Items</label>
                    <input type="number" min="4" max="24" value={sectionsConfig.bestsellers_count || 8} onChange={(e) => setSectionsConfig({ ...sectionsConfig, bestsellers_count: Number(e.target.value) })} className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" />
                  </div>
                </div>
              )}
            </SectionToggleCard>

            <SectionToggleCard
              icon={<span className="p-2 bg-blue-950/60 border border-blue-800 text-blue-400 rounded-xl text-lg">🛍️</span>}
              title="7. Main Product Catalog & Filter Grid"
              description="Primary product catalog grid with dynamic pill filters and view controls."
              configKey="show_catalog_grid"
              value={sectionsConfig.show_catalog_grid}
              onToggle={updateAndSaveSectionToggle}
            />

            <SectionToggleCard
              icon={<span className="p-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-lg">🦶</span>}
              title="8. Storefront Footer & Legal Links"
              description="Footer column navigation, payment logos, contact details and copyright line."
              configKey="show_footer"
              value={sectionsConfig.show_footer}
              onToggle={updateAndSaveSectionToggle}
            />

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] transition-transform duration-140 text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-wider text-xs cursor-pointer"
              data-reticle-target="admin-save-sections-config-btn"
            >
              Save Storefront Sections Configuration Live
            </button>
          </form>
        </div>

        <StorefrontPreview 
          sectionsConfig={sectionsConfig}
          heroConfig={heroConfig}
          banners={banners}
          categories={categories}
          products={products}
          settingsForm={settingsForm}
        />
      </div>
    </div>
  );
}

import { DEFAULT_FALLBACK_SVG, getProxyImgUrl } from '../../../utils/resolveImgUrl';
import React from 'react';
import { ToggleRight, ToggleLeft, Trash2 } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';
import HeroSection from '../../sections/HeroSection';
import PromoBannerSlider from '../../sections/PromoBannerSlider';

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
  const currentTickers = (() => {
    if (!sectionsConfig?.sales_ticker_json) {
      return [
        { id: 1, name: 'Rohan Sharma', city: 'New Delhi', item: '5kg Organic Vermicompost', time: '2m ago' },
        { id: 2, name: 'Priya Patel', city: 'Bengaluru', item: '1L Liquid Seaweed Extract', time: '4m ago' },
        { id: 3, name: 'Amit Verma', city: 'Mumbai', item: '2kg Neem Cake Powder', time: '6m ago' },
        { id: 4, name: 'Neha Gupta', city: 'Pune', item: 'Organic Epsom Salt Booster', time: '8m ago' }
      ];
    }
    try {
      const parsed = typeof sectionsConfig.sales_ticker_json === 'string'
        ? JSON.parse(sectionsConfig.sales_ticker_json)
        : sectionsConfig.sales_ticker_json;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  })();

  const handleTickerChange = (index, field, value) => {
    const updated = [...currentTickers];
    updated[index] = { ...updated[index], [field]: value };
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(updated)
    });
  };

  const handleAddTicker = () => {
    const updated = [
      ...currentTickers,
      { id: Date.now(), name: 'New Customer', city: 'City', item: 'Organic Fertilizer', time: 'Just now' }
    ];
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(updated)
    });
  };

  const handleDeleteTicker = (index) => {
    const updated = currentTickers.filter((_, i) => i !== index);
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(updated)
    });
  };

  const handleSyncWithOrders = () => {
    if (!orders || orders.length === 0) {
      if (showToast) showToast('info', 'No Real Orders Yet', 'Added default customer ticker samples.');
      return;
    }
    const synced = orders.slice(0, 8).map((o, idx) => ({
      id: o.id || idx + 1,
      name: o.customer_name || 'Verified Customer',
      city: o.city || o.shipping_address?.split(',')[1]?.trim() || 'India',
      item: o.items?.[0]?.product_name || o.order_number || 'Organic Agro Product',
      time: o.created_at ? `${Math.max(1, Math.floor((Date.now() - new Date(o.created_at).getTime()) / (1000 * 60)))}m ago` : 'Recent'
    }));
    setSectionsConfig({
      ...sectionsConfig,
      sales_ticker_json: JSON.stringify(synced)
    });
    if (showToast) showToast('success', 'Synced with Real Customer Orders!', `Updated ticker with ${synced.length} real store purchases.`);
  };

  return (
    <div className="space-y-6 w-full" data-reticle-target="admin-sections-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">STOREFRONT SECTIONS CONTROL</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">Master Website Sections Control Center</h3>
        <p className="text-xs text-slate-400">Enable, disable, reorder, and customize headlines & subtext for every single section of your storefront in real time with 50-50 side-by-side live canvas preview.</p>
      </div>

      {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        {/* LEFT COLUMN: CONTROLS & TOGGLES */}
        <div className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <form onSubmit={handleSectionsConfigSubmit} className="space-y-5 text-xs" data-reticle-target="admin-sections-form">
            {/* SECTION 1: HEADER TOP ANNOUNCEMENT BAR */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-xl text-lg">📢</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">1. Top Header Announcement Bar</span>
                    <p className="text-slate-400 text-xs">Promotional banner ticker displayed at the very top of the website header.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcement')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                    data-reticle-target="admin-edit-announcement-link"
                  >
                    ✏️ Edit Content
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateAndSaveSectionToggle('show_announcement', sectionsConfig.show_announcement === 1 ? 0 : 1)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      sectionsConfig.show_announcement === 1 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                    data-reticle-target="admin-toggle-announcement-section"
                  >
                    {sectionsConfig.show_announcement === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>{sectionsConfig.show_announcement === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: HERO SECTION MANAGER */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">🦸</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">2. Hero Banner Showcase</span>
                    <p className="text-slate-400 text-xs">Main storefront hero banner featuring headlines, CTA buttons, and background images.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('hero')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                    data-reticle-target="admin-edit-hero-link"
                  >
                    ✏️ Edit Content
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateAndSaveSectionToggle('show_hero', sectionsConfig.show_hero === 1 ? 0 : 1)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      sectionsConfig.show_hero === 1 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                    data-reticle-target="admin-toggle-hero-section"
                  >
                    {sectionsConfig.show_hero === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>{sectionsConfig.show_hero === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: TRUST & SERVICE BADGES ROW */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-blue-950/60 border border-blue-800 text-blue-400 rounded-xl text-lg">🌱</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">3. Trust & Service Badges Row</span>
                    <p className="text-slate-400 text-xs">Highlights key value propositions (100% Organic, Fast Delivery, Partial COD, Top Rating).</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => updateAndSaveSectionToggle('show_trust_badges', sectionsConfig.show_trust_badges === 1 ? 0 : 1)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                    sectionsConfig.show_trust_badges === 1 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  data-reticle-target="admin-toggle-trust-badges"
                >
                  {sectionsConfig.show_trust_badges === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span>{sectionsConfig.show_trust_badges === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                </button>
              </div>

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
            </div>

            {/* SECTION 4: ANIMATED PROMO BANNERS SLIDER */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-purple-950/60 border border-purple-800 text-purple-400 rounded-xl text-lg">🖼️</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">4. Photorealistic Animated Promo Banner Slider (Part 1)</span>
                    <p className="text-slate-400 text-xs">High-converting animated banner carousel card.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab('banners')}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-400 font-extrabold text-xs rounded-xl border border-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    ✏️ Edit Banners
                  </button>
                  <button 
                    type="button"
                    onClick={() => updateAndSaveSectionToggle('show_promo_banners', sectionsConfig.show_promo_banners === 1 ? 0 : 1)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      sectionsConfig.show_promo_banners === 1 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                    data-reticle-target="admin-toggle-promo-banners"
                  >
                    {sectionsConfig.show_promo_banners === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>{sectionsConfig.show_promo_banners === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4B: LIVE SOCIAL PROOF SALES TICKER */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">⚡</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">4B. Live Social Proof Sales Ticker (Part 2)</span>
                    <p className="text-slate-400 text-xs">Floating customer purchase ticker ("Priya Patel from Bengaluru just purchased...")</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => updateAndSaveSectionToggle('show_sales_ticker', sectionsConfig.show_sales_ticker === 0 ? 1 : 0)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                    sectionsConfig.show_sales_ticker !== 0 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  data-reticle-target="admin-toggle-sales-ticker"
                >
                  {sectionsConfig.show_sales_ticker !== 0 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span>{sectionsConfig.show_sales_ticker !== 0 ? 'TICKER ENABLED (ON)' : 'TICKER DISABLED (OFF)'}</span>
                </button>
              </div>

              {sectionsConfig.show_sales_ticker !== 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                  <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-300">Live Customer Purchase Notifications ({currentTickers.length})</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSyncWithOrders}
                        className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded-lg font-bold transition-all cursor-pointer"
                        data-reticle-target="admin-sync-orders-ticker"
                      >
                        ⚡ Auto-Sync Real Orders
                      </button>
                      <button
                        type="button"
                        onClick={handleAddTicker}
                        className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-400 border border-blue-800 rounded-lg font-bold transition-all cursor-pointer"
                        data-reticle-target="admin-add-ticker-entry"
                      >
                        + Add Entry
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {currentTickers.map((t, idx) => (
                      <div key={t.id || idx} className="p-2 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={t.name || ''}
                            onChange={(e) => handleTickerChange(idx, 'name', e.target.value)}
                            placeholder="Customer Name"
                            className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={t.city || ''}
                            onChange={(e) => handleTickerChange(idx, 'city', e.target.value)}
                            placeholder="City"
                            className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-emerald-400 text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={t.item || ''}
                            onChange={(e) => handleTickerChange(idx, 'item', e.target.value)}
                            placeholder="Item Purchased"
                            className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-amber-300 text-xs font-bold"
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={t.time || ''}
                            onChange={(e) => handleTickerChange(idx, 'time', e.target.value)}
                            placeholder="e.g. 5m ago"
                            className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded text-slate-400 text-xs"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <button 
                            type="button" 
                            onClick={() => handleDeleteTicker(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1 bg-rose-950 rounded border border-rose-900 cursor-pointer"
                            title="Delete notification entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: CIRCULAR CATEGORIES SLIDER */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-lg">⭕</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">5. Shop By Categories Circular Slider</span>
                    <p className="text-slate-400 text-xs">Horizontal infinite carousel displaying category circular badges.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    type="button"
                    onClick={() => updateAndSaveSectionToggle('show_categories_slider', sectionsConfig.show_categories_slider === 1 ? 0 : 1)}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                      sectionsConfig.show_categories_slider === 1 
                        ? 'bg-emerald-600 text-white shadow-lg' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                    data-reticle-target="admin-toggle-categories-slider"
                  >
                    {sectionsConfig.show_categories_slider === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    <span>{sectionsConfig.show_categories_slider === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                  </button>
                </div>
              </div>

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
            </div>

            {/* SECTION 6: BEST SELLER PRODUCTS SHOWCASE */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-4 shadow-md">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-amber-950/60 border border-amber-800 text-amber-400 rounded-xl text-lg">🔥</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">6. Best Seller Products Showcase</span>
                    <p className="text-slate-400 text-xs">Curated highlight grid displaying top-selling products on storefront.</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => updateAndSaveSectionToggle('show_bestsellers', sectionsConfig.show_bestsellers === 1 ? 0 : 1)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                    sectionsConfig.show_bestsellers === 1 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  data-reticle-target="admin-toggle-bestsellers"
                >
                  {sectionsConfig.show_bestsellers === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span>{sectionsConfig.show_bestsellers === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                </button>
              </div>

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
            </div>

            {/* SECTION 7: MAIN CATALOG PRODUCT GRID */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-blue-950/60 border border-blue-800 text-blue-400 rounded-xl text-lg">🛍️</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">7. Main Product Catalog & Filter Grid</span>
                    <p className="text-slate-400 text-xs">Primary product catalog grid with dynamic pill filters and view controls.</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => updateAndSaveSectionToggle('show_catalog_grid', sectionsConfig.show_catalog_grid === 1 ? 0 : 1)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                    sectionsConfig.show_catalog_grid === 1 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  data-reticle-target="admin-toggle-catalog-grid"
                >
                  {sectionsConfig.show_catalog_grid === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span>{sectionsConfig.show_catalog_grid === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                </button>
              </div>
            </div>

            {/* SECTION 8: STORE FOOTER */}
            <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-lg">🦶</span>
                  <div>
                    <span className="font-extrabold text-sm text-white block">8. Storefront Footer & Legal Links</span>
                    <p className="text-slate-400 text-xs">Footer column navigation, payment logos, contact details and copyright line.</p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => updateAndSaveSectionToggle('show_footer', sectionsConfig.show_footer === 1 ? 0 : 1)}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                    sectionsConfig.show_footer === 1 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                  data-reticle-target="admin-toggle-footer-section"
                >
                  {sectionsConfig.show_footer === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  <span>{sectionsConfig.show_footer === 1 ? 'SECTION ENABLED (ON)' : 'SECTION DISABLED (OFF)'}</span>
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] transition-transform duration-140 text-white font-black py-4 rounded-xl shadow-xl uppercase tracking-wider text-xs cursor-pointer"
              data-reticle-target="admin-save-sections-config-btn"
            >
              Save Storefront Sections Configuration Live
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE STOREFRONT PREVIEW CANVAS */}
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
      </div>
    </div>
  );
}

import { DEFAULT_FALLBACK_SVG, getProxyImgUrl } from '../../../utils/resolveImgUrl';
import React from 'react';
import { Sparkles, Eye, Heart, ShoppingBag, CheckCircle } from 'lucide-react';

export default function ThemeTab({
  themeConfig,
  setThemeConfig,
  handleThemeSubmit
}) {
  return (
    <div className="space-y-6" data-reticle-target="admin-theme-tab">
      {/* TOP HEADER BAR */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-['Outfit']">
            <Sparkles className="text-emerald-400" size={20} /> Store Theme & Design System Engine
          </h3>
          <p className="text-xs text-slate-400">Customize brand colors, typography fonts, UI border radiuses, and header styles live across your entire store.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setThemeConfig({ ...themeConfig, dark_mode: themeConfig.dark_mode === 1 ? 0 : 1 })}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              themeConfig.dark_mode === 1 
                ? 'bg-slate-800 text-amber-400 border border-amber-500/40' 
                : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
            }`}
            data-reticle-target="admin-toggle-dark-mode"
          >
            <span>{themeConfig.dark_mode === 1 ? '🌙 DARK MODE ACTIVE' : '☀️ LIGHT MODE ACTIVE'}</span>
          </button>
        </div>
      </div>

      {/* SPLIT SCREEN EDIT & LIVE THEME PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: THEME CONTROLS & COLOR PICKERS */}
        <div className="lg:col-span-6 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <form onSubmit={handleThemeSubmit} className="space-y-5 text-xs" data-reticle-target="admin-theme-form">
            {/* 1. THEME PRESETS SELECTOR */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">1. Curated 1-Click Theme Presets</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'EMERALD', name: 'Organic Emerald', primary: '#3b6e14', accent: '#f59e0b', font: 'Outfit', radius: 'rounded-3xl' },
                  { id: 'AVOCADO', name: 'Fresh Avocado', primary: '#2d5a27', accent: '#eab308', font: 'Plus Jakarta Sans', radius: 'rounded-2xl' },
                  { id: 'HAZELNUT', name: 'Warm Earth', primary: '#654321', accent: '#d97706', font: 'Playfair Display', radius: 'rounded-xl' },
                  { id: 'INDIGO', name: 'Berry Indigo', primary: '#3730a3', accent: '#ec4899', font: 'Cabinet Grotesk', radius: 'rounded-3xl' },
                  { id: 'LUXURY_DARK', name: 'Luxury Gold', primary: '#18181b', accent: '#eab308', font: 'Playfair Display', radius: 'rounded-xl' }
                ].map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setThemeConfig({
                      ...themeConfig,
                      active_preset: preset.id,
                      primary_color: preset.primary,
                      accent_color: preset.accent,
                      heading_font: preset.font,
                      border_radius: preset.radius
                    })}
                    className={`p-3 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                      themeConfig.active_preset === preset.id
                        ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                    data-reticle-target={`admin-theme-preset-${preset.id}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.accent }} />
                    </div>
                    <span className="font-extrabold text-xs text-white block">{preset.name}</span>
                    <span className="text-[9px] opacity-75 block font-mono">{preset.font} • {preset.primary}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CUSTOM BRAND COLORS */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-4">
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">2. Brand Palette & Color Pickers</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Primary Brand Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={themeConfig.primary_color || '#3b6e14'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primary_color: e.target.value })}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                    />
                    <input 
                      type="text"
                      value={themeConfig.primary_color || '#3b6e14'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primary_color: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Primary Button Hover Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={themeConfig.primary_hover || '#2e5710'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primary_hover: e.target.value })}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                    />
                    <input 
                      type="text"
                      value={themeConfig.primary_hover || '#2e5710'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, primary_hover: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Accent Highlight Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={themeConfig.accent_color || '#f59e0b'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, accent_color: e.target.value })}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                    />
                    <input 
                      type="text"
                      value={themeConfig.accent_color || '#f59e0b'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, accent_color: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Card Background Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color"
                      value={themeConfig.secondary_color || '#f8f7f2'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, secondary_color: e.target.value })}
                      className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer shrink-0"
                    />
                    <input 
                      type="text"
                      value={themeConfig.secondary_color || '#f8f7f2'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, secondary_color: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TYPOGRAPHY FONTS */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">3. Typography & Google Fonts</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Heading Font Family</label>
                  <select
                    value={themeConfig.heading_font || 'Outfit'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, heading_font: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="Outfit">Outfit (Modern Bold)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Sleek Clean)</option>
                    <option value="Inter">Inter (Swiss Tech)</option>
                    <option value="Playfair Display">Playfair Display (Luxury Serif)</option>
                    <option value="Roboto">Roboto (Classic Sans)</option>
                    <option value="Cabinet Grotesk">Cabinet Grotesk (Editorial Display)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Body Text Font</label>
                  <select
                    value={themeConfig.body_font || 'Inter'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, body_font: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="Inter">Inter (Ultra Readable)</option>
                    <option value="Outfit">Outfit (Modern)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                    <option value="Roboto">Roboto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4. CORNER ROUNDNESS & HEADER STYLE */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">4. UI Border Roundness & Navbar Theme</span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Product Card Corner Radius</label>
                  <select
                    value={themeConfig.border_radius || 'rounded-3xl'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, border_radius: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="rounded-3xl">Pill Smooth (rounded-3xl)</option>
                    <option value="rounded-2xl">Modern Soft (rounded-2xl)</option>
                    <option value="rounded-xl">Subtle Curved (rounded-xl)</option>
                    <option value="rounded-none">Sharp Minimalist (rounded-none)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Navbar Header Theme</label>
                  <select
                    value={themeConfig.header_style || 'EMERALD_DARK'}
                    onChange={(e) => setThemeConfig({ ...themeConfig, header_style: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="EMERALD_DARK">Emerald Dark Gradient</option>
                    <option value="MINIMAL_WHITE">Clean Minimal White</option>
                    <option value="GOLD_ACCENT">Gold Accent Border</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. PRODUCT CARD DESIGN & ACTION BUTTON STYLE */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">
                  Product Card Action & Layout Design
                </span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Selected: {(themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'CLASSIC_SPLIT' ? '2-Button Split' : 'VALUELIFE ESSENTIALS Pill'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setThemeConfig({ ...themeConfig, card_style: 'VALUELIFE_ESSENTIALS' })}
                  className={`p-3 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                    (themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'VALUELIFE_ESSENTIALS'
                      ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                  data-reticle-target="admin-card-style-pill"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-white">VALUELIFE ESSENTIALS Pill Card</span>
                    {(themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'VALUELIFE_ESSENTIALS' && <CheckCircle size={14} className="text-emerald-400" />}
                  </div>
                  <p className="text-[10px] opacity-80 font-medium">1-Click ADD TO CART button + Rating Stars + Red Heart Wishlist Pill</p>
                </button>

                <button
                  type="button"
                  onClick={() => setThemeConfig({ ...themeConfig, card_style: 'CLASSIC_SPLIT' })}
                  className={`p-3 rounded-xl border text-left space-y-1.5 transition-all cursor-pointer ${
                    themeConfig.card_style === 'CLASSIC_SPLIT'
                      ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                  data-reticle-target="admin-card-style-split"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-xs text-white">Classic 2-Button Split</span>
                    {themeConfig.card_style === 'CLASSIC_SPLIT' && <CheckCircle size={14} className="text-emerald-400" />}
                  </div>
                  <p className="text-[10px] opacity-80 font-medium">Side-by-Side 2 Buttons: [ Details ] + [ + Add ]</p>
                </button>
              </div>

              {/* INLINE LIVE CARD PREVIEW MOCKUP BOX */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="text-[11px] font-extrabold text-slate-200 flex items-center gap-1.5">
                    <Eye size={14} className="text-emerald-400" /> Card Live Preview Mockup:
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                    {(themeConfig.card_style || 'VALUELIFE_ESSENTIALS') === 'CLASSIC_SPLIT' ? 'Classic 2-Button Split' : 'VALUELIFE ESSENTIALS 1-Click Pill'}
                  </span>
                </div>

                <div className="bg-[#f8f7f2] p-3 rounded-2xl border border-gray-300 space-y-2.5 shadow-md max-w-sm mx-auto">
                  <div className="w-full h-28 bg-white rounded-xl relative flex items-center justify-center p-2 border border-gray-200">
                    <img src={DEFAULT_FALLBACK_SVG} alt="Preview" className="h-full object-contain" />
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f87171] text-white flex items-center justify-center shadow">
                      <Heart size={12} fill="white" color="white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-extrabold text-xs text-gray-800 truncate">Organic Himalayan Pink Salt Powder 1kg</div>
                    <div className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                      <span>★★★★★ 5.00</span>
                      <span className="text-gray-400">| (24)</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-black text-gray-900">₹129.00</span>
                      <span className="text-[10px] text-gray-400 line-through">₹199.00</span>
                      <span className="bg-[#4a7729] text-white text-[9px] font-bold px-1 rounded">-35% Off</span>
                    </div>
                  </div>

                  {(themeConfig.card_style === 'CLASSIC_SPLIT') ? (
                    <div className="flex gap-1.5 pt-1">
                      <button type="button" className="border-2 border-[#3b6e14] text-[#3b6e14] flex-1 py-1.5 rounded-lg text-[10px] font-bold text-center">
                        Details
                      </button>
                      <button type="button" className="bg-[#3b6e14] text-white flex-1 py-1.5 rounded-lg text-[10px] font-black text-center">
                        + Add
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="w-full bg-[#3b6e14] text-white py-2 rounded-full font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow">
                      <ShoppingBag size={12} /> ADD TO CART
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-xl transition-all cursor-pointer text-xs uppercase tracking-wider" data-reticle-target="admin-save-theme-btn">
              Save Theme & Publish Across Entire Website
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE THEME PREVIEW CANVAS */}
        <div className="lg:col-span-6 sticky top-6 space-y-3" data-reticle-target="admin-theme-preview-canvas">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                  LIVE REAL-TIME THEME PREVIEW CANVAS
                </span>
              </div>
              <span className="bg-slate-800 text-emerald-400 text-[10px] px-2.5 py-0.5 rounded border border-slate-700 font-extrabold uppercase">
                {themeConfig.active_preset} PRESET
              </span>
            </div>

            {/* MOCK STOREFRONT THEME COMPONENT CANVAS */}
            <div 
              className="rounded-2xl p-5 border border-slate-700 space-y-5 transition-all shadow-2xl overflow-hidden"
              style={{ 
                backgroundColor: themeConfig.dark_mode === 1 ? '#090d16' : '#ffffff',
                fontFamily: themeConfig.body_font || 'Inter'
              }}
            >
              {/* HEADER MOCKUP */}
              <div 
                className="p-3.5 rounded-xl flex items-center justify-between shadow-md"
                style={{
                  backgroundColor: themeConfig.header_style === 'CLEAN_LIGHT' ? '#ffffff' : (themeConfig.primary_color || '#3b6e14'),
                  color: themeConfig.header_style === 'CLEAN_LIGHT' ? '#0f172a' : '#ffffff',
                  border: themeConfig.header_style === 'CLEAN_LIGHT' ? '1px solid #e2e8f0' : 'none'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌿</span>
                  <span className="font-black text-sm tracking-tight" style={{ fontFamily: themeConfig.heading_font || 'Outfit' }}>
                    VALUELIFE ESSENTIALS
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-lg" style={{ backgroundColor: themeConfig.accent_color || '#f59e0b', color: '#000' }}>
                    Cart (3)
                  </span>
                </div>
              </div>

              {/* HERO BADGE & TITLE MOCKUP */}
              <div className="space-y-2 text-center py-2">
                <span 
                  className="text-[10px] font-black uppercase px-3 py-1 rounded-full inline-block border"
                  style={{
                    backgroundColor: `${themeConfig.primary_color}15`,
                    color: themeConfig.primary_color || '#3b6e14',
                    borderColor: `${themeConfig.primary_color}40`
                  }}
                >
                  🌱 100% Certified Organic Theme
                </span>

                <h3 
                  className="text-xl font-black tracking-tight"
                  style={{ 
                    fontFamily: themeConfig.heading_font || 'Outfit',
                    color: themeConfig.dark_mode === 1 ? '#ffffff' : '#0f172a'
                  }}
                >
                  Fresh Organic Groceries & Superfoods
                </h3>
              </div>

              {/* MOCK PRODUCT CARD IN CANVAS */}
              <div 
                className={`p-3.5 border space-y-3 shadow-md transition-all ${themeConfig.border_radius || 'rounded-3xl'}`}
                style={{
                  backgroundColor: themeConfig.secondary_color || '#f8f7f2',
                  borderColor: '#e2e8f0'
                }}
              >
                <div className="w-full h-32 bg-white rounded-xl overflow-hidden relative flex items-center justify-center p-2">
                  <img 
                    src={DEFAULT_FALLBACK_SVG} 
                    alt="Mock" 
                    className="w-full h-full object-contain rounded-lg" 
                  />
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#f87171] text-white flex items-center justify-center shadow">
                    <Heart size={12} fill="white" color="white" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-amber-600">★★★★★ 5.0 (24 Reviews)</span>
                  <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">Pure Organic Ashwagandha Root Powder</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">₹349.00</span>
                    <span className="text-xs text-slate-400 line-through">₹499.00</span>
                    <span className="bg-[#4a7729] text-white text-[9px] font-bold px-1 rounded">-30% Off</span>
                  </div>
                </div>

                {/* DYNAMIC CARD BUTTON IN CANVAS */}
                {(themeConfig.card_style === 'CLASSIC_SPLIT') ? (
                  <div className="flex gap-1.5 pt-1">
                    <button 
                      type="button"
                      className="border-2 border-[#3b6e14] text-[#3b6e14] flex-1 py-2 rounded-xl text-xs font-bold text-center"
                    >
                      Details
                    </button>
                    <button 
                      type="button"
                      className="bg-[#3b6e14] text-white flex-1 py-2 rounded-xl text-xs font-black text-center"
                    >
                      + Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-full text-white font-extrabold text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: themeConfig.primary_color || '#3b6e14' }}
                  >
                    <ShoppingBag size={14} /> ADD TO CART
                  </button>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium">
              💡 Theme choices update live in real-time. Click Save to publish across all customer devices!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

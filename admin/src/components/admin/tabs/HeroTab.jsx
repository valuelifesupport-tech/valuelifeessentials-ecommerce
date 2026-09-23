import React from 'react';
import { Sparkles, ToggleRight, ToggleLeft, CheckCircle } from 'lucide-react';
import ImageUploader from '../../common/ImageUploader';
import HeroSection from '../../sections/HeroSection';

export default function HeroTab({
  heroConfig,
  setHeroConfig,
  sectionsConfig,
  setSectionsConfig,
  handleHeroSubmit,
  updateAndSaveHeroToggle,
  showToast
}) {
  const isHeroEnabled = Number(heroConfig?.hero_enabled) === 1 || heroConfig?.hero_enabled === true;

  const handleToggle = () => {
    const nextVal = isHeroEnabled ? 0 : 1;
    if (typeof updateAndSaveHeroToggle === 'function') {
      updateAndSaveHeroToggle(nextVal);
    } else {
      setHeroConfig(prev => ({ ...prev, hero_enabled: nextVal }));
      if (setSectionsConfig) {
        setSectionsConfig(prev => ({ ...prev, show_hero: nextVal }));
      }
    }
  };

  return (
    <div className="space-y-6" data-reticle-target="admin-hero-tab">
      {/* TOP HEADER BAR */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 font-['Outfit']">
            <Sparkles className="text-emerald-400" size={20} /> Real-Time Live Hero Studio
          </h3>
          <p className="text-xs text-slate-400">Edit headlines, upload images, switch layout styles & see the live storefront preview update instantly.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleToggle}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isHeroEnabled 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40' 
                : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 shadow-rose-950/40'
            }`}
            data-reticle-target="admin-toggle-hero-enabled"
          >
            {isHeroEnabled ? <ToggleRight size={20} className="text-emerald-300" /> : <ToggleLeft size={20} className="text-rose-400" />}
            <span>{isHeroEnabled ? 'HERO SECTION ON' : 'HERO SECTION OFF'}</span>
          </button>
        </div>
      </div>

      {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        {/* LEFT COLUMN: CONTROLS & FORM */}
        <div className="w-full bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <form onSubmit={handleHeroSubmit} className="space-y-5 text-xs" data-reticle-target="admin-hero-form">
            {/* 1. LAYOUT PICKER */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">1. Active Layout Style</span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'SPLIT', title: 'Shopify Split', sub: 'Left Text + Right Floating Card' },
                  { id: 'CINEMATIC', title: 'Cinematic Full', sub: 'Fullbleed BG Image + Centered Text' },
                  { id: 'BENTO', title: 'Bento Grid', sub: '3-Card Modern Grid' },
                  { id: 'MINIMALIST', title: 'Minimalist Clean', sub: 'Warm Monotone Header' }
                ].map(style => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setHeroConfig({ ...heroConfig, active_style: style.id })}
                    className={`p-3 rounded-xl border text-left space-y-1 transition-all cursor-pointer ${
                      heroConfig.active_style === style.id 
                        ? 'bg-emerald-950 border-emerald-500 text-white ring-2 ring-emerald-500/30' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                    data-reticle-target={`admin-hero-style-${style.id}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-white">{style.title}</span>
                      {heroConfig.active_style === style.id && <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <p className="text-[10px] opacity-80 font-medium">{style.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. HEADLINES & CTAS */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">2. Headlines & Buttons</span>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Badge Tagline Text</label>
                <input 
                  type="text"
                  value={heroConfig.badge_text || ''}
                  onChange={(e) => setHeroConfig({ ...heroConfig, badge_text: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  placeholder="e.g. 100% Certified Organic Superfoods"
                  data-reticle-target="admin-hero-badge-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Main Hero Title *</label>
                <input 
                  type="text" required
                  value={heroConfig.title || ''}
                  onChange={(e) => setHeroConfig({ ...heroConfig, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-extrabold"
                  data-reticle-target="admin-hero-title-input"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Hero Subtitle Paragraph</label>
                <textarea 
                  rows={2}
                  value={heroConfig.subtitle || ''}
                  onChange={(e) => setHeroConfig({ ...heroConfig, subtitle: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
                  data-reticle-target="admin-hero-subtitle-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Primary CTA Label</label>
                  <input 
                    type="text"
                    value={heroConfig.primary_btn_text || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, primary_btn_text: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    data-reticle-target="admin-hero-primary-label"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Primary CTA Link</label>
                  <input 
                    type="text"
                    value={heroConfig.primary_btn_link || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, primary_btn_link: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    data-reticle-target="admin-hero-primary-link"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Secondary CTA Label</label>
                  <input 
                    type="text"
                    value={heroConfig.secondary_btn_text || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, secondary_btn_text: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    data-reticle-target="admin-hero-secondary-label"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Secondary CTA Link</label>
                  <input 
                    type="text"
                    value={heroConfig.secondary_btn_link || ''}
                    onChange={(e) => setHeroConfig({ ...heroConfig, secondary_btn_link: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono"
                    data-reticle-target="admin-hero-secondary-link"
                  />
                </div>
              </div>
            </div>

            {/* 3. MEDIA & UPLOADER */}
            <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">3. Media & Uploads</span>

              <div className="space-y-4">
                <ImageUploader 
                  label="Main Hero Card Image *"
                  value={heroConfig.image_url || ''}
                  onChange={(newUrl) => setHeroConfig({ ...heroConfig, image_url: newUrl })}
                  placeholder="https://images.unsplash.com/..."
                />

                <ImageUploader 
                  label="Background Image (Cinematic Style)"
                  value={heroConfig.bg_image_url || ''}
                  onChange={(newUrl) => setHeroConfig({ ...heroConfig, bg_image_url: newUrl })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl shadow-xl transition-all cursor-pointer text-xs uppercase tracking-wider" data-reticle-target="admin-hero-submit-btn">
              Save & Publish Hero Configuration Live
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE STOREFRONT PREVIEW CANVAS */}
        <div className="w-full sticky top-6 space-y-3" data-reticle-target="admin-hero-preview-canvas">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                  LIVE REAL-TIME STOREFRONT PREVIEW
                </span>
              </div>
              <span className="bg-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-slate-700 font-extrabold uppercase">
                {heroConfig.active_style} LAYOUT
              </span>
            </div>

            {/* MOCK BROWSER FRAME */}
            <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl">
              {/* BROWSER BAR */}
              <div className="bg-slate-800 px-3 py-2 flex items-center justify-between border-b border-slate-700 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="bg-slate-900 px-3 py-0.5 rounded-md border border-slate-700 text-slate-300">
                  {import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173'} (Live Preview Canvas)
                </span>
                <div className="text-[10px] text-emerald-400 font-bold">100% Live Sync</div>
              </div>

              {/* RENDERED HERO SECTION */}
              <div className="max-h-[580px] overflow-y-auto bg-slate-950 scrollbar-thin">
                {isHeroEnabled ? (
                  <HeroSection heroConfig={heroConfig} sectionsConfig={sectionsConfig} navigateTo={() => {}} />
                ) : (
                  <div className="py-16 px-6 text-center space-y-4 bg-slate-900/60">
                    <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
                      🚫
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">
                        Hero Section is Currently Turned OFF
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        This section is currently hidden from your storefront visitors. Turn it ON anytime using the button above or below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Sparkles size={14} /> Turn Hero Section ON
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium">
              💡 Every title, button, image upload, or layout click updates this preview canvas instantly in real-time!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';
import PromoBannerSlider from '../../sections/PromoBannerSlider';

export default function BannersTab({
  banners = [],
  setBanners,
  setShowBannerModal,
  sectionsConfig,
  adminFetch,
  showToast
}) {
  return (
    <div className="space-y-6 w-full" data-reticle-target="admin-banners-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">MARKETING & SLIDERS</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">Hero Banners & Promotional Sliders Studio</h3>
        <p className="text-xs text-slate-400">Manage hero slider images and promotional text with real-time 50-50 side-by-side storefront canvas preview.</p>
      </div>

      {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        {/* LEFT COLUMN: CONTROLS & BANNERS LIST */}
        <div className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h4 className="font-extrabold text-white text-sm">Active Banners & Slides ({banners.length})</h4>
              <p className="text-[11px] text-slate-400">Add or remove promotional slides appearing on storefront.</p>
            </div>

            <button 
              onClick={() => setShowBannerModal(true)} 
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
              data-reticle-target="admin-add-banner-btn"
            >
              <Plus size={16} /> Add Hero Banner
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {banners.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs font-bold" data-reticle-target="admin-empty-banners">
                No custom banners added yet. Showing default photorealistic slides.
              </div>
            ) : (
              banners.map(b => (
                <div key={b.id} className="p-4 border border-slate-800 rounded-2xl bg-slate-850 space-y-3 shadow-sm" data-reticle-target={`admin-banner-card-${b.id}`}>
                  <img 
                    src={resolveImgUrl(b.image_url)} 
                    alt={b.title} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80'; }} 
                    className="w-full h-36 object-cover rounded-xl border border-slate-700 bg-slate-900" 
                  />
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-bold text-white text-xs">{b.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-tight">{b.subtitle}</p>
                      {b.link_url && <span className="text-[10px] text-emerald-400 font-mono block mt-1">Link: {b.link_url}</span>}
                    </div>
                    <button 
                      onClick={async () => { 
                        const res = await adminFetch(`/api/banners/${b.id}`, { method: 'DELETE' }); 
                        if (res.ok) { 
                          setBanners(prev => prev.filter(x => x.id !== b.id)); 
                          if (showToast) showToast('success', 'Banner Deleted', `Banner "${b.title}" removed.`); 
                        } 
                      }} 
                      className="text-rose-400 hover:text-rose-300 p-1.5 bg-rose-950/60 rounded-lg border border-rose-900 text-xs cursor-pointer" 
                      title="Delete Banner"
                      data-reticle-target={`admin-delete-banner-btn-${b.id}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE STOREFRONT PREVIEW CANVAS */}
        <div className="w-full sticky top-6 space-y-3" data-reticle-target="admin-banners-preview-canvas">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                  LIVE REAL-TIME BANNER CAROUSEL PREVIEW
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
                  http://localhost:5173 (Promo Banner Slider)
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Interactive</span>
              </div>

              <div className="p-2 bg-slate-950">
                <PromoBannerSlider navigateTo={() => {}} sectionsConfig={sectionsConfig} banners={banners} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

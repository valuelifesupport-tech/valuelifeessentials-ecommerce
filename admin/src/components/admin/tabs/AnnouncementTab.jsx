import React from 'react';

export default function AnnouncementTab({
  settingsForm,
  setSettingsForm,
  handleSettingsSubmit
}) {
  return (
    <div className="space-y-6 w-full" data-reticle-target="admin-announcement-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">MARKETING & PROMOTIONAL BANNERS</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">Header Announcement Bar Studio</h3>
        <p className="text-xs text-slate-400">Configure top promotional sale announcement text, discount coupon badges, and live header preview.</p>
      </div>

      {/* EQUAL 50-50 SIDE-BY-SIDE SPLIT EDIT & LIVE PREVIEW CANVAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        {/* LEFT COLUMN: ANNOUNCEMENT BAR CONFIG FORM */}
        <div className="w-full bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <form onSubmit={handleSettingsSubmit} className="space-y-5 text-xs" data-reticle-target="admin-announcement-form">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5 text-xs">
                Top Announcement Bar Marketing Text *
              </label>
              <input 
                type="text"
                value={settingsForm.announcement_text || ''}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcement_text: e.target.value })}
                placeholder="e.g. Get 15% OFF + Free Home Delivery on Organic Fertilizers! Use Code: ORGANIC15"
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-xs"
                data-reticle-target="admin-announcement-text-input"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                This banner is sticky at the top of every storefront page to maximize marketing conversion.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Customer Support Phone (Header Bar)</label>
                <input 
                  type="text"
                  value={settingsForm.contact_phone || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  data-reticle-target="admin-contact-phone-input"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Customer Support Email (Header Bar)</label>
                <input 
                  type="text"
                  value={settingsForm.contact_email || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
                  data-reticle-target="admin-contact-email-input"
                />
              </div>
            </div>

            {/* SOCIAL MEDIA HANDLES CARD */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <span className="font-extrabold text-sm text-white block">Social Media Links & Handles</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Instagram URL</label>
                  <input 
                    type="text"
                    placeholder="https://instagram.com/valuelifeessentials"
                    value={settingsForm.instagram_url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, instagram_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                    data-reticle-target="admin-instagram-url-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Facebook Page URL</label>
                  <input 
                    type="text"
                    placeholder="https://facebook.com/valuelifeessentials"
                    value={settingsForm.facebook_url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, facebook_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                    data-reticle-target="admin-facebook-url-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">YouTube Channel URL</label>
                  <input 
                    type="text"
                    placeholder="https://youtube.com/@valuelifeessentials"
                    value={settingsForm.youtube_url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, youtube_url: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                    data-reticle-target="admin-youtube-url-input"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">WhatsApp Business Number</label>
                  <input 
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={settingsForm.whatsapp_number || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
                    data-reticle-target="admin-whatsapp-input"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.97] transition-transform text-white font-black py-3.5 rounded-xl shadow-lg uppercase text-xs tracking-wider cursor-pointer"
              data-reticle-target="admin-save-announcement-btn"
            >
              Save & Publish Announcement Bar Live
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REAL-TIME LIVE HEADER PREVIEW CANVAS */}
        <div className="w-full sticky top-6 space-y-3" data-reticle-target="admin-announcement-preview-canvas">
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black text-xs text-white uppercase tracking-wider font-['Outfit']">
                  LIVE REAL-TIME HEADER PREVIEW
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
                  {import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:5173'} (Header Bar Preview)
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Live Simulation</span>
              </div>

              <div className="p-3 bg-slate-950 space-y-3">
                <div className="bg-[#1b4332] text-white py-2 px-3 rounded-xl text-xs font-bold border border-emerald-800 flex justify-between items-center shadow">
                  <div className="flex items-center gap-2 truncate">
                    <span className="bg-[#52b788] text-[#1b4332] font-black text-[9px] px-2 py-0.5 rounded-full uppercase">SALE</span>
                    <span className="truncate">{settingsForm.announcement_text || 'Get 15% OFF! Use Code: ORGANIC15'}</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold shrink-0">🇮🇳 (₹)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { XCircle } from 'lucide-react';
import ImageUploader from '../../common/ImageUploader';

export default function BannerModal({
  showBannerModal,
  setShowBannerModal,
  bannerForm = {},
  setBannerForm,
  handleBannerSubmit
}) {
  if (!showBannerModal) return null;

  return (
    <div className="drawer-overlay flex items-center justify-center p-3 sm:p-4 z-50" data-reticle-target="admin-banner-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white">Create Hero Banner</h3>
          <button 
            type="button"
            onClick={() => setShowBannerModal(false)} 
            className="cursor-pointer text-slate-400 hover:text-white"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleBannerSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Banner Title *</label>
            <input 
              type="text" required
              value={bannerForm.title || ''}
              onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Subtitle *</label>
            <input 
              type="text" required
              value={bannerForm.subtitle || ''}
              onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <ImageUploader 
            label="Banner Image (Upload Local File or Paste URL Link) *"
            value={bannerForm.image_url || ''}
            onChange={(url) => setBannerForm({ ...bannerForm, image_url: url })}
            placeholder="Upload image file or paste web/Unsplash URL..."
          />

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer">
            Create Hero Banner
          </button>
        </form>
      </div>
    </div>
  );
}

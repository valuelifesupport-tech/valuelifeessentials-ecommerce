import React from 'react';
import { XCircle, Instagram, ExternalLink } from 'lucide-react';
import ImageUploader from '../../common/ImageUploader';

export default function InstagramModal({
  showInstagramModal,
  setShowInstagramModal,
  instagramForm = {},
  setInstagramForm,
  handleInstagramSubmit,
  editingInstagramPost = null
}) {
  if (!showInstagramModal) return null;

  return (
    <div className="drawer-overlay flex items-center justify-center p-3 sm:p-4 z-50" data-reticle-target="admin-instagram-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-pink-950/60 border border-pink-800/80 rounded-lg text-pink-400">
              <Instagram size={18} />
            </span>
            <div>
              <span className="text-[10px] font-black uppercase text-pink-400 tracking-wider">INSTAGRAM FEED</span>
              <h3 className="font-extrabold text-base text-white">
                {editingInstagramPost ? 'Edit Instagram Post' : 'Add Instagram Post'}
              </h3>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowInstagramModal(false)} 
            className="cursor-pointer text-slate-400 hover:text-white"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={(e) => handleInstagramSubmit(e, editingInstagramPost)} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Post Title / Caption *</label>
            <input 
              type="text" 
              required
              value={instagramForm.title || ''}
              onChange={(e) => setInstagramForm({ ...instagramForm, title: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Chia Smoothie Bowl or Wellness Tea"
            />
          </div>

          <ImageUploader 
            label="Instagram Post Photo (Upload File or Paste URL) *"
            value={instagramForm.image_url || ''}
            onChange={(url) => setInstagramForm({ ...instagramForm, image_url: url })}
            placeholder="Upload photo or paste URL..."
          />

          <div>
            <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Direct Instagram Post / Reel URL</span>
              <span className="text-[10px] font-normal text-slate-400">Opens when user clicks</span>
            </label>
            <div className="relative">
              <input 
                type="url"
                value={instagramForm.post_url || ''}
                onChange={(e) => setInstagramForm({ ...instagramForm, post_url: e.target.value })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-8"
                placeholder="https://www.instagram.com/p/..."
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <ExternalLink size={14} />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Leave blank to use default store Instagram profile link.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Display Sort Order</label>
              <input 
                type="number"
                min="1"
                value={instagramForm.sort_order ?? 1}
                onChange={(e) => setInstagramForm({ ...instagramForm, sort_order: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Active Status</label>
              <select 
                value={instagramForm.is_active ?? 1}
                onChange={(e) => setInstagramForm({ ...instagramForm, is_active: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>Active (Visible)</option>
                <option value={0}>Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-lg transition-all cursor-pointer mt-2"
          >
            {editingInstagramPost ? 'Save & Update Post' : 'Publish Instagram Post Live'}
          </button>
        </form>
      </div>
    </div>
  );
}

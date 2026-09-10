import React from 'react';
import { XCircle, LinkIcon, RefreshCw } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';
import { getApiUrl } from '../../../api/config';

export default function MediaPreviewModal({
  previewMediaItem,
  setPreviewMediaItem,
  mediaCacheBuster,
  setMediaCacheBuster,
  adminFetch,
  fetchAdminData,
  showToast
}) {
  if (!previewMediaItem) return null;

  const fullImageUrl = previewMediaItem.fullUrl || getApiUrl(previewMediaItem.url);

  return (
    <div className="drawer-overlay flex items-center justify-center p-2 sm:p-4 z-50" data-reticle-target="admin-media-preview-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ASSET DETAILS</span>
            <h3 className="font-extrabold text-base text-white truncate max-w-md">{previewMediaItem.filename}</h3>
          </div>
          <button 
            type="button"
            onClick={() => setPreviewMediaItem(null)} 
            className="text-slate-400 hover:text-white cursor-pointer shrink-0"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden max-h-80 flex items-center justify-center p-2">
          <img 
            src={`${resolveImgUrl(previewMediaItem.url)}${previewMediaItem.url && previewMediaItem.url.includes('?') ? '&' : '?'}cb=${mediaCacheBuster}`} 
            alt="Preview" 
            className="max-h-72 object-contain rounded-xl" 
          />
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 p-2.5 bg-slate-800/80 rounded-xl border border-slate-700 font-mono text-[11px]">
            <span className="text-slate-400 shrink-0">Full Image URL:</span>
            <span className="text-emerald-300 font-bold truncate max-w-full sm:max-w-md break-all">{fullImageUrl}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
          <button 
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(fullImageUrl);
              if (showToast) showToast('success', 'URL Copied!', 'Image URL copied to clipboard.');
            }}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LinkIcon size={14} /> Copy Full Image URL
          </button>

          <label className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors">
            <RefreshCw size={14} /> Replace Image File
            <input 
              type="file" 
              accept="image/*" 
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!window.confirm(`Replace image "${previewMediaItem.filename}" with new file "${file.name}"? The image URL will stay identical across all products.`)) return;
                
                const formData = new FormData();
                formData.append('image', file);
                formData.append('targetFilename', previewMediaItem.filename);

                try {
                  const res = await adminFetch('/api/media/replace', {
                    method: 'POST',
                    body: formData
                  });
                  const data = await res.json();
                  if (res.ok) {
                    if (setMediaCacheBuster) setMediaCacheBuster(Date.now());
                    setPreviewMediaItem(null);
                    if (fetchAdminData) await fetchAdminData();
                    if (showToast) showToast('success', 'Image Replaced', `Image ${previewMediaItem.filename} replaced successfully!`);
                  } else {
                    if (showToast) showToast('error', 'Replace Failed', data.error);
                  }
                } catch (err) {
                  if (showToast) showToast('error', 'Replace Error', err.message);
                }
              }} 
              className="hidden" 
            />
          </label>

          <button 
            type="button"
            onClick={() => setPreviewMediaItem(null)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-700 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

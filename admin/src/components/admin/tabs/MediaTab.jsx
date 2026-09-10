import React from 'react';
import { Upload, Search, Link as LinkIcon, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

export default function MediaTab({
  mediaFiles = [],
  mediaUploading,
  setMediaUploading,
  mediaSearch,
  setMediaSearch,
  mediaFilter,
  setMediaFilter,
  mediaCacheBuster,
  setMediaCacheBuster,
  setPreviewMediaItem,
  adminFetch,
  fetchAdminData,
  showToast
}) {
  const filteredMedia = mediaFiles.filter(item => {
    if (mediaFilter === 'UPLOADED' && item.source !== 'UPLOADED_FILE') return false;
    if (mediaSearch) {
      const term = mediaSearch.toLowerCase();
      return (item.filename || '').toLowerCase().includes(term) || (item.url || '').toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-media-tab">
      {/* TOP ACTION BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-extrabold text-white font-['Outfit'] flex items-center gap-2">
            <ImageIcon className="text-emerald-400" size={22} /> Centralized Media & Assets Manager
          </h3>
          <p className="text-xs text-slate-400">View all images across your store, upload multiple new assets, copy URLs, and manage files.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all w-full sm:w-auto" data-reticle-target="admin-upload-images-label">
            <Upload size={16} /> 
            <span>{mediaUploading ? 'Uploading Assets...' : '+ Upload New Images'}</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              disabled={mediaUploading}
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length === 0) return;
                setMediaUploading(true);
                try {
                  for (const file of files) {
                    const formData = new FormData();
                    formData.append('image', file);
                    await adminFetch('/api/upload', { method: 'POST', body: formData });
                  }
                  await fetchAdminData();
                  if (showToast) showToast('success', 'Media Uploaded', `${files.length} image(s) uploaded successfully!`);
                } catch (err) {
                  if (showToast) showToast('error', 'Upload Failed', err.message);
                } finally {
                  setMediaUploading(false);
                }
              }} 
              className="hidden" 
              data-reticle-target="admin-media-file-input"
            />
          </label>
        </div>
      </div>

      {/* CONTROLS: SEARCH & FILTER TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <input 
            type="text"
            placeholder="Search filename or image URL..."
            value={mediaSearch}
            onChange={(e) => setMediaSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
            data-reticle-target="admin-media-search-input"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-bold">
          <span className="text-slate-400 text-[11px]">Filter:</span>
          <button 
            onClick={() => setMediaFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${mediaFilter === 'ALL' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
            data-reticle-target="admin-media-filter-all"
          >
            All Assets ({mediaFiles.length})
          </button>
          <button 
            onClick={() => setMediaFilter('UPLOADED')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${mediaFilter === 'UPLOADED' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
            data-reticle-target="admin-media-filter-uploaded"
          >
            Uploaded Files ({mediaFiles.filter(m => m.source === 'UPLOADED_FILE').length})
          </button>
        </div>
      </div>

      {/* MEDIA GALLERY GRID */}
      {mediaFiles.length === 0 ? (
        <div className="p-12 text-center bg-slate-850 border border-slate-800 rounded-2xl space-y-3" data-reticle-target="admin-empty-media">
          <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ImageIcon size={32} />
          </div>
          <h4 className="font-extrabold text-base text-white">No Media Files Found</h4>
          <p className="text-xs text-slate-400">Click "+ Upload New Images" above to add image assets to your store library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" data-reticle-target="admin-media-grid">
          {filteredMedia.map(item => (
            <div key={item.id} className="relative group bg-slate-850 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-slate-700 transition-all" data-reticle-target={`admin-media-card-${item.id}`}>
              <div className="relative h-36 bg-slate-900 overflow-hidden flex items-center justify-center p-1 cursor-pointer" onClick={() => setPreviewMediaItem(item)}>
                <img 
                  src={`${resolveImgUrl(item.url)}${item.url && item.url.includes('?') ? '&' : '?'}cb=${mediaCacheBuster}`} 
                  alt={item.filename}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <span className="absolute top-2 left-2 bg-slate-950/80 text-emerald-400 border border-slate-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded shadow">
                  {item.source === 'UPLOADED_FILE' ? '📁 FILE' : '🔗 DB'}
                </span>
              </div>

              <div className="p-2.5 space-y-2 border-t border-slate-800 bg-slate-900/60">
                <p className="text-[11px] font-bold text-white truncate" title={item.filename}>{item.filename}</p>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.fullUrl || item.url);
                      if (showToast) showToast('success', 'URL Copied!', 'Image URL copied to clipboard.');
                    }}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 border border-slate-700 transition-colors cursor-pointer"
                    title="Copy URL"
                    data-reticle-target={`admin-copy-media-url-${item.id}`}
                  >
                    <LinkIcon size={11} /> Copy URL
                  </button>

                  {item.source === 'UPLOADED_FILE' && (
                    <>
                      <label 
                        className="bg-amber-950/80 hover:bg-amber-700 text-amber-300 hover:text-white p-1.5 rounded-lg border border-amber-800 transition-colors cursor-pointer flex items-center justify-center" 
                        title="Replace / Overwrite with New Image File"
                        data-reticle-target={`admin-replace-media-btn-${item.id}`}
                      >
                        <RefreshCw size={13} />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (!window.confirm(`Replace image "${item.filename}" with new file "${file.name}"? The image URL will stay identical across all products.`)) return;
                            
                            const formData = new FormData();
                            formData.append('image', file);
                            formData.append('targetFilename', item.filename);

                            try {
                              const res = await adminFetch('/api/media/replace', {
                                method: 'POST',
                                body: formData
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setMediaCacheBuster(Date.now());
                                await fetchAdminData();
                                if (showToast) showToast('success', 'Image Replaced', `Image ${item.filename} replaced successfully!`);
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
                        onClick={async () => {
                          if (window.confirm(`Delete image "${item.filename}" from server?`)) {
                            try {
                              const res = await adminFetch(`/api/media/${encodeURIComponent(item.filename)}`, { method: 'DELETE' });
                              if (res.ok) {
                                fetchAdminData();
                                if (showToast) showToast('info', 'Deleted', `File ${item.filename} deleted.`);
                              } else {
                                if (showToast) showToast('error', 'Delete Failed', `Could not delete file ${item.filename}`);
                              }
                            } catch (err) {
                              if (showToast) showToast('error', 'Delete Error', err.message || 'Network error deleting media file');
                            }
                          }
                        }}
                        className="bg-rose-950/80 hover:bg-rose-800 text-rose-300 p-1.5 rounded-lg border border-rose-800 transition-colors cursor-pointer"
                        title="Delete Image"
                        data-reticle-target={`admin-delete-media-btn-${item.id}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

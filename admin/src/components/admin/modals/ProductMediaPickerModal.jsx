import React from 'react';
import { XCircle, Search, CheckCircle } from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

export default function ProductMediaPickerModal({
  showProductMediaPickerModal,
  setShowProductMediaPickerModal,
  mediaSearch = '',
  setMediaSearch,
  mediaFiles = [],
  productForm = {},
  setProductForm,
  mediaCacheBuster
}) {
  if (!showProductMediaPickerModal) return null;

  return (
    <div className="drawer-overlay flex items-center justify-center p-2 sm:p-4 z-50" data-reticle-target="admin-product-media-picker-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PRODUCT MEDIA PICKER</span>
            <h3 className="font-extrabold text-base text-white">Select Images from Media Library</h3>
          </div>
          <button 
            type="button"
            onClick={() => setShowProductMediaPickerModal(false)} 
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search media by filename..."
            value={mediaSearch}
            onChange={(e) => setMediaSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono"
          />
          <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
        </div>

        {mediaFiles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-850 rounded-xl border border-slate-800">
            No media files uploaded yet. Upload a file above first.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3 max-h-[60vh] overflow-y-auto p-1 custom-scrollbar">
            {mediaFiles
              .filter(m => !mediaSearch || m.filename?.toLowerCase().includes(mediaSearch.toLowerCase()))
              .map((item, idx) => {
                const isSelected = (productForm.images || []).includes(item.url);
                return (
                  <div
                    key={item.id || idx}
                    onClick={() => {
                      if (isSelected) {
                        setProductForm({
                          ...productForm,
                          images: productForm.images.filter(img => img !== item.url)
                        });
                      } else {
                        setProductForm({
                          ...productForm,
                          images: [...(productForm.images || []), item.url]
                        });
                      }
                    }}
                    className={`relative group bg-slate-850 border rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 transition-all ${
                      isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/50' : 'border-slate-800'
                    }`}
                  >
                    <div className="h-28 bg-slate-900 overflow-hidden flex items-center justify-center p-1 relative">
                      <img
                        src={`${resolveImgUrl(item.url)}${item.url && item.url.includes('?') ? '&' : '?'}cb=${mediaCacheBuster}`}
                        alt={item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 bg-emerald-600 text-white rounded-full p-0.5 shadow">
                          <CheckCircle size={14} />
                        </span>
                      )}
                    </div>
                    <div className="p-1.5 bg-slate-900/80 border-t border-slate-800">
                      <p className="text-[10px] font-bold text-white truncate" title={item.filename}>{item.filename}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
          <span className="text-emerald-400 font-bold">
            {productForm.images?.length || 0} image(s) selected for this product
          </span>
          <button
            type="button"
            onClick={() => setShowProductMediaPickerModal(false)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow transition-colors cursor-pointer"
          >
            Done & Apply Images
          </button>
        </div>
      </div>
    </div>
  );
}

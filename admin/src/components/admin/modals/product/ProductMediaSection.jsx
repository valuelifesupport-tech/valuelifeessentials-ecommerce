import React from 'react';
import { UploadCloud, FolderOpen, GripVertical, Trash2 } from 'lucide-react';
import { resolveImgUrl, DEFAULT_FALLBACK_SVG } from '../../../../utils/resolveImgUrl';

export default function ProductMediaSection({
  productForm,
  setProductForm,
  isDraggingOverArea,
  handleDragOverArea,
  handleDragLeaveArea,
  handleDropFilesOnArea,
  handleProductMediaFileUpload,
  imageUrlInput,
  setImageUrlInput,
  handleAddImage,
  fetchAdminData,
  setShowProductMediaPickerModal,
  draggedImageIndex,
  setDraggedImageIndex,
  dragOverImageIndex,
  setDragOverImageIndex,
  handleThumbnailDragStart,
  handleThumbnailDragOver,
  handleThumbnailDrop,
  handleRemoveImage,
  showToast
}) {
  return (
    <div 
      onDragOver={handleDragOverArea}
      onDragLeave={handleDragLeaveArea}
      onDrop={handleDropFilesOnArea}
      className={`bg-slate-850 p-4 rounded-2xl border transition-all duration-200 space-y-4 relative ${
        isDraggingOverArea 
          ? 'border-emerald-500 bg-emerald-950/30 ring-4 ring-emerald-500/20 shadow-2xl scale-[1.01]' 
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {isDraggingOverArea && (
        <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm z-50 rounded-2xl border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center space-y-2 animate-pulse pointer-events-none">
          <UploadCloud size={48} className="text-emerald-400 animate-bounce" />
          <p className="text-emerald-200 font-extrabold text-base">Drop Image Files Here to Upload Instantly!</p>
          <p className="text-emerald-400/80 text-xs font-semibold">Multiple images supported (.png, .jpg, .webp, .jpeg)</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <label className="block font-bold text-slate-200">Media & Product Images *</label>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
            <UploadCloud size={11} /> Drag & Drop Supported
          </span>
        </div>
        <span className="text-slate-400 text-[11px] font-bold">({productForm.images?.length || 0} Images attached)</span>
      </div>

      <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-900/60 hover:bg-slate-900 rounded-xl p-3 text-center transition-all cursor-pointer group">
        <label className="cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-slate-400 group-hover:text-slate-200">
          <UploadCloud size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          <span><strong>Drag & Drop</strong> product image files directly into this box, or</span>
          <span className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 rounded-md font-bold text-[11px] border border-emerald-500/50 transition-colors inline-block">
            Browse Files
          </span>
          <input type="file" accept="image/*" multiple onChange={handleProductMediaFileUpload} className="hidden" />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="text" 
          placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
          value={imageUrlInput}
          onChange={(e) => setImageUrlInput(e.target.value)}
          className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
        />
        <button 
          type="button"
          onClick={handleAddImage}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
        >
          + Add URL
        </button>
        <button
          type="button"
          onClick={() => {
            fetchAdminData();
            setShowProductMediaPickerModal(true);
          }}
          className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-3 py-2 rounded-lg font-bold text-xs border border-slate-700 flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
        >
          <FolderOpen size={14} /> Select from Media Library
        </button>
      </div>

      {productForm.images && productForm.images.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 flex items-center justify-between">
            <span>💡 Tip: Drag & drop thumbnails to reorder photos (Card #1 is Primary)</span>
            <span className="text-emerald-400 text-[9px]">↕️ Hold & Drag</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {productForm.images?.map((imgUrl, idx) => (
              <div 
                key={idx} 
                draggable={true}
                onDragStart={(e) => handleThumbnailDragStart(e, idx)}
                onDragOver={(e) => handleThumbnailDragOver(e, idx)}
                onDrop={(e) => handleThumbnailDrop(e, idx)}
                onDragEnd={() => { setDraggedImageIndex(null); setDragOverImageIndex(null); }}
                className={`relative group rounded-xl overflow-hidden border bg-slate-900 h-28 shadow-sm cursor-grab active:cursor-grabbing transition-all ${
                  draggedImageIndex === idx 
                    ? 'opacity-40 border-dashed border-emerald-500 scale-95' 
                    : dragOverImageIndex === idx 
                    ? 'border-2 border-emerald-400 ring-2 ring-emerald-500/40 scale-105 z-10' 
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <img 
                  src={resolveImgUrl(imgUrl)} 
                  alt={`Product Image ${idx + 1}`}
                  className="w-full h-full object-cover select-none pointer-events-none" 
                  onError={(e) => { e.target.src = DEFAULT_FALLBACK_SVG; }}
                />

                <div className="absolute top-1.5 left-1.5 bg-slate-950/80 text-slate-300 p-1 rounded-md border border-slate-700 opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                  <GripVertical size={12} className="text-emerald-400" />
                </div>

                {idx === 0 ? (
                  <span className="absolute bottom-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-0.5">
                    PRIMARY ⭐
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const reordered = [imgUrl, ...productForm.images.filter((_, i) => i !== idx)];
                      setProductForm({ ...productForm, images: reordered });
                      if (showToast) showToast('info', 'Primary Image Set', `Image #${idx + 1} set as main product cover.`);
                    }}
                    className="absolute bottom-1.5 left-1.5 bg-slate-950/90 hover:bg-emerald-700 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    Make Primary
                  </button>
                )}

                <button 
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 bg-rose-950/90 text-rose-200 p-1.5 rounded-lg hover:bg-rose-700 transition-colors shadow border border-rose-800"
                  title="Remove Image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

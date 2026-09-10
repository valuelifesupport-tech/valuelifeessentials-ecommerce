import React from 'react';
import { 
  CheckCircle, 
  UploadCloud, 
  FolderOpen, 
  GripVertical, 
  Trash2, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

export default function ProductModal({
  showProductModal,
  setShowProductModal,
  editingProduct,
  handleProductSubmit,
  isDuplicateSku,
  productForm = {},
  setProductForm,
  isDraggingOverArea,
  handleDropFilesOnArea,
  handleDragOverArea,
  handleDragLeaveArea,
  handleProductMediaFileUpload,
  setShowProductMediaPickerModal,
  imageUrlInput = '',
  setImageUrlInput,
  handleAddImage,
  draggedImageIndex,
  setDraggedImageIndex,
  dragOverImageIndex,
  setDragOverImageIndex,
  handleThumbnailDragStart,
  handleThumbnailDragOver,
  handleThumbnailDrop,
  handleRemoveImage,
  newVariantForm = {},
  setNewVariantForm,
  categories = [],
  isCatDropdownOpen,
  setIsCatDropdownOpen,
  setShowCategoryModal,
  isSubcatDropdownOpen,
  setIsSubcatDropdownOpen,
  tagInput = '',
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  collections = [],
  handleToggleCollection,
  setShowCollectionModal,
  showSeoFields,
  setShowSeoFields,
  products = [],
  fetchAdminData,
  adminFetch,
  showToast
}) {
  if (!showProductModal) return null;

  const selectedCategoryObj = categories.find(c => c.id === Number(productForm.category_id));

  return (
        <div data-reticle-target="admin-product-modal" className="drawer-overlay flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl max-w-[98vw] w-full p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
            {/* TOP HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PRODUCT CREATOR & MANAGER</span>
                <h3 className="font-extrabold text-xl sm:text-2xl text-white font-['Outfit'] truncate max-w-full">{editingProduct ? `Edit ${editingProduct.title}` : 'Add New Product'}</h3>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
                <button 
                  onClick={() => setShowProductModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleProductSubmit}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-6 py-2 rounded-xl text-xs font-extrabold shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={15} /> Save Product
                </button>
              </div>
            </div>

            <form onSubmit={handleProductSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-xs">
              {/* LEFT COLUMN (2 COLS WIDE) */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. TITLE & SKU ID CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-200 mb-1">Title *</label>
                      <input 
                        type="text" required placeholder="e.g. Short sleeve t-shirt or Organic Vermicompost 5Kg"
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block font-bold text-emerald-400">SKU ID *</label>
                        <button
                          type="button"
                          onClick={() => {
                            const titleWords = (productForm.title || 'PROD').trim().split(/\s+/).slice(0, 2).map(w => w.substring(0, 4).toUpperCase()).join('-');
                            const cleanPrefix = titleWords ? `VLE-${titleWords}` : 'VLE-PROD';
                            let num = 1;
                            let candidate = `${cleanPrefix}-00${num}`;
                            const existingSkus = new Set(products.filter(p => p.id !== productForm.id).flatMap(p => [p.sku?.toUpperCase(), ...(p.variants?.map(v => v.sku?.toUpperCase()) || [])]));
                            while (existingSkus.has(candidate.toUpperCase())) {
                              num++;
                              candidate = `${cleanPrefix}-${num < 10 ? '00' : num < 100 ? '0' : ''}${num}`;
                            }
                            setProductForm({ ...productForm, sku: candidate });
                            if (showToast) showToast('info', 'Unique SKU Generated', `Assigned unique SKU: ${candidate}`);
                          }}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 underline font-bold cursor-pointer"
                          title="Generate Auto Unique SKU ID"
                        >
                          ⚡ Auto-Generate
                        </button>
                      </div>
                      <input 
                        type="text" required placeholder="e.g. VLE-FERT-001"
                        value={productForm.sku}
                        onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                        className={`w-full p-2.5 bg-slate-800 border rounded-lg text-white font-mono font-bold uppercase transition-colors ${
                          isDuplicateSku ? 'border-rose-500 bg-rose-950/20 text-rose-300 ring-2 ring-rose-500/50' : 'border-slate-700'
                        }`}
                      />
                      {isDuplicateSku && (
                        <span className="text-[11px] text-rose-400 font-extrabold block mt-1 animate-pulse">
                          ⚠️ SKU ID "{productForm.sku}" is already assigned to another product!
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1">Description *</label>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                      <div className="bg-slate-900 border-b border-slate-700 p-2 flex flex-wrap items-center gap-2 text-slate-300 text-xs font-bold">
                        <button type="button" className="p-1 hover:bg-slate-800 rounded font-serif">B</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded italic">I</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded underline">U</button>
                        <span className="text-slate-600">|</span>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">Paragraph ▾</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">List •</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">Link 🔗</button>
                        <button type="button" className="p-1 hover:bg-slate-800 rounded">Image 🖼️</button>
                      </div>
                      <textarea 
                        rows={4} required placeholder="Write detailed product description, benefits, instructions..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full p-3 bg-slate-800 border-0 text-white focus:outline-none text-xs"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* 2. MEDIA & IMAGE UPLOADER CARD (Drag & Drop + URL + Media Library) */}
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
                  {/* ACTIVE DRAG OVER OVERLAY */}
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

                  {/* VISUAL DRAG & DROP UPLOAD DROPZONE */}
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

                  {/* URL INPUT & MEDIA LIBRARY BUTTONS */}
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

                  {/* REORDERABLE THUMBNAILS GRID */}
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
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80'; }}
                            />

                            {/* DRAG HANDLE BADGE */}
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

                {/* 3. CATEGORY & SUBCATEGORY CARD (CUSTOM REACT DROPDOWN FOR GUARANTEED 100% VISIBILITY) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-slate-200">Category & Subcategory *</label>
                    <button 
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                    >
                      + Create Category
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* CUSTOM MAIN CATEGORY DROPDOWN */}
                    <div className="relative">
                      <label className="block text-slate-300 font-bold text-xs mb-1">
                        Main Category <span className="text-rose-400 font-extrabold">* (Required)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCatDropdownOpen(!isCatDropdownOpen);
                          setIsSubcatDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 bg-slate-800 hover:bg-slate-750 border rounded-lg text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer ${
                          !productForm.category_id 
                            ? 'border-rose-500/70 ring-1 ring-rose-500/30' 
                            : 'border-slate-700'
                        }`}
                      >
                        <span className="truncate flex items-center gap-1.5">
                          {selectedCategoryObj ? (
                            <>
                              <span>{selectedCategoryObj.icon || '🌿'}</span>
                              <span className="text-white font-extrabold">{selectedCategoryObj.name}</span>
                            </>
                          ) : (
                            <span className="text-slate-400 font-normal">-- Select Main Category --</span>
                          )}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isCatDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                      </button>

                      {isCatDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/80 py-1">
                          {categories.length === 0 ? (
                            <div className="p-3 text-center text-slate-400 text-xs font-semibold">
                              No categories found.
                            </div>
                          ) : (
                            categories.map(c => {
                              const isSelected = String(c.id) === String(productForm.category_id);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setProductForm({ ...productForm, category_id: Number(c.id), subcategory_id: '' });
                                    setIsCatDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected ? 'bg-emerald-950/80 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="text-base">{c.icon || '🌿'}</span>
                                    <span className="font-extrabold">{c.name}</span>
                                  </span>
                                  {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>

                    {/* CUSTOM SUBCATEGORY DROPDOWN */}
                    <div className="relative">
                      <label className="block text-slate-400 text-xs mb-1">Subcategory (Optional)</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubcatDropdownOpen(!isSubcatDropdownOpen);
                          setIsCatDropdownOpen(false);
                        }}
                        className="w-full p-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-white font-bold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer"
                      >
                        <span className="truncate">
                          {selectedCategoryObj?.subcategories?.find(sc => String(sc.id) === String(productForm.subcategory_id))?.name || (
                            <span className="text-slate-400 font-normal">-- Choose Subcategory --</span>
                          )}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform shrink-0 ${isSubcatDropdownOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                      </button>

                      {isSubcatDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800/80 py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm({ ...productForm, subcategory_id: '' });
                              setIsSubcatDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-xs font-bold text-slate-400 hover:bg-slate-800 cursor-pointer"
                          >
                            -- None (No Subcategory) --
                          </button>
                          {selectedCategoryObj?.subcategories?.map(sc => {
                            const isSelected = String(sc.id) === String(productForm.subcategory_id);
                            return (
                              <button
                                key={sc.id}
                                type="button"
                                onClick={() => {
                                  setProductForm({ ...productForm, subcategory_id: Number(sc.id) });
                                  setIsSubcatDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected ? 'bg-emerald-950/80 text-emerald-400 border-l-4 border-emerald-500' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                                }`}
                              >
                                <span className="font-extrabold">{sc.name}</span>
                                {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. PRICING CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Pricing & Profit Margins</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-emerald-400 font-bold mb-1 text-xs">Price INR (₹) *</label>
                      <input 
                        type="number" min="0" required placeholder="₹ 0.00"
                        value={productForm.price_inr ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                          setProductForm(prev => ({ 
                            ...prev, 
                            price_inr: val, 
                            discount_inr: val,
                            price_usd: autoUsd,
                            discount_usd: autoUsd
                          }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-400 font-bold mb-1 text-xs">Price USD ($) *</label>
                      <input 
                        type="number" min="0" required placeholder="$ 0.00" step="0.01"
                        value={productForm.price_usd ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setProductForm(prev => ({ 
                            ...prev, 
                            price_usd: val, 
                            discount_usd: val 
                          }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-blue-400 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1 text-xs">Compare-at Price INR (₹)</label>
                      <input 
                        type="number" min="0" placeholder="₹ Original / MRP (INR)"
                        value={productForm.compare_price_inr ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                          setProductForm(prev => ({ 
                            ...prev, 
                            compare_price_inr: val,
                            compare_price_usd: autoUsd
                          }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-300 font-medium mb-1 text-xs">Compare-at Price USD ($)</label>
                      <input 
                        type="number" min="0" placeholder="$ Original / MRP (USD)" step="0.01"
                        value={productForm.compare_price_usd ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setProductForm(prev => ({ ...prev, compare_price_usd: val }));
                        }}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-blue-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-400 mb-1 text-xs">Cost per item INR (₹)</label>
                      <input 
                        type="number" min="0" placeholder="₹ Supplier Cost (INR)"
                        value={productForm.cost_per_item_inr ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                          setProductForm(prev => ({ 
                            ...prev, 
                            cost_per_item_inr: val,
                            cost_per_item_usd: autoUsd
                          }));
                        }}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-blue-400/80 mb-1 text-xs">Cost per item USD ($)</label>
                      <input 
                        type="number" min="0" placeholder="$ Supplier Cost (USD)" step="0.01"
                        value={productForm.cost_per_item_usd ?? ''}
                        onWheel={(e) => e.target.blur()}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                          setProductForm(prev => ({ ...prev, cost_per_item_usd: val }));
                        }}
                        className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-300 text-xs"
                      />
                    </div>
                  </div>

                  {/* PRODUCT SPECIFIC GST TAX RATE OVERRIDE */}
                  <div className="pt-3 border-t border-slate-800">
                    <label className="block text-amber-400 font-bold mb-1 flex items-center gap-1.5 text-xs">
                      <span>🏷️ Product Specific GST Tax Rate (%)</span>
                    </label>
                    <select
                      value={productForm.gst_percent ?? ''}
                      onChange={(e) => setProductForm({ ...productForm, gst_percent: e.target.value === '' ? '' : Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer focus:border-amber-500 text-xs"
                    >
                      <option value="">⚙️ Default (Inherit Store / Collection Tax Rate)</option>
                      <option value="0">0% GST (Tax Exempt / Nil Rated)</option>
                      <option value="5">5% GST (Organic Fertilizers & Seeds)</option>
                      <option value="12">12% GST (Bio-Pesticides & Processed Goods)</option>
                      <option value="18">18% GST (Garden Tools & Equipment)</option>
                      <option value="28">28% GST (Luxury Goods)</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      💡 Setting a custom GST rate here overrides the default store & collection tax rates for this specific product.
                    </p>
                  </div>
                </div>

                {/* 5. PRODUCT VARIANTS & STOCK BREAKDOWN CARD */}
                <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Product Variants & Stock Breakdown</h3>
                      <p className="text-xs text-slate-400">Add variant options like different pack sizes (e.g. 250g, 500g, 1Kg) with title, image, price & compare price in INR & USD.</p>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                      {productForm.variants?.length || 0} VARIANTS
                    </span>
                  </div>

                  {/* VARIANTS LIST TABLE */}
                  {productForm.variants && productForm.variants.length > 0 && (
                    <div className="overflow-x-auto border border-slate-800 rounded-xl custom-scrollbar">
                      <table className="w-full text-xs text-left text-slate-300 min-w-[680px]">
                        <thead className="bg-slate-900 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                          <tr>
                            <th className="p-2.5">Image</th>
                            <th className="p-2.5">Variant Title</th>
                            <th className="p-2.5 text-emerald-400">Price (₹)</th>
                            <th className="p-2.5 text-blue-400">Price ($)</th>
                            <th className="p-2.5 text-slate-400">Compare (₹)</th>
                            <th className="p-2.5 text-blue-300">Compare ($)</th>
                            <th className="p-2.5">Stock</th>
                            <th className="p-2.5 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-850">
                          {productForm.variants.map((v, vIdx) => (
                            <tr key={v.id || vIdx} className="hover:bg-slate-800/50">
                              <td className="p-2.5">
                                <div className="flex items-center gap-1.5">
                                  {v.image_url ? (
                                    <img src={resolveImgUrl(typeof v.image_url === 'object' ? v.image_url.image_url : v.image_url)} alt="Variant" className="w-8 h-8 object-cover rounded-lg border border-slate-700 bg-slate-900" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-900 flex items-center justify-center text-[9px] text-slate-500 font-bold">No Img</div>
                                  )}
                                  <label className="cursor-pointer text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                                    Upload
                                    <input 
                                      type="file" accept="image/*" className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        try {
                                          const res = await adminFetch('/api/upload', { method: 'POST', body: formData });
                                          const data = await res.json();
                                          if (data.imageUrl) {
                                            const updated = [...productForm.variants];
                                            updated[vIdx] = { ...updated[vIdx], image_url: data.imageUrl };
                                            setProductForm({ ...productForm, variants: updated });
                                          }
                                        } catch (err) {}
                                      }}
                                    />
                                  </label>
                                </div>
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="text" value={v.variant_name || v.name || ''} 
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    updated[vIdx] = { ...updated[vIdx], variant_name: e.target.value };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-full min-w-[100px] p-1.5 bg-slate-800 border border-slate-700 rounded text-white font-bold"
                                  placeholder="e.g. 500g Pack"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" value={v.price_inr !== undefined ? v.price_inr : (v.price || '')} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    const autoUsd = (pVal !== '' && pVal > 0) ? Number((pVal / 95).toFixed(2)) : '';
                                    updated[vIdx] = { ...updated[vIdx], price_inr: pVal, price: pVal, discount_inr: pVal, price_usd: autoUsd, discount_usd: autoUsd };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-emerald-400 font-bold"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" step="0.01" value={v.price_usd !== undefined ? v.price_usd : ''} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    updated[vIdx] = { ...updated[vIdx], price_usd: pVal, discount_usd: pVal };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-blue-400 font-bold"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" value={v.compare_price_inr !== undefined ? v.compare_price_inr : ''} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    const autoUsd = (pVal !== '' && pVal > 0) ? Number((pVal / 95).toFixed(2)) : '';
                                    updated[vIdx] = { ...updated[vIdx], compare_price_inr: pVal, compare_price_usd: autoUsd };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-slate-300"
                                  placeholder="₹ MRP"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" step="0.01" value={v.compare_price_usd !== undefined ? v.compare_price_usd : ''} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const pVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    updated[vIdx] = { ...updated[vIdx], compare_price_usd: pVal };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-18 p-1.5 bg-slate-800 border border-slate-700 rounded text-blue-300"
                                  placeholder="$ MRP"
                                />
                              </td>
                              <td className="p-2.5">
                                <input 
                                  type="number" min="0" value={v.stock !== undefined ? v.stock : 50} 
                                  onWheel={(e) => e.target.blur()}
                                  onChange={(e) => {
                                    const updated = [...productForm.variants];
                                    const sVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                                    updated[vIdx] = { ...updated[vIdx], stock: sVal };
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded text-white font-bold"
                                />
                              </td>
                              <td className="p-2.5 text-center">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const updated = productForm.variants.filter((_, idx) => idx !== vIdx);
                                    setProductForm({ ...productForm, variants: updated });
                                  }}
                                  className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40"
                                >
                                  🗑️
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ADD NEW VARIANT CREATION INPUTS */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
                    <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-wider block">+ Add New Variant Pill:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Variant Title *</label>
                        <input 
                          type="text" placeholder="e.g. 500g, 1Kg, Pack of 5"
                          value={newVariantForm.variant_name || ''}
                          onChange={(e) => setNewVariantForm({ ...newVariantForm, variant_name: e.target.value })}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-semibold focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-emerald-400 mb-0.5 font-bold">Price INR (₹)</label>
                        <input 
                          type="number" min="0" placeholder="₹ Price"
                          value={newVariantForm.price_inr || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                            setNewVariantForm(prev => ({ ...prev, price_inr: val, price_usd: autoUsd }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-blue-400 mb-0.5 font-bold">Price USD ($)</label>
                        <input 
                          type="number" min="0" step="0.01" placeholder="$ Price"
                          value={newVariantForm.price_usd || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            setNewVariantForm(prev => ({ ...prev, price_usd: val }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-400 font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Compare INR (₹)</label>
                        <input 
                          type="number" min="0" placeholder="₹ MRP"
                          value={newVariantForm.compare_price_inr || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            const autoUsd = (val !== '' && val > 0) ? Number((val / 95).toFixed(2)) : '';
                            setNewVariantForm(prev => ({ ...prev, compare_price_inr: val, compare_price_usd: autoUsd }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-blue-300 mb-0.5 font-bold">Compare USD ($)</label>
                        <input 
                          type="number" min="0" step="0.01" placeholder="$ MRP"
                          value={newVariantForm.compare_price_usd || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const val = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            setNewVariantForm(prev => ({ ...prev, compare_price_usd: val }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-32">
                        <label className="block text-[10px] text-slate-400 mb-0.5 font-bold">Stock Qty</label>
                        <input 
                          type="number" min="0" placeholder="100"
                          value={newVariantForm.stock || ''}
                          onWheel={(e) => e.target.blur()}
                          onChange={(e) => {
                            const sVal = e.target.value === '' ? '' : Math.max(0, Number(e.target.value));
                            setNewVariantForm(prev => ({ ...prev, stock: sVal }));
                          }}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
                        />
                      </div>
                      <div className="flex-1 pt-4">
                        <button 
                          type="button"
                          onClick={() => {
                            if (!newVariantForm.variant_name || !newVariantForm.variant_name.trim()) {
                              if (showToast) showToast('warning', 'Variant Title Required', 'Please enter a Variant Title (e.g. 500g, 1Kg, Pack of 5)');
                              return;
                            }
                            const vPrice = Number(newVariantForm.price_inr || productForm.price_inr || 0);
                            const vPriceUsd = newVariantForm.price_usd !== '' && Number(newVariantForm.price_usd) > 0 ? Number(newVariantForm.price_usd) : Number((vPrice / 95).toFixed(2));
                            const vCompInr = Number(newVariantForm.compare_price_inr || 0);
                            const vCompUsd = newVariantForm.compare_price_usd !== '' && Number(newVariantForm.compare_price_usd) > 0 ? Number(newVariantForm.compare_price_usd) : (vCompInr > 0 ? Number((vCompInr / 95).toFixed(2)) : 0);
                            const vStock = Number(newVariantForm.stock || 100);
                            const newV = {
                              id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                              variant_name: newVariantForm.variant_name.trim(),
                              price_inr: vPrice,
                              price: vPrice,
                              discount_inr: vPrice,
                              price_usd: vPriceUsd,
                              discount_usd: vPriceUsd,
                              compare_price_inr: vCompInr || null,
                              compare_price_usd: vCompUsd || null,
                              stock: vStock,
                              sku: `OB-VAR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                              image_url: productForm.images && productForm.images.length > 0 ? (typeof productForm.images[0] === 'object' ? productForm.images[0].image_url : productForm.images[0]) : null
                            };
                            setProductForm(prev => ({ ...prev, variants: [...(prev.variants || []), newV] }));
                            setNewVariantForm({ variant_name: '', price_inr: '', price_usd: '', compare_price_inr: '', compare_price_usd: '', stock: '100' });
                            if (showToast) showToast('success', 'Variant Pill Added', `Variant "${newV.variant_name}" added to list!`);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-2.5 text-xs rounded-xl transition-all shadow-md shadow-emerald-950/40 cursor-pointer uppercase tracking-wider"
                        >
                          Save & Create Variant Pill ➕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. GOOGLE SEO & URL HANDLE CARD */}
                <div className="bg-slate-850 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-extrabold text-white text-sm">Search Engine Listing Preview (Google SEO)</h3>
                      <p className="text-xs text-slate-400">Preview of how this product will appear in Google search results.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowSeoFields(!showSeoFields)}
                      className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Edit website SEO {showSeoFields ? '▲' : '▼'}
                    </button>
                  </div>

                  {/* PREVIEW BOX */}
                  <div className="p-3 bg-white rounded-xl space-y-1 font-sans shadow-sm">
                    <div className="text-[11px] text-gray-500 truncate">
                      VALUELIFE ESSENTIALS › https://valuelifeessentials.com › products/{productForm.url_handle || (productForm.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    </div>
                    <div className="text-sm font-bold text-blue-800 truncate hover:underline cursor-pointer">
                      {pageTitle}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2 leading-normal">
                      {metaDesc}
                    </div>
                    <div className="text-xs font-bold text-gray-900 pt-1">
                      ₹{productForm.price_inr || productForm.discount_inr || 0}.00 INR
                    </div>
                  </div>

                  {/* SEO INPUT FIELDS (EXPANDS ONLY ON CLICKING EDIT WEBSITE SEO) */}
                  {showSeoFields && (
                    <div className="space-y-3 pt-2 border-t border-slate-800 animate-fadeIn">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-300">Page title</label>
                          <span className="text-[10px] text-slate-400">{pageTitle.length} of 70 characters used</span>
                        </div>
                        <input 
                          type="text"
                          value={productForm.seo_title || ''}
                          onChange={(e) => setProductForm({ ...productForm, seo_title: e.target.value })}
                          placeholder={productForm.title || ''}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-300">Meta description</label>
                          <span className="text-[10px] text-slate-400">{metaDesc.length} of 160 characters used</span>
                        </div>
                        <textarea 
                          rows={2}
                          value={productForm.seo_description || ''}
                          onChange={(e) => setProductForm({ ...productForm, seo_description: e.target.value })}
                          placeholder={productForm.description || ''}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                        ></textarea>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">URL handle</label>
                        <input 
                          type="text"
                          value={productForm.url_handle || ''}
                          onChange={(e) => setProductForm({ ...productForm, url_handle: e.target.value })}
                          placeholder={`products/${(productForm.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                          className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN (1 COL WIDE) */}
              <div className="space-y-5">
                {/* 1. STATUS CARD */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
                  <label className="block font-bold text-slate-200">Status *</label>
                  <select 
                    value={productForm.status}
                    onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                {/* 2. PRODUCT ORGANIZATION CARD (With Collections & Tags Pill Buttons) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                  <span className="font-extrabold text-sm text-white block">Product Organization</span>

                  <div>
                    <label className="block text-slate-400 mb-1">Type</label>
                    <input 
                      type="text" placeholder="e.g. Garden Supplies"
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Vendor / Brand</label>
                    <input 
                      type="text" placeholder="e.g. VALUELIFE ESSENTIALS"
                      value={productForm.vendor}
                      onChange={(e) => setProductForm({ ...productForm, vendor: e.target.value })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  {/* COLLECTIONS PILL TAGS */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <label className="font-bold text-slate-300">Collections</label>
                        <button 
                          type="button" 
                          onClick={() => setShowCollectionModal(true)}
                          className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 underline"
                        >
                          + Create Collection
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">({productForm.collection_ids?.length || 0} Selected)</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-slate-800 p-2.5 rounded-lg border border-slate-700 min-h-12 items-center">
                      {collections.length === 0 ? (
                        <div className="w-full flex items-center justify-between py-1 px-1">
                          <span className="text-xs text-slate-400">No custom collections created yet.</span>
                          <button
                            type="button"
                            onClick={() => setShowCollectionModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            + Create Collection
                          </button>
                        </div>
                      ) : (
                        collections.map(col => {
                          const isSelected = (productForm.collection_ids || []).map(id => Number(id)).includes(Number(col.id));
                          return (
                            <button 
                              key={col.id}
                              type="button"
                              onClick={() => handleToggleCollection(col.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected 
                                  ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400' 
                                  : 'bg-slate-900 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{col.name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* TAGS PILL MANAGER */}
                  <div className="space-y-2 pt-1 border-t border-slate-800">
                    <label className="font-bold text-slate-300 block">Tags</label>

                    <div className="flex gap-1.5">
                      <input 
                        type="text" 
                        placeholder="Add new tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                        className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      />
                      <button 
                        type="button"
                        onClick={handleAddTag}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg font-bold text-xs"
                      >
                        + Add Tag
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-slate-800 p-2.5 rounded-lg border border-slate-700 min-h-12">
                      {(() => {
                        const tagsArr = Array.isArray(productForm.tags)
                          ? productForm.tags
                          : typeof productForm.tags === 'string'
                            ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean)
                            : [];
                        return tagsArr.map((t, idx) => (
                          <span key={idx} className="bg-slate-900 text-emerald-400 border border-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                            #{t}
                            <button type="button" onClick={() => handleRemoveTag(t)} className="text-rose-400 hover:text-rose-300 ml-1">
                              ×
                            </button>
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>

                {/* 4. SUGGESTED PRODUCTS & CROSS-SELL SETTINGS (Matching User Screenshot 1) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">
                      ⚡ Suggested Products & Collections Settings
                    </label>
                    <span className="text-[9px] text-slate-400 font-mono">Recommendation Engine</span>
                  </div>

                  {/* RECOMMENDATION MODE TABS */}
                  <div className="flex p-1 bg-slate-800 rounded-lg border border-slate-700 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, related_mode: 'PRODUCTS' })}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        (productForm.related_mode || 'PRODUCTS') === 'PRODUCTS'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Specific Products
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductForm({ ...productForm, related_mode: 'COLLECTIONS' })}
                      className={`flex-1 py-1.5 rounded-md transition-all ${
                        productForm.related_mode === 'COLLECTIONS'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Dynamic Collections
                    </button>
                  </div>

                  {/* MODE 1: SPECIFIC RELATED PRODUCTS */}
                  {(productForm.related_mode || 'PRODUCTS') === 'PRODUCTS' ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setBrowseTargetType('products'); setBrowseTargetField('frequently_bought'); setShowBrowseModal(true); }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          + Browse & Select Products
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {products
                          .filter(p => (productForm.frequently_bought_ids || '').split(',').map(n => Number(n.trim())).includes(p.id))
                          .map(p => (
                            <div key={p.id} className="p-2 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                              <span className="font-bold text-white line-clamp-1">{p.title}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentIds = (productForm.frequently_bought_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                                  const newIds = currentIds.filter(id => id !== p.id.toString()).join(',');
                                  setProductForm({ ...productForm, frequently_bought_ids: newIds });
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold text-sm ml-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    /* MODE 2: DYNAMIC COLLECTIONS */
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setBrowseTargetType('collections'); setBrowseTargetField('related_collections'); setShowBrowseModal(true); }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold border border-slate-700 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          + Browse & Select Collections
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {collections
                          .filter(c => (productForm.related_collection_ids || '').split(',').map(n => Number(n.trim())).includes(c.id))
                          .map(c => (
                            <div key={c.id} className="p-2 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
                              <span className="font-bold text-white line-clamp-1">🏷️ {c.name}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentIds = (productForm.related_collection_ids || '').split(',').map(n => n.trim()).filter(Boolean);
                                  const newIds = currentIds.filter(id => id !== c.id.toString()).join(',');
                                  setProductForm({ ...productForm, related_collection_ids: newIds });
                                }}
                                className="text-rose-400 hover:text-rose-300 font-bold text-sm ml-2"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        💡 Storefront will dynamically pick random items from selected collections to display on PDP.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
  );
}

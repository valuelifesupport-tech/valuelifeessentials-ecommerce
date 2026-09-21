import React from 'react';
import { CheckCircle } from 'lucide-react';
import ProductMediaSection from './product/ProductMediaSection';
import ProductCategorySelector from './product/ProductCategorySelector';
import ProductPricingSection from './product/ProductPricingSection';
import ProductVariantsSection from './product/ProductVariantsSection';
import ProductSeoSection from './product/ProductSeoSection';
import ProductOrganization from './product/ProductOrganization';

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
  setShowCategoryModal,
  tagInput = '',
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  collections = [],
  handleToggleCollection,
  setShowCollectionModal,
  products = [],
  fetchAdminData,
  adminFetch,
  showToast,
  setShowBrowseModal = () => {},
  setBrowseTargetType = () => {},
  setBrowseTargetField = () => {}
}) {
  if (!showProductModal) return null;

  return (
    <div data-reticle-target="admin-product-modal" className="drawer-overlay flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl max-w-[98vw] w-full p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-2xl max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PRODUCT CREATOR & MANAGER</span>
            <h3 className="font-extrabold text-xl sm:text-2xl text-white font-['Outfit'] truncate max-w-full">
              {editingProduct ? `Edit ${editingProduct.title}` : 'Add New Product'}
            </h3>
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

            {/* 2. MEDIA & IMAGE UPLOADER CARD */}
            <ProductMediaSection
              productForm={productForm}
              setProductForm={setProductForm}
              isDraggingOverArea={isDraggingOverArea}
              handleDragOverArea={handleDragOverArea}
              handleDragLeaveArea={handleDragLeaveArea}
              handleDropFilesOnArea={handleDropFilesOnArea}
              handleProductMediaFileUpload={handleProductMediaFileUpload}
              imageUrlInput={imageUrlInput}
              setImageUrlInput={setImageUrlInput}
              handleAddImage={handleAddImage}
              fetchAdminData={fetchAdminData}
              setShowProductMediaPickerModal={setShowProductMediaPickerModal}
              draggedImageIndex={draggedImageIndex}
              setDraggedImageIndex={setDraggedImageIndex}
              dragOverImageIndex={dragOverImageIndex}
              setDragOverImageIndex={setDragOverImageIndex}
              handleThumbnailDragStart={handleThumbnailDragStart}
              handleThumbnailDragOver={handleThumbnailDragOver}
              handleThumbnailDrop={handleThumbnailDrop}
              handleRemoveImage={handleRemoveImage}
              showToast={showToast}
            />

            {/* 3. CATEGORY & SUBCATEGORY CARD */}
            <ProductCategorySelector
              categories={categories}
              productForm={productForm}
              setProductForm={setProductForm}
              setShowCategoryModal={setShowCategoryModal}
            />

            {/* 4. PRICING CARD */}
            <ProductPricingSection
              productForm={productForm}
              setProductForm={setProductForm}
            />

            {/* 5. PRODUCT VARIANTS & STOCK BREAKDOWN CARD */}
            <ProductVariantsSection
              productForm={productForm}
              setProductForm={setProductForm}
              newVariantForm={newVariantForm}
              setNewVariantForm={setNewVariantForm}
              adminFetch={adminFetch}
              showToast={showToast}
            />

            {/* 6. GOOGLE SEO & URL HANDLE CARD */}
            <ProductSeoSection
              productForm={productForm}
              setProductForm={setProductForm}
            />
          </div>

          {/* RIGHT COLUMN (1 COL WIDE) */}
          <div className="space-y-5">
            {/* PRODUCT ORGANIZATION */}
            <ProductOrganization
              productForm={productForm}
              setProductForm={setProductForm}
              collections={collections}
              products={products}
              tagInput={tagInput}
              setTagInput={setTagInput}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
              handleToggleCollection={handleToggleCollection}
              setShowCollectionModal={setShowCollectionModal}
              setShowBrowseModal={setShowBrowseModal}
              setBrowseTargetType={setBrowseTargetType}
              setBrowseTargetField={setBrowseTargetField}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

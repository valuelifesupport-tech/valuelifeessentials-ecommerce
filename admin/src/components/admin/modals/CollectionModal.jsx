import React from 'react';
import { XCircle } from 'lucide-react';
import ImageUploader from '../../common/ImageUploader';

export default function CollectionModal({
  showCollectionModal,
  setShowCollectionModal,
  editingCollection,
  collectionForm = {},
  setCollectionForm,
  handleCollectionSubmit,
  categories = [],
  products = []
}) {
  if (!showCollectionModal) return null;

  return (
    <div className="drawer-overlay flex items-center justify-center p-2 sm:p-4 z-50" data-reticle-target="admin-collection-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 shadow-2xl max-h-[94vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base sm:text-lg text-white truncate max-w-[80%]">
            {editingCollection ? 'Edit Collection & Map Products' : 'Create New Collection'}
          </h3>
          <button 
            type="button"
            onClick={() => setShowCollectionModal(false)} 
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleCollectionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Collection Title *</label>
            <input 
              type="text" required placeholder="e.g. Monsoon Gardening Special Sale"
              value={collectionForm.name || ''}
              onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Description *</label>
            <input 
              type="text" required placeholder="Special collection for rainy season garden boosters"
              value={collectionForm.description || ''}
              onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
          </div>

          <ImageUploader 
            label="Collection Banner Image (Upload Local File or Paste URL Link) *"
            value={collectionForm.image_url || ''}
            onChange={(url) => setCollectionForm({ ...collectionForm, image_url: url })}
            placeholder="Upload image file or paste web/Unsplash URL..."
          />

          <div>
            <label className="block font-bold text-slate-300 mb-1">Map to Parent Category (Optional)</label>
            <select 
              value={collectionForm.category_id || ''}
              onChange={(e) => setCollectionForm({ ...collectionForm, category_id: e.target.value ? Number(e.target.value) : '' })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
            >
              <option value="">-- All Categories --</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* TOP NAVBAR FEATURED TOGGLE */}
          <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/60 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-emerald-300 text-xs block">Featured Top Navbar Navigation Link</span>
              <p className="text-[11px] text-slate-400">Show this collection directly as a featured link on the top website navbar (next to Offers / Best Sellers).</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={collectionForm.show_in_navbar === 1 || collectionForm.show_in_navbar === true || String(collectionForm.show_in_navbar) === '1'}
                onChange={(e) => setCollectionForm({ ...collectionForm, show_in_navbar: e.target.checked ? 1 : 0 })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="space-y-2 bg-slate-850 p-3 rounded-xl border border-slate-800">
            <span className="font-extrabold text-emerald-400 block">Attach Products to Collection (Multi-Select Checkboxes):</span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {products.map(p => {
                const isSelected = collectionForm.product_ids?.includes(p.id);
                return (
                  <label key={p.id} className="flex items-center gap-2 hover:bg-slate-800 p-1.5 rounded cursor-pointer text-xs">
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newIds = e.target.checked 
                          ? [...(collectionForm.product_ids || []), p.id]
                          : (collectionForm.product_ids || []).filter(id => id !== p.id);
                        setCollectionForm({ ...collectionForm, product_ids: newIds });
                      }}
                      className="w-4 h-4 accent-emerald-500"
                    />
                    <span className="font-bold text-white">{p.title}</span>
                    <span className="text-slate-400 text-[11px]">(₹{p.discount_inr || p.price_inr})</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg cursor-pointer">
            Save & Update Collection Mapping
          </button>
        </form>
      </div>
    </div>
  );
}

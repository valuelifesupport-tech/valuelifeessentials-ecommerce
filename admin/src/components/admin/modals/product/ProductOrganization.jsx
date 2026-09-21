import React from 'react';

export default function ProductOrganization({
  productForm,
  setProductForm,
  collections = [],
  products = [],
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  handleToggleCollection,
  setShowCollectionModal,
  setShowBrowseModal,
  setBrowseTargetType,
  setBrowseTargetField
}) {
  return (
    <div className="space-y-5">
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

      <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider block">
            ⚡ Suggested Products & Collections Settings
          </label>
          <span className="text-[9px] text-slate-400 font-mono">Recommendation Engine</span>
        </div>

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
  );
}

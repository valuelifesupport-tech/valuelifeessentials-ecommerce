import React from 'react';
import { Grid } from 'lucide-react';

export default function MobileNavMenu({
  isOpen,
  onClose,
  onGoHome,
  onSelectAllProducts,
  collections = [],
  categories = [],
  onSelectCollection,
  onSelectCategory,
  navigateTo
}) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-3 font-bold text-xs" data-reticle-target="header-mobile-drawer">
      <button 
        onClick={() => { onGoHome(); onClose(); }}
        className="w-full text-left py-2 text-emerald-900 border-b cursor-pointer"
        data-reticle-target="mobile-nav-home"
      >
        🏠 Home Page
      </button>

      <button 
        onClick={() => { onSelectAllProducts(); onClose(); }}
        className="w-full text-left py-2 text-emerald-900 border-b flex items-center gap-2 font-black cursor-pointer"
        data-reticle-target="mobile-nav-all-products"
      >
        <Grid size={16} /> All Products Catalog
      </button>

      {collections && collections.length > 0 && (
        <div className="space-y-2 py-2 border-b">
          <span className="text-[10px] font-black uppercase text-emerald-700">📦 Collections ({collections.length})</span>
          <div className="pl-2 space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
            {collections.map(col => (
              <button 
                key={col.id}
                onClick={() => {
                  onClose();
                  if (onSelectCollection) onSelectCollection(col.id);
                  else if (navigateTo) navigateTo(`/collection/${col.slug || col.id}`, { view: 'collection', slug: col.slug, collection: col.id });
                }}
                className="w-full text-left py-1 text-gray-800 font-bold flex items-center justify-between text-xs hover:text-emerald-600 cursor-pointer"
              >
                <span>📦 {col.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                  {col.product_count !== undefined ? col.product_count : (col.product_ids ? col.product_ids.length : 0)} items
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2 py-2">
        <span className="text-[10px] font-black uppercase text-gray-400">Categories</span>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {categories.map(cat => (
            <div key={cat.id} className="pl-2 space-y-1">
              <button 
                onClick={() => { onSelectCategory(cat.slug); onClose(); }}
                className="w-full text-left py-1 text-gray-800 font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <span>{cat.icon || '🌱'}</span> <span>{cat.name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

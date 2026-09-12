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
  navigateTo,
  onOpenPage
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
        <span className="text-[10px] font-black uppercase text-gray-400">Categories & Departments</span>
        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
          {categories.map(cat => (
            <div key={cat.id} className="bg-stone-50 rounded-xl p-2.5 border border-stone-200/70">
              <button 
                onClick={() => { onSelectCategory(cat.slug); onClose(); }}
                className="w-full text-left py-1 text-gray-900 font-extrabold flex items-center justify-between text-xs cursor-pointer hover:text-emerald-700"
              >
                <div className="flex items-center gap-2">
                  <span>{cat.icon || '🌿'}</span>
                  <span>{cat.name}</span>
                </div>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded-full">
                    {cat.subcategories.length}
                  </span>
                )}
              </button>
              {cat.subcategories && cat.subcategories.length > 0 && (
                <div className="mt-2 pl-3 border-l-2 border-emerald-300 space-y-1">
                  {cat.subcategories.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        onClose();
                      }}
                      className="block w-full text-left text-[11px] text-gray-600 hover:text-emerald-700 py-0.5 truncate cursor-pointer"
                    >
                      • {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 space-y-1 text-xs">
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenPage) onOpenPage('about-us');
            else if (navigateTo) navigateTo('/pages/about-us', { view: 'page', slug: 'about-us' });
          }}
          className="block w-full text-left py-1.5 text-gray-700 hover:text-emerald-700 cursor-pointer font-bold"
        >
          ℹ️ About Us
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenPage) onOpenPage('blog');
            else if (navigateTo) navigateTo('/blog', { view: 'blog', slug: null });
          }}
          className="block w-full text-left py-1.5 text-gray-700 hover:text-emerald-700 cursor-pointer font-bold"
        >
          📝 Blog & Articles
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            if (onOpenPage) onOpenPage('contact-us');
            else if (navigateTo) navigateTo('/pages/contact-us', { view: 'page', slug: 'contact-us' });
          }}
          className="block w-full text-left py-1.5 text-gray-700 hover:text-emerald-700 cursor-pointer font-bold"
        >
          📞 Contact Us
        </button>
      </div>
    </div>
  );
}

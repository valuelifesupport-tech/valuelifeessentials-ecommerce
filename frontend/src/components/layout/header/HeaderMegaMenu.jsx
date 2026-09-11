import React, { useRef, useEffect } from 'react';
import { ArrowRight, Sparkles, X, ChevronRight, ShieldCheck, Truck, Leaf, Tag } from 'lucide-react';

// Intelligent botanical & department icon mapper
const getCategoryIcon = (name = '', slug = '', defaultIcon = '') => {
  if (defaultIcon && defaultIcon.trim()) return defaultIcon;
  const lower = `${name} ${slug}`.toLowerCase();
  if (lower.includes('herb') || lower.includes('tea')) return '🌿';
  if (lower.includes('cereal') || lower.includes('grain') || lower.includes('rice') || lower.includes('millet')) return '🌾';
  if (lower.includes('spice') || lower.includes('seasoning') || lower.includes('masala')) return '🌶️';
  if (lower.includes('additive') || lower.includes('salt') || lower.includes('sugar') || lower.includes('sweetener')) return '🧂';
  if (lower.includes('seed')) return '🌱';
  if (lower.includes('dry fruit') || lower.includes('nut')) return '🌰';
  if (lower.includes('oil') || lower.includes('ghee')) return '🫒';
  if (lower.includes('honey')) return '🍯';
  if (lower.includes('superfood')) return '🥗';
  if (lower.includes('grocery')) return '🛒';
  if (lower.includes('home') || lower.includes('care') || lower.includes('laundry')) return '✨';
  return '🍃';
};

export default function HeaderMegaMenu({
  isOpen,
  onClose,
  categories = [],
  onSelectCategory,
  onSelectAllProducts,
  navigateTo,
  onMouseEnter,
  onMouseLeave
}) {
  const menuRef = useRef(null);

  // Total subcategories count
  const totalSubcategories = categories.reduce((acc, cat) => {
    return acc + (cat.subcategories ? cat.subcategories.length : 0);
  }, 0);

  // Handle outside clicks
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCategoryClick = (cat) => {
    onClose();
    if (onSelectCategory) {
      onSelectCategory(cat.slug || cat.id);
    } else if (navigateTo) {
      navigateTo(`/category/${cat.slug || cat.id}`, { view: 'catalog', category: cat.slug || cat.id, subcategory: null });
    }
  };

  const handleSubcategoryClick = (cat, sub, e) => {
    e.stopPropagation();
    onClose();
    if (onSelectCategory) {
      onSelectCategory(cat.slug || cat.id);
    } else if (navigateTo) {
      navigateTo(`/category/${cat.slug || cat.id}`, { view: 'catalog', category: cat.slug || cat.id, subcategory: sub.slug || sub.name });
    }
  };

  const handleViewAllProducts = () => {
    onClose();
    if (onSelectAllProducts) {
      onSelectAllProducts();
    } else if (navigateTo) {
      navigateTo('/products', { view: 'all_products' });
    }
  };

  const handleViewOffers = () => {
    onClose();
    if (navigateTo) {
      navigateTo('/offers', { view: 'offers' });
    }
  };

  return (
    <div
      ref={menuRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 right-0 top-full mt-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      data-reticle-target="header-mega-menu"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(16,75,56,0.22)] border border-emerald-900/15 overflow-hidden backdrop-blur-xl">
          
          {/* 1. TOP HEADER BAR */}
          <div className="bg-gradient-to-r from-[#164e3f] via-[#1d5c4b] to-[#164e3f] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛍️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Shop ValueLife Departments
                  </h3>
                  <span className="bg-emerald-800/80 text-emerald-200 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                    {categories.length} Categories • {totalSubcategories} Subcategories
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100/80 hidden sm:block">
                  Pure, 100% natural and certified organic botanical wellness essentials
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleViewOffers}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                data-reticle-target="mega-menu-offers-btn"
              >
                <Tag size={12} />
                <span>Flat 20% Off</span>
              </button>

              <button
                type="button"
                onClick={handleViewAllProducts}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all border border-white/20 cursor-pointer"
                data-reticle-target="mega-menu-view-all-btn"
              >
                <span>View All Products</span>
                <ArrowRight size={13} />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close menu"
                data-reticle-target="mega-menu-close-btn"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 2. RICH CATEGORY & SUBCATEGORY GRID */}
          <div className="p-6 sm:p-7 max-h-[62vh] overflow-y-auto custom-scrollbar bg-[#fcfaf7]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const subcategories = cat.subcategories || [];
                const icon = getCategoryIcon(cat.name, cat.slug, cat.icon);

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="bg-white rounded-2xl p-4 border border-stone-200/80 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                    data-reticle-target={`mega-menu-category-${cat.slug || cat.id}`}
                  >
                    <div>
                      {/* Category Header */}
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-9 h-9 rounded-xl bg-[#f4efe8] group-hover:bg-emerald-50 text-emerald-900 flex items-center justify-center text-lg shrink-0 transition-colors shadow-xs">
                            {icon}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#164e3f] transition-colors leading-tight truncate">
                              {cat.name}
                            </h4>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {subcategories.length > 0 ? `${subcategories.length} Sub-items` : 'Explore department'}
                            </span>
                          </div>
                        </div>

                        <span className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-emerald-100 text-stone-600 group-hover:text-emerald-800 flex items-center justify-center transition-colors shrink-0">
                          <ChevronRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>

                      {/* Subcategories List */}
                      {subcategories.length > 0 ? (
                        <ul className="mt-3 space-y-1.5">
                          {subcategories.map((sub) => (
                            <li key={sub.id}>
                              <button
                                type="button"
                                onClick={(e) => handleSubcategoryClick(cat, sub, e)}
                                className="w-full text-left text-xs text-gray-600 hover:text-[#164e3f] hover:font-bold hover:translate-x-1 transition-all flex items-center gap-2 py-1 px-1.5 rounded-lg hover:bg-emerald-50/60 cursor-pointer"
                                data-reticle-target={`mega-menu-sub-${sub.id}`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600/70 shrink-0" />
                                <span className="truncate">{sub.name}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="mt-3 text-xs text-gray-500 italic py-2">
                          Browse all wholesome natural items in this department →
                        </div>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="mt-4 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800">
                      <span>Explore {cat.name}</span>
                      <ArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. BOTTOM TRUST & HIGHLIGHTS FOOTER */}
          <div className="bg-white px-6 py-3.5 border-t border-stone-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-6 text-gray-600 font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-900">
                <Leaf size={14} className="text-emerald-600" />
                <span>100% Certified Organic Origins</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-900">
                <Truck size={14} className="text-emerald-600" />
                <span>Free Express Shipping Above ₹499</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-900">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Lab-Tested Purity & Easy Returns</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleViewAllProducts}
                className="font-bold text-[#164e3f] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Complete Store Catalog</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

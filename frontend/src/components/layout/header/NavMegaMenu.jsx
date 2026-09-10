import React, { useState, useRef, useEffect } from 'react';
import { Grid, ChevronDown } from 'lucide-react';

export default function NavMegaMenu({
  categories = [],
  collections = [],
  onGoHome,
  onSelectCategory,
  onSelectCollection,
  onSelectAllProducts,
  onSelectOffers,
  onSelectBestSellers,
  onSelectNewArrivals,
  navigateTo,
  onOpenPage
}) {
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [collectionsDropdown, setCollectionsDropdown] = useState(false);
  const megaMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dropdownColls = collections ? collections.filter(c => !(c.show_in_navbar === 1 || c.show_in_navbar === true || String(c.show_in_navbar) === '1')) : [];
  const activeNavColls = collections ? collections.filter(c => c.show_in_navbar === 1 || c.show_in_navbar === true || String(c.show_in_navbar) === '1') : [];

  const handleCollectionRoute = (col) => {
    const lowerSlug = String(col.slug || '').toLowerCase();
    const lowerName = String(col.name || '').toLowerCase();
    if (lowerSlug === 'offers' || lowerName.includes('offer')) {
      if (onSelectOffers) onSelectOffers();
      else if (navigateTo) navigateTo('/offers', { view: 'offers', slug: null, category: null, collection: null });
    } else if (lowerSlug === 'bestsellers' || lowerName.includes('best seller')) {
      if (onSelectBestSellers) onSelectBestSellers();
      else if (navigateTo) navigateTo('/bestsellers', { view: 'bestsellers', slug: null, category: null, collection: null });
    } else if (lowerSlug === 'new-arrivals' || lowerName.includes('new arrival')) {
      if (onSelectNewArrivals) onSelectNewArrivals();
      else if (navigateTo) navigateTo('/new-arrivals', { view: 'new_arrivals', slug: null, category: null, collection: null });
    } else {
      if (onSelectCollection) onSelectCollection(col.id);
      else if (navigateTo) navigateTo(`/collection/${col.slug || col.id}`, { view: 'collection', slug: col.slug, collection: col.id });
    }
  };

  return (
    <nav className="bg-gradient-to-r from-emerald-950 via-[#1b4332] to-emerald-950 text-white border-t border-emerald-800/60 hidden md:block shadow-md relative" data-reticle-target="nav-mega-menu-bar">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6 py-2.5 text-xs font-bold">
        <div className="flex items-center gap-6">
          {/* 1. HOME LINK */}
          <button 
            onClick={onGoHome}
            className="hover:text-emerald-300 text-white font-extrabold transition-colors flex items-center gap-1.5 text-sm cursor-pointer"
            data-reticle-target="nav-home-btn"
          >
            <span>Home</span>
          </button>

          {/* 2. SHOP MEGA MENU BUTTON */}
          <div 
            ref={megaMenuRef}
            className="relative py-1"
            onMouseEnter={() => setActiveCategoryDropdown('MEGA_MENU')}
            onMouseLeave={() => {
              if (!isMegaMenuOpen) setActiveCategoryDropdown(null);
            }}
          >
            <button 
              type="button"
              onClick={() => setIsMegaMenuOpen(prev => !prev)}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-md transition-all text-xs cursor-pointer"
              data-reticle-target="nav-catalog-btn"
            >
              <Grid size={15} />
              <span>Shop Catalog</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${(isMegaMenuOpen || activeCategoryDropdown === 'MEGA_MENU') ? 'rotate-180' : ''}`} />
            </button>

            {/* 4-COLUMN RICH MEGA MENU DROPDOWN */}
            {(isMegaMenuOpen || activeCategoryDropdown === 'MEGA_MENU') && (
              <div className="absolute left-0 mt-2 w-[880px] bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-6 z-[100] animate-fade-in backdrop-blur-xl">
                <div className="flex justify-between items-center pb-3 mb-3 border-b border-slate-800">
                  <span className="font-extrabold text-sm text-white flex items-center gap-2">
                    <span>🛍️ Shop Organic Grocery & Wellness Catalog</span>
                    <span className="bg-emerald-900/80 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-700 font-mono">
                      {categories.length} Categories
                    </span>
                  </span>
                  <button 
                    onClick={() => {
                      onSelectAllProducts();
                      setIsMegaMenuOpen(false);
                      setActiveCategoryDropdown(null);
                    }} 
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    data-reticle-target="nav-mega-view-all-btn"
                  >
                    View All Products →
                  </button>
                </div>

                <div className="max-h-[68vh] overflow-y-auto pr-2 pt-2 pb-4 custom-scrollbar">
                  <div className="grid grid-cols-4 gap-4">
                    {categories.map(cat => (
                      <div key={cat.id} className="space-y-2 bg-slate-850/80 p-3 rounded-xl border border-slate-800 hover:border-emerald-500/60 transition-all hover:bg-slate-800 shadow-sm">
                        <button 
                          onClick={() => { 
                            onSelectCategory(cat.slug); 
                            setIsMegaMenuOpen(false);
                            setActiveCategoryDropdown(null); 
                          }}
                          className="font-extrabold text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors group text-left w-full cursor-pointer"
                        >
                          <span className="text-base shrink-0">{cat.icon || '🌿'}</span>
                          <span className="group-hover:underline leading-tight">{cat.name}</span>
                        </button>

                        {cat.subcategories && cat.subcategories.length > 0 && (
                          <div className="pl-4 space-y-1 border-l-2 border-emerald-900/80 ml-1">
                            {cat.subcategories.map(sub => (
                              <button 
                                key={sub.id}
                                onClick={() => { 
                                  onSelectCategory(cat.slug); 
                                  setIsMegaMenuOpen(false);
                                  setActiveCategoryDropdown(null); 
                                }}
                                className="block text-[11px] text-slate-300 hover:text-white transition-colors text-left truncate w-full font-medium cursor-pointer"
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
              </div>
            )}
          </div>

          {/* COLLECTIONS DROPDOWN */}
          {dropdownColls.length > 0 && (
            <div className="relative py-1">
              <button 
                type="button"
                onClick={() => setCollectionsDropdown(prev => !prev)}
                className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs"
                data-reticle-target="nav-collections-btn"
              >
                <span>📦 Collections</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${collectionsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {collectionsDropdown && (
                <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-3 z-[100] animate-fade-in">
                  <div className="text-[11px] font-black uppercase text-emerald-400 px-2 py-1 border-b border-slate-800 mb-2">
                    Collections ({dropdownColls.length})
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {dropdownColls.map(col => (
                      <button
                        key={col.id}
                        onClick={() => {
                          setCollectionsDropdown(false);
                          handleCollectionRoute(col);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-emerald-950/80 hover:text-emerald-300 font-bold transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{col.name}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          {col.product_count !== undefined ? col.product_count : (col.product_ids ? col.product_ids.length : 0)} items
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC TOP NAVBAR COLLECTIONS */}
          {activeNavColls.length > 0 ? (
            activeNavColls.map(navCol => (
              <button 
                key={navCol.id}
                type="button"
                onClick={() => handleCollectionRoute(navCol)}
                className="hover:text-emerald-300 text-slate-100 font-extrabold transition-colors flex items-center gap-1 cursor-pointer text-xs"
              >
                <span>{navCol.name}</span>
              </button>
            ))
          ) : (
            <>
              <button type="button" onClick={() => onSelectOffers ? onSelectOffers() : navigateTo('/offers', { view: 'offers' })} className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs">
                <span>🔥 Offers</span>
              </button>
              <button type="button" onClick={() => onSelectBestSellers ? onSelectBestSellers() : navigateTo('/bestsellers', { view: 'bestsellers' })} className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs">
                <span>⭐ Best Sellers</span>
              </button>
              <button type="button" onClick={() => onSelectNewArrivals ? onSelectNewArrivals() : navigateTo('/new-arrivals', { view: 'new_arrivals' })} className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs">
                <span>✨ New Arrivals</span>
              </button>
            </>
          )}

          {/* ABOUT US */}
          <button 
            onClick={() => onOpenPage ? onOpenPage('about-us') : alert("ValueLife Essentials is India's premier certified 100% organic grocery and wellness store.")}
            className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors cursor-pointer"
            data-reticle-target="nav-about-us-btn"
          >
            <span>About Us</span>
          </button>

          {/* CONTACT */}
          <button 
            onClick={() => onOpenPage ? onOpenPage('contact-us') : alert("Contact ValueLife Essentials Support:\n📧 support@valuelifeessentials.com\n🌐 valuelifeessentials.com")}
            className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors cursor-pointer"
            data-reticle-target="nav-contact-btn"
          >
            <span>Contact</span>
          </button>
        </div>

        {/* ADVANTAGES BADGE */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-extrabold text-emerald-300 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-700/60">
          <span>✓ 100% Certified Organic</span>
          <span>•</span>
          <span>✓ Fast Home Delivery</span>
        </div>
      </div>
    </nav>
  );
}

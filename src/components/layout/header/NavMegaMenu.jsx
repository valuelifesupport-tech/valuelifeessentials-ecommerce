import React, { useState, useRef, useEffect } from 'react';
import { Grid, ChevronDown } from 'lucide-react';

// Intelligent botanical & department icon mapper for dynamic categories
const getCategoryIcon = (cat) => {
  if (cat?.icon && cat.icon.trim()) return cat.icon;
  const lower = `${cat?.name || ''} ${cat?.slug || ''}`.toLowerCase();
  if (lower.includes('herb') || lower.includes('tea')) return '🌿';
  if (lower.includes('cereal') || lower.includes('grain') || lower.includes('rice') || lower.includes('millet')) return '🌾';
  if (lower.includes('spice') || lower.includes('seasoning') || lower.includes('masala')) return '🌶️';
  if (lower.includes('additive') || lower.includes('salt') || lower.includes('sugar') || lower.includes('sweetener')) return '🍯';
  if (lower.includes('seed')) return '🌱';
  if (lower.includes('flour') || lower.includes('starch')) return '🥣';
  if (lower.includes('pulse') || lower.includes('lentil') || lower.includes('legume')) return '🫘';
  if (lower.includes('skin') || lower.includes('beauty') || lower.includes('treatment')) return '🌸';
  if (lower.includes('hair')) return '💇‍♀️';
  if (lower.includes('food') || lower.includes('nutrition')) return '🥗';
  if (lower.includes('grocery')) return '🛒';
  if (lower.includes('home') || lower.includes('care') || lower.includes('essential')) return '✨';
  return '🌿';
};

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
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveCategoryDropdown('MEGA_MENU');
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategoryDropdown(null);
    }, 250);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
        setActiveCategoryDropdown(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setActiveCategoryDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const dropdownColls = collections ? collections.filter(c => !(c.show_in_navbar === 1 || c.show_in_navbar === true || String(c.show_in_navbar) === '1')) : [];
  const activeNavColls = collections ? collections.filter(c => c.show_in_navbar === 1 || c.show_in_navbar === true || String(c.show_in_navbar) === '1') : [];

  // Avoid duplicating standard Offers, Best Sellers, and New Arrivals
  const standardSlugs = ['offer', 'bestseller', 'best-seller', 'newarrival', 'new-arrival'];
  const customNavColls = activeNavColls.filter(col => {
    const slug = (col.slug || '').toLowerCase().replace(/[^a-z]/g, '');
    const name = (col.name || '').toLowerCase().replace(/[^a-z]/g, '');
    return !standardSlugs.some(s => slug.includes(s) || name.includes(s));
  });

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

  const isMenuVisible = isMegaMenuOpen || activeCategoryDropdown === 'MEGA_MENU';

  return (
    <nav className="bg-gradient-to-r from-emerald-950 via-[#1b4332] to-emerald-950 text-white border-t border-emerald-800/60 hidden md:block shadow-md relative z-40" data-reticle-target="nav-mega-menu-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6 py-2 text-xs font-bold">
        <div className="flex items-center gap-5 sm:gap-6">
          {/* 1. SHOP CATALOG MEGA MENU BUTTON */}
          <div 
            ref={megaMenuRef}
            className="relative py-0.5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button 
              type="button"
              onClick={() => setIsMegaMenuOpen(prev => !prev)}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-sm transition-all text-xs cursor-pointer"
              data-reticle-target="nav-catalog-btn"
            >
              <Grid size={15} />
              <span>Shop Catalog</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isMenuVisible ? 'rotate-180' : ''}`} />
            </button>

            {/* 4-COLUMN RICH MEGA MENU DROPDOWN (MATCHING USER REFERENCE) */}
            {isMenuVisible && (
              <div 
                className="absolute left-0 mt-2 w-[920px] lg:w-[980px] max-w-[96vw] bg-[#0b1329] border border-slate-800 text-slate-100 rounded-2xl shadow-2xl p-6 z-[100] animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                data-reticle-target="nav-mega-menu-panel"
              >
                {/* Header inside Mega Menu */}
                <div className="flex justify-between items-center pb-3.5 mb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🛍️</span>
                    <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                      Shop Organic Grocery & Wellness Catalog
                    </h3>
                    <span className="bg-emerald-950 text-emerald-400 text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-700/80 font-mono font-bold">
                      {categories.length} Categories
                    </span>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      if (onSelectAllProducts) onSelectAllProducts();
                      else if (navigateTo) navigateTo('/products', { view: 'all_products' });
                      setIsMegaMenuOpen(false);
                      setActiveCategoryDropdown(null);
                    }} 
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    data-reticle-target="nav-mega-view-all-btn"
                  >
                    View All Products →
                  </button>
                </div>

                {/* 4-Column Category Cards Grid */}
                <div className="max-h-[68vh] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat, idx) => (
                      <div 
                        key={cat.id || idx} 
                        className="space-y-2.5 bg-[#131d38] p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/70 transition-all duration-200 hover:bg-[#182344] shadow-sm group"
                      >
                        {/* Category Title Button */}
                        <button 
                          type="button"
                          onClick={() => { 
                            if (onSelectCategory) onSelectCategory(cat.slug || cat.id); 
                            else if (navigateTo) navigateTo(`/category/${cat.slug || cat.id}`, { view: 'catalog', category: cat.slug || cat.id });
                            setIsMegaMenuOpen(false);
                            setActiveCategoryDropdown(null); 
                          }}
                          className="font-extrabold text-xs sm:text-[13px] text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors group-hover:underline text-left w-full cursor-pointer leading-snug"
                        >
                          <span className="text-base shrink-0">{getCategoryIcon(cat)}</span>
                          <span className="leading-tight">{cat.name}</span>
                        </button>

                        {/* Subcategories Bullet List */}
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          <div className="space-y-1.5 mt-2">
                            {cat.subcategories.map(sub => (
                              <button 
                                key={sub.id}
                                type="button"
                                onClick={() => { 
                                  if (onSelectCategory) onSelectCategory(cat.slug || cat.id); 
                                  else if (navigateTo) navigateTo(`/category/${cat.slug || cat.id}`, { view: 'catalog', category: cat.slug || cat.id });
                                  setIsMegaMenuOpen(false);
                                  setActiveCategoryDropdown(null); 
                                }}
                                className="text-xs text-slate-300 hover:text-white hover:font-bold transition-all text-left truncate w-full font-medium cursor-pointer flex items-center gap-1.5 py-0.5"
                              >
                                <span className="text-slate-400 font-bold">•</span>
                                <span className="truncate">{sub.name}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic pt-1">
                            Explore department →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. OFFERS LINK */}
          <button 
            type="button" 
            onClick={() => onSelectOffers ? onSelectOffers() : navigateTo('/offers', { view: 'offers' })} 
            className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs"
          >
            <span>🔥 Offers</span>
          </button>

          {/* 3. BEST SELLERS LINK */}
          <button 
            type="button" 
            onClick={() => onSelectBestSellers ? onSelectBestSellers() : navigateTo('/bestsellers', { view: 'bestsellers' })} 
            className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs"
          >
            <span>⭐ Best Sellers</span>
          </button>

          {/* 4. NEW ARRIVALS LINK */}
          <button 
            type="button" 
            onClick={() => onSelectNewArrivals ? onSelectNewArrivals() : navigateTo('/new-arrivals', { view: 'new_arrivals' })} 
            className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs"
          >
            <span>✨ New Arrivals</span>
          </button>

          {/* 5. COLLECTIONS DROPDOWN (IF ANY) */}
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
                        type="button"
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

          {/* 6. DYNAMIC NAVBAR COLLECTIONS */}
          {customNavColls.map(navCol => (
            <button 
              key={navCol.id}
              type="button"
              onClick={() => handleCollectionRoute(navCol)}
              className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs"
            >
              <span>{navCol.name}</span>
            </button>
          ))}

          {/* 7. ABOUT US */}
          <button 
            type="button"
            onClick={() => onOpenPage ? onOpenPage('about-us') : (navigateTo ? navigateTo('/pages/about-us', { view: 'page', slug: 'about-us' }) : null)}
            className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors cursor-pointer text-xs"
            data-reticle-target="nav-about-us-btn"
          >
            <span>About Us</span>
          </button>

          {/* 8. CONTACT */}
          <button 
            type="button"
            onClick={() => onOpenPage ? onOpenPage('contact-us') : (navigateTo ? navigateTo('/pages/contact-us', { view: 'page', slug: 'contact-us' }) : null)}
            className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors cursor-pointer text-xs"
            data-reticle-target="nav-contact-btn"
          >
            <span>Contact</span>
          </button>
        </div>

        {/* RIGHT ADVANTAGES BADGE */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] font-extrabold text-emerald-300 bg-emerald-900/60 px-3.5 py-1 rounded-full border border-emerald-700/60">
          <span>✓ 100% Certified Organic</span>
          <span className="text-emerald-500">•</span>
          <span>✓ Fast Home Delivery</span>
        </div>
      </div>
    </nav>
  );
}

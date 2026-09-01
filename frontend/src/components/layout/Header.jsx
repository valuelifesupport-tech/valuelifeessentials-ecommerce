import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Heart, Search, Menu, X, Globe, Grid, ChevronDown, Sparkles, User, Copy, Check } from 'lucide-react';
import MegaMenu from './MegaMenu';
import { InstagramIcon, FacebookIcon, YoutubeIcon, WhatsAppIcon } from './SocialIcons';

export default function Header({ 
  currency, 
  setCurrency, 
  currencySymbol, 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  currentUser,
  onOpenAuth,
  categories = [], 
  collections = [],
  onSelectCategory,
  onSelectCollection,
  onSelectAllProducts,
  onSelectOffers,
  onSelectBestSellers,
  onSelectNewArrivals,
  navigateTo,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onGoHome,
  onOpenPage,
  settings = { enable_multi_currency: 1 },
  sectionsConfig,
  showToast
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdown, setCurrencyDropdown] = useState(false);
  const [activeCategoryDropdown, setActiveCategoryDropdown] = useState(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [collectionsDropdown, setCollectionsDropdown] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const megaMenuRef = useRef(null);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    if (showToast) showToast('success', 'Coupon Code Copied!', `Code "${code}" copied to clipboard. Apply at checkout for discount!`);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // SEARCH BAR TYPEWRITER ANIMATION EFFECT
  const searchPhrases = [
    "Search 'Organic Vermicompost Fertilizer'...",
    "Search 'Raw Chia Seeds 500g'...",
    "Search 'HDPE Heavy Duty Grow Bags'...",
    "Search 'Pure Ashwagandha & Moringa Powder'...",
    "Search 'Terrace Garden Vegetable Seeds'...",
    "Search 'Cold Pressed Neem Oil Spray'..."
  ];
  const [placeholderText, setPlaceholderText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = searchPhrases[phraseIndex];
    let timer;

    if (!isDeleting) {
      if (placeholderText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length + 1));
        }, 60);
      } else {
        timer = setTimeout(() => setIsDeleting(true), 2200);
      }
    } else {
      if (placeholderText.length > 0) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, placeholderText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % searchPhrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, phraseIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (settings && Number(settings.enable_multi_currency) === 0 && currency !== 'INR') {
      setCurrency('INR');
    }
  }, [settings, currency, setCurrency]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      {(!sectionsConfig || Number(sectionsConfig.show_announcement) !== 0) && (
        <div className="bg-[#1b4332] text-white text-xs py-1.5 px-2 sm:px-4 border-b border-emerald-900">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar py-0.5">
              <span className="bg-[#52b788] text-[#1b4332] font-black text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-sm">
                SALE
              </span>
              <span className="font-semibold text-emerald-100 text-[11px] sm:text-xs flex items-center gap-2 shrink-0">
                <span className="whitespace-nowrap">{settings?.announcement_text || 'Get 15% OFF! Use Code:'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(settings?.announcement_code || 'ORGANIC15')}
                  className="inline-flex items-center gap-1.5 bg-[#52b788]/25 hover:bg-[#52b788]/40 border border-[#52b788]/60 text-amber-300 font-black px-2.5 py-0.5 rounded-lg text-[11px] shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer font-mono group shrink-0"
                  title="Click to copy coupon code"
                >
                  <span className="tracking-wide">{settings?.announcement_code || 'ORGANIC15'}</span>
                  {copiedCode ? (
                    <span className="text-emerald-300 font-black text-[10px] flex items-center gap-0.5 bg-emerald-950/90 px-1.5 py-0.5 rounded border border-emerald-400 animate-pulse">
                      <Check size={11} /> Copied!
                    </span>
                  ) : (
                    <Copy size={11} className="text-emerald-300 group-hover:text-white transition-colors" />
                  )}
                </button>
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* SOCIAL MEDIA ICONS BAR */}
              <div className="flex items-center gap-2 border-r border-emerald-800/80 pr-2 mr-1">
                <a href={settings?.instagram_url || "https://instagram.com/valuelifeessentials"} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-amber-300 hover:scale-110 transition-all flex items-center" title="Instagram">
                  <InstagramIcon size={13} />
                </a>
                <a href={settings?.facebook_url || "https://facebook.com/valuelifeessentials"} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-amber-300 hover:scale-110 transition-all flex items-center" title="Facebook">
                  <FacebookIcon size={13} />
                </a>
                <a href={settings?.youtube_url || "https://youtube.com/@valuelifeessentials"} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-amber-300 hover:scale-110 transition-all flex items-center" title="YouTube">
                  <YoutubeIcon size={13} />
                </a>
                <a href={`https://wa.me/${(settings?.whatsapp_number || '919876543210').replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-200 hover:text-emerald-400 hover:scale-110 transition-all flex items-center" title="WhatsApp Support">
                  <WhatsAppIcon size={13} />
                </a>
              </div>
              {Number(settings?.enable_multi_currency) === 1 && (
                <div className="relative">
                  <button 
                    onClick={() => setCurrencyDropdown(!currencyDropdown)}
                    className="flex items-center gap-1 hover:text-[#52b788] text-[10px] sm:text-xs font-bold transition-colors bg-emerald-900/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-emerald-700/50 whitespace-nowrap"
                  >
                    <Globe size={11} className="text-[#52b788]" />
                    <span>{currency === 'INR' ? '🇮🇳 (₹)' : '🇺🇸 ($)'}</span>
                  </button>

                  {currencyDropdown && (
                    <div className="absolute right-0 mt-1 w-36 bg-white text-gray-800 rounded-xl shadow-xl py-1.5 border border-gray-200 z-50">
                      <button 
                        onClick={() => { setCurrency('INR'); setCurrencyDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${currency === 'INR' ? 'font-bold text-emerald-800 bg-emerald-50/50' : ''}`}
                      >
                        <span>🇮🇳 INR (₹)</span>
                        {currency === 'INR' && '✓'}
                      </button>
                      <button 
                        onClick={() => { setCurrency('USD'); setCurrencyDropdown(false); }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${currency === 'USD' ? 'font-bold text-emerald-800 bg-emerald-50/50' : ''}`}
                      >
                        <span>🇺🇸 USD ($)</span>
                        {currency === 'USD' && '✓'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-6 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            className="md:hidden p-1 text-gray-700 hover:bg-gray-100 rounded-lg flex-shrink-0" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onGoHome(); }} 
            className="flex items-center gap-2.5 group min-w-0"
          >
            <img 
              src="/valuelife_logo.png" 
              alt="ValueLife Essentials Logo" 
              className="h-9 sm:h-11 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform" 
            />
            <div className="min-w-0">
              <span className="font-black text-base sm:text-xl tracking-tight text-[#2d6a4f] block leading-none font-['Outfit'] truncate uppercase">
                VALUELIFE <span className="text-[#800000]">ESSENTIALS</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-emerald-800 font-extrabold tracking-wider uppercase block mt-0.5 truncate hidden xs:block font-mono">
                valuelifeessentials.com
              </span>
            </div>
          </a>
        </div>

        <form 
          onSubmit={(e) => { e.preventDefault(); onSearchSubmit(searchQuery); }}
          className="hidden md:flex flex-1 max-w-lg relative"
        >
          <input 
            type="text" 
            placeholder={placeholderText || "Search organic superfoods, chia seeds, spices..."} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100/90 hover:bg-gray-100 focus:bg-white border border-gray-300 rounded-full py-2.5 pl-5 pr-12 text-xs font-medium focus:outline-none focus:border-[#2d6a4f] focus:ring-2 focus:ring-[#2d6a4f]/20 transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#2d6a4f] transition-colors">
            <Search size={18} />
          </button>
        </form>

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* CUSTOMER USER ACCOUNT BUTTON */}
          <button 
            onClick={onOpenAuth}
            className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-all flex items-center justify-center border border-gray-200 shadow-sm cursor-pointer"
            title={currentUser ? `My Account (${currentUser.name})` : "Customer Sign In / Login"}
          >
            {currentUser ? (
              <span className="w-5 h-5 rounded-full bg-[#3b6e14] text-white text-[11px] font-black flex items-center justify-center font-mono">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </span>
            ) : (
              <User size={18} />
            )}
          </button>

          <button 
            onClick={onOpenWishlist}
            className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors hidden sm:flex items-center justify-center border border-gray-200"
            title="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          <button 
            onClick={onOpenCart}
            className="bg-[#2d6a4f] text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-md hover:bg-[#1b4332] transition-all font-bold text-xs"
          >
            <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-[#52b788] text-[#1b4332] text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. ULTRA-PROFESSIONAL MEGA MENU NAVIGATION BAR */}
      <nav className="bg-gradient-to-r from-emerald-950 via-[#1b4332] to-emerald-950 text-white border-t border-emerald-800/60 hidden md:block shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-6 py-2.5 text-xs font-bold">
          
          <div className="flex items-center gap-6">
            {/* 1. HOME LINK */}
            <button 
              onClick={onGoHome}
              className="hover:text-emerald-300 text-white font-extrabold transition-colors flex items-center gap-1.5 text-sm"
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
                onClick={() => {
                  setIsMegaMenuOpen(prev => !prev);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-md transition-all text-xs cursor-pointer"
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
                    >
                      View All Products →
                    </button>
                  </div>

                  {/* SCROLLABLE GRID CONTAINER WITH TOP & BOTTOM PADDING TO PREVENT CLIPPING */}
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
                            className="font-extrabold text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-2 transition-colors group text-left w-full"
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
                                  className="block text-[11px] text-slate-300 hover:text-white transition-colors text-left truncate w-full font-medium"
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

            {/* COLLECTIONS DROPDOWN (ONLY SHOW IF THERE ARE DROPDOWN COLLECTIONS AVAILABLE) */}
            {(() => {
              const dropdownColls = collections ? collections.filter(c => !(c.show_in_navbar === 1 || c.show_in_navbar === true || String(c.show_in_navbar) === '1')) : [];
              if (dropdownColls.length === 0) return null;

              return (
                <div className="relative py-1">
                  <button 
                    type="button"
                    onClick={() => setCollectionsDropdown(prev => !prev)}
                    className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors flex items-center gap-1 cursor-pointer text-xs"
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
              );
            })()}

            {/* DYNAMIC TOP NAVBAR COLLECTIONS (MANAGED DYNAMICALLY IN ADMIN PANEL) */}
            {(() => {
              const activeNavColls = collections ? collections.filter(c => c.show_in_navbar === 1 || c.show_in_navbar === true || String(c.show_in_navbar) === '1') : [];

              if (activeNavColls.length > 0) {
                return activeNavColls.map(navCol => {
                  const lowerSlug = String(navCol.slug || '').toLowerCase();
                  const lowerName = String(navCol.name || '').toLowerCase();

                  const handleNavClick = () => {
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
                      if (onSelectCollection) onSelectCollection(navCol.id);
                      else if (navigateTo) navigateTo(`/collection/${navCol.slug || navCol.id}`, { view: 'collection', slug: navCol.slug, collection: navCol.id });
                    }
                  };

                  return (
                    <button 
                      key={navCol.id}
                      type="button"
                      onClick={handleNavClick}
                      className="hover:text-emerald-300 text-slate-100 font-extrabold transition-colors flex items-center gap-1 cursor-pointer text-xs"
                    >
                      <span>{navCol.name}</span>
                    </button>
                  );
                });
              }

              // Fallback if no collections have show_in_navbar enabled
              return (
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
              );
            })()}

            {/* 6. ABOUT US */}
            <button 
              onClick={() => onOpenPage ? onOpenPage('about-us') : alert("ValueLife Essentials is India's premier certified 100% organic grocery and wellness store.")}
              className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors"
            >
              <span>About Us</span>
            </button>

            {/* 7. CONTACT */}
            <button 
              onClick={() => onOpenPage ? onOpenPage('contact-us') : alert("Contact ValueLife Essentials Support:\n📧 support@valuelifeessentials.com\n🌐 valuelifeessentials.com")}
              className="hover:text-emerald-300 text-slate-100 font-semibold transition-colors"
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

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 p-4 space-y-3 font-bold text-xs">
          <button 
            onClick={() => { onGoHome(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-emerald-900 border-b"
          >
            🏠 Home Page
          </button>

          <button 
            onClick={() => { onSelectAllProducts(); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 text-emerald-900 border-b flex items-center gap-2 font-black"
          >
            <Grid size={16} /> All Products Catalog
          </button>

          {collections && collections.length > 0 && (
            <div className="space-y-2 py-2 border-b">
              <span className="text-[10px] font-black uppercase text-emerald-700">📦 Collections ({collections.length})</span>
              <div className="pl-2 space-y-1.5 max-h-40 overflow-y-auto">
                {collections.map(col => (
                  <button 
                    key={col.id}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onSelectCollection) onSelectCollection(col.id);
                      else if (navigateTo) navigateTo(`/collection/${col.slug || col.id}`, { view: 'collection', slug: col.slug, collection: col.id });
                    }}
                    className="w-full text-left py-1 text-gray-800 font-bold flex items-center justify-between text-xs hover:text-emerald-600"
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
            {categories.map(cat => (
              <div key={cat.id} className="pl-2 space-y-1">
                <button 
                  onClick={() => { onSelectCategory(cat.slug); setMobileMenuOpen(false); }}
                  className="w-full text-left py-1 text-gray-800 font-extrabold flex items-center gap-2"
                >
                  <span>{cat.icon || '🌱'}</span> <span>{cat.name}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

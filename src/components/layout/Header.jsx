import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Menu, X, User } from 'lucide-react';
import AnnouncementBar from './header/AnnouncementBar';
import SearchForm from './header/SearchForm';
import NavMegaMenu from './header/NavMegaMenu';
import MobileNavMenu from './header/MobileNavMenu';

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
  settings = { enable_multi_currency: 0 },
  sectionsConfig,
  showToast
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (settings && Number(settings.enable_multi_currency) === 0 && currency !== 'INR') {
      setCurrency('INR');
    }
  }, [settings, currency, setCurrency]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200" data-reticle-target="main-header">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <AnnouncementBar
        sectionsConfig={sectionsConfig}
        settings={settings}
        currency={currency}
        setCurrency={setCurrency}
        showToast={showToast}
      />

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-6 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <button 
            className="md:hidden p-1 text-gray-700 hover:bg-gray-100 rounded-lg flex-shrink-0 cursor-pointer" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-reticle-target="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onGoHome(); }} 
            className="flex items-center gap-2.5 group min-w-0"
            data-reticle-target="header-logo-link"
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

        {/* SEARCH FORM */}
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={onSearchSubmit}
        />

        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* CUSTOMER USER ACCOUNT BUTTON */}
          <button 
            onClick={onOpenAuth}
            className="p-2 sm:p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-all flex items-center justify-center border border-gray-200 shadow-sm cursor-pointer"
            title={currentUser ? `My Account (${currentUser.name})` : "Customer Sign In / Login"}
            data-reticle-target="header-user-btn"
          >
            {currentUser ? (
              <span className="w-5 h-5 rounded-full bg-[#3b6e14] text-white text-[11px] font-black flex items-center justify-center font-mono">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </span>
            ) : (
              <User size={18} />
            )}
          </button>

          {/* WISHLIST BUTTON */}
          <button 
            onClick={onOpenWishlist}
            className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors hidden sm:flex items-center justify-center border border-gray-200 cursor-pointer"
            title="Wishlist"
            data-reticle-target="header-wishlist-btn"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* CART BUTTON */}
          <button 
            onClick={onOpenCart}
            className="bg-[#2d6a4f] text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-full flex items-center gap-1.5 sm:gap-2 shadow-md hover:bg-[#1b4332] transition-all font-bold text-xs cursor-pointer"
            data-reticle-target="header-cart-btn"
          >
            <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-[#52b788] text-[#1b4332] text-[10px] sm:text-[11px] font-black px-1.5 sm:px-2 py-0.5 rounded-full">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. MEGA MENU NAVIGATION BAR */}
      <NavMegaMenu
        categories={categories}
        collections={collections}
        onGoHome={onGoHome}
        onSelectCategory={onSelectCategory}
        onSelectCollection={onSelectCollection}
        onSelectAllProducts={onSelectAllProducts}
        onSelectOffers={onSelectOffers}
        onSelectBestSellers={onSelectBestSellers}
        onSelectNewArrivals={onSelectNewArrivals}
        navigateTo={navigateTo}
        onOpenPage={onOpenPage}
      />

      {/* 4. MOBILE DRAWER MENU */}
      <MobileNavMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onGoHome={onGoHome}
        onSelectAllProducts={onSelectAllProducts}
        collections={collections}
        categories={categories}
        onSelectCollection={onSelectCollection}
        onSelectCategory={onSelectCategory}
        navigateTo={navigateTo}
      />
    </header>
  );
}

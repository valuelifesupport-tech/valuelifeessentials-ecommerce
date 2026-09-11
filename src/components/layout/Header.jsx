import React, { useState } from 'react';
import { ShoppingBag, User, Heart, Menu, X, Search } from 'lucide-react';
import AnnouncementBar from './header/AnnouncementBar';
import SearchForm from './header/SearchForm';
import NavMegaMenu from './header/NavMegaMenu';
import MobileNavMenu from './header/MobileNavMenu';

export default function Header({ 
  currency, 
  setCurrency, 
  currencySymbol, 
  cartCount = 0, 
  wishlistCount = 0, 
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
  searchQuery = '', 
  setSearchQuery, 
  onSearchSubmit, 
  onGoHome, 
  onOpenPage, 
  settings = { enable_multi_currency: 0 }, 
  sectionsConfig, 
  showToast 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-150" data-reticle-target="main-header">
      {/* 1. TOP ANNOUNCEMENT / INFO BAR */}
      <AnnouncementBar
        sectionsConfig={sectionsConfig}
        settings={settings}
        currency={currency}
        setCurrency={setCurrency}
        showToast={showToast}
      />

      {/* 2. MAIN HEADER BAR (LOGO, SEARCH & USER ACTIONS) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Brand Logo */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="md:hidden p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-reticle-target="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); onGoHome(); }} 
            className="flex items-center gap-2 group"
            data-reticle-target="header-logo-link"
          >
            <img 
              src="/valuelife_logo.png" 
              alt="ValueLife Essentials" 
              className="h-9 sm:h-10 w-auto object-contain shrink-0 group-hover:scale-105 transition-transform" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[#164e3f] font-['Outfit'] uppercase">
                  Value<span className="text-[#2d6a4f] font-medium">Life</span>
                </span>
              </div>
              <span className="text-[10px] text-emerald-800/80 font-semibold tracking-wider block mt-0.5 font-sans">
                Better Choices, Better Life.
              </span>
            </div>
          </a>
        </div>

        {/* Center: Animated / Interactive Search Bar */}
        <SearchForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={onSearchSubmit}
        />

        {/* Right: User Account, Wishlist & Cart Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
          {/* Account Button */}
          <button 
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#164e3f] transition-all cursor-pointer p-2 sm:px-3 sm:py-2 rounded-full border border-gray-200 hover:bg-gray-50 shadow-xs"
            title={currentUser ? `Logged in as ${currentUser.name}` : "Sign In / Register"}
            data-reticle-target="header-user-btn"
          >
            {currentUser ? (
              <span className="w-5 h-5 rounded-full bg-[#164e3f] text-white text-[10px] font-black flex items-center justify-center font-mono">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </span>
            ) : (
              <User size={16} className="text-gray-600" />
            )}
            <span className="hidden md:inline font-bold">Account</span>
          </button>

          {/* Wishlist Button */}
          <button 
            type="button"
            onClick={onOpenWishlist}
            className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors hidden sm:flex items-center justify-center border border-gray-200 cursor-pointer"
            title="Wishlist"
            data-reticle-target="header-wishlist-btn"
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button 
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-[#164e3f] hover:bg-[#0f382c] text-white px-3.5 py-2 rounded-full transition-all shadow-sm font-semibold text-xs cursor-pointer group"
            data-reticle-target="header-cart-btn"
          >
            <div className="relative">
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>
        </div>
      </div>

      {/* 3. DEDICATED MEGA MENU NAVIGATION BAR (EXACT REFERENCE TO USER DESIGN) */}
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

      {/* 4. MOBILE SEARCH BAR FOR SMALL VIEWPORTS */}
      <div className="md:hidden px-4 pb-2.5 pt-1">
        <form onSubmit={handleSearch} className="relative w-full">
          <input 
            type="text" 
            placeholder="Search organic products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f7f5] border border-gray-200 rounded-full py-2 pl-4 pr-10 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#164e3f]"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={15} />
          </button>
        </form>
      </div>

      {/* 5. MOBILE DRAWER NAVIGATION MENU */}
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
        onOpenPage={onOpenPage}
      />
    </header>
  );
}

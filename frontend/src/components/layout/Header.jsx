import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, User, Menu, X, ChevronDown, Search } from 'lucide-react';
import AnnouncementBar from './header/AnnouncementBar';
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
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-150" data-reticle-target="main-header">
      {/* 1. TOP INFO BAR */}
      <AnnouncementBar
        sectionsConfig={sectionsConfig}
        settings={settings}
        currency={currency}
        setCurrency={setCurrency}
        showToast={showToast}
      />

      {/* 2. MAIN NAVIGATION BAR (MATCHING VALUELIFE DESIGN MOCKUP) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="lg:hidden p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer" 
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
              alt="ValueLife" 
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

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-semibold text-gray-800">
          <button
            type="button"
            onClick={onGoHome}
            className="text-[#164e3f] font-bold hover:text-emerald-700 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onSelectAllProducts ? onSelectAllProducts() : navigateTo('/products', { view: 'all_products' })}
            className="hover:text-[#164e3f] transition-colors cursor-pointer"
          >
            Shop
          </button>

          {/* Categories Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="flex items-center gap-1 hover:text-[#164e3f] transition-colors cursor-pointer"
            >
              <span>Categories</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 pb-2 border-b border-gray-100">
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest">
                    All Categories
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {(categories || []).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoryDropdownOpen(false);
                        if (onSelectCategory) onSelectCategory(cat.slug || cat.id);
                        else navigateTo(`/category/${cat.slug || cat.id}`, { view: 'catalog', category: cat.slug });
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-[#164e3f] transition-colors flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <span className="text-[10px] text-gray-400">({cat.subcategories.length})</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="pt-2 px-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryDropdownOpen(false);
                      if (onSelectAllProducts) onSelectAllProducts();
                      else navigateTo('/products', { view: 'all_products' });
                    }}
                    className="w-full text-center text-xs font-bold text-emerald-700 hover:underline py-1"
                  >
                    View All Categories →
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenPage ? onOpenPage('about-us') : navigateTo('/pages/about-us', { view: 'page', slug: 'about-us' })}
            className="hover:text-[#164e3f] transition-colors cursor-pointer"
          >
            About Us
          </button>
          <button
            type="button"
            onClick={() => onOpenPage ? onOpenPage('contact-us') : navigateTo('/pages/contact-us', { view: 'page', slug: 'contact-us' })}
            className="hover:text-[#164e3f] transition-colors cursor-pointer"
          >
            Contact
          </button>
        </nav>

        {/* Right: Search, Account & Cart */}
        <div className="flex items-center gap-3 sm:gap-5 flex-1 max-w-md justify-end">
          {/* Search Pill Input */}
          <form 
            onSubmit={handleSearch}
            className="relative hidden sm:flex flex-1 max-w-xs"
            data-reticle-target="header-search-form"
          >
            <input 
              type="text" 
              placeholder="Search for products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f4f7f5] hover:bg-[#eef3f0] focus:bg-white border border-gray-200 rounded-full py-2 pl-4 pr-10 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#164e3f] focus:ring-2 focus:ring-[#164e3f]/15 transition-all"
              data-reticle-target="header-search-input"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#164e3f] transition-colors"
              title="Search"
            >
              <Search size={15} />
            </button>
          </form>

          {/* Account Button */}
          <button 
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#164e3f] transition-colors cursor-pointer"
            title={currentUser ? `Logged in as ${currentUser.name}` : "Sign In / Register"}
            data-reticle-target="header-user-btn"
          >
            <User size={18} className="text-gray-600" />
            <span className="hidden md:inline">Account</span>
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

      {/* Mobile Search Bar for small devices */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative w-full">
          <input 
            type="text" 
            placeholder="Search for products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f4f7f5] border border-gray-200 rounded-full py-2 pl-4 pr-10 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#164e3f]"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={15} />
          </button>
        </form>
      </div>

      {/* Mobile Drawer Menu */}
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

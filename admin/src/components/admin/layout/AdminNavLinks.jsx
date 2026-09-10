import React from 'react';
import { 
  BarChart2, Package, ShoppingBag, Layers, Sparkles, ImageIcon, 
  Filter, Grid, DollarSign, Users, Tag, ChevronDown, ChevronRight, 
  Megaphone, Image, FileText, Star, Settings 
} from 'lucide-react';

export default function AdminNavLinks({
  activeTab,
  setActiveTab,
  openSubmenus = {},
  toggleSubmenu,
  counts = {},
  onSelectTab,
  fetchAdminData
}) {
  const handleNavSelect = (tab) => {
    setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const {
    products = 0,
    categories = 0,
    collections = 0,
    mediaFiles = 0,
    filterGroups = 0,
    orders = 0,
    users = 0,
    banners = 0,
    coupons = 0,
    reviews = 0,
    pages = 0
  } = counts;

  return (
    <nav className="space-y-2 text-xs font-bold" data-reticle-target="admin-nav-links">
      {/* 1. DASHBOARD & ANALYTICS */}
      <button 
        onClick={() => handleNavSelect('analytics')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
          activeTab === 'analytics' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        data-reticle-target="admin-nav-analytics"
      >
        <div className="flex items-center gap-3 min-w-0">
          <BarChart2 size={18} className="flex-shrink-0" /> 
          <span className="truncate whitespace-nowrap">Power Analytics</span>
        </div>
      </button>

      {/* 2. CATALOG DROPDOWN */}
      <div className="space-y-1">
        <button 
          onClick={() => toggleSubmenu('catalog')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors uppercase tracking-wider text-[11px] font-black"
          data-reticle-target="admin-nav-toggle-catalog"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Package size={15} className="text-emerald-400 flex-shrink-0" />
            <span className="truncate whitespace-nowrap">Catalog</span>
          </div>
          {openSubmenus.catalog ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
        </button>

        {openSubmenus.catalog && (
          <div className="pl-3.5 space-y-1 border-l-2 border-slate-800 ml-3.5">
            <button 
              onClick={() => handleNavSelect('products')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'products' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-products"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ShoppingBag size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Products & Variants</span>
              </div>
              <span className="bg-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {products}
              </span>
            </button>

            <button 
              onClick={() => handleNavSelect('categories')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'categories' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-categories"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Layers size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Categories</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {categories}
              </span>
            </button>

            <button 
              onClick={() => handleNavSelect('collections')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'collections' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-collections"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Collections</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {collections}
              </span>
            </button>

            <button 
              onClick={() => { handleNavSelect('media'); if (fetchAdminData) fetchAdminData(); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'media' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-media"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ImageIcon size={16} className="flex-shrink-0 text-emerald-400" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Media Library</span>
              </div>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-md border border-emerald-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {mediaFiles}
              </span>
            </button>

            <button 
              onClick={() => handleNavSelect('filters')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'filters' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-filters"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Filter size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Product Filters</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {filterGroups}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3. INVENTORY */}
      <button 
        onClick={() => handleNavSelect('inventory')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
          activeTab === 'inventory' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        data-reticle-target="admin-nav-inventory"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Grid size={17} className="text-amber-400 flex-shrink-0" /> 
          <span className="truncate whitespace-nowrap text-xs font-bold">Inventory & Stock</span>
        </div>
      </button>

      {/* 4. SALES */}
      <button 
        onClick={() => handleNavSelect('orders')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
          activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        data-reticle-target="admin-nav-orders"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <DollarSign size={17} className="text-emerald-400 flex-shrink-0" /> 
          <span className="truncate whitespace-nowrap text-xs font-bold">Sales & Orders</span>
        </div>
        <span className="bg-slate-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
          {orders}
        </span>
      </button>

      {/* 5. CUSTOMERS */}
      <button 
        onClick={() => handleNavSelect('users')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
          activeTab === 'users' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        data-reticle-target="admin-nav-users"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Users size={17} className="text-blue-400 flex-shrink-0" /> 
          <span className="truncate whitespace-nowrap text-xs font-bold">Customers</span>
        </div>
        <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
          {users}
        </span>
      </button>

      {/* 6. MARKETING DROPDOWN */}
      <div className="space-y-1">
        <button 
          onClick={() => toggleSubmenu('marketing')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors uppercase tracking-wider text-[11px] font-black"
          data-reticle-target="admin-nav-toggle-marketing"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Tag size={15} className="text-purple-400 flex-shrink-0" />
            <span className="truncate whitespace-nowrap">Marketing</span>
          </div>
          {openSubmenus.marketing ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
        </button>

        {openSubmenus.marketing && (
          <div className="pl-3.5 space-y-1 border-l-2 border-slate-800 ml-3.5">
            <button 
              onClick={() => handleNavSelect('sections')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'sections' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-sections"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Grid size={16} className="text-emerald-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-black uppercase tracking-wider text-emerald-400">Store Sections Control</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavSelect('hero')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'hero' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-hero"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles size={16} className="text-emerald-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Hero Section Manager</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavSelect('announcement')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'announcement' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-announcement"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Megaphone size={16} className="text-amber-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Header Announcement Bar</span>
              </div>
            </button>

            <button 
              onClick={() => handleNavSelect('banners')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'banners' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-banners"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Image size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Banners & Sliders</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {banners}
              </span>
            </button>

            <button 
              onClick={() => handleNavSelect('coupons')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'coupons' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-coupons"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Tag size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Coupons & Discounts</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {coupons}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 7. CONTENT DROPDOWN */}
      <div className="space-y-1">
        <button 
          onClick={() => toggleSubmenu('content')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors uppercase tracking-wider text-[11px] font-black"
          data-reticle-target="admin-nav-toggle-content"
        >
          <div className="flex items-center gap-2 min-w-0">
            <FileText size={15} className="text-amber-400 flex-shrink-0" />
            <span className="truncate whitespace-nowrap">Content</span>
          </div>
          {openSubmenus.content ? <ChevronDown size={14} className="flex-shrink-0" /> : <ChevronRight size={14} className="flex-shrink-0" />}
        </button>

        {openSubmenus.content && (
          <div className="pl-3.5 space-y-1 border-l-2 border-slate-800 ml-3.5">
            <button 
              onClick={() => handleNavSelect('reviews')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'reviews' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-reviews"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Star size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Customer Reviews</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {reviews}
              </span>
            </button>

            <button 
              onClick={() => handleNavSelect('pages')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'pages' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-pages"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText size={16} className="flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Pages (CMS)</span>
              </div>
              <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-md border border-slate-700 font-extrabold flex-shrink-0 whitespace-nowrap">
                {pages}
              </span>
            </button>

            <button 
              onClick={() => handleNavSelect('theme')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                activeTab === 'theme' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              data-reticle-target="admin-nav-theme"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Sparkles size={16} className="text-amber-400 flex-shrink-0" /> 
                <span className="truncate whitespace-nowrap text-xs font-bold">Theme & Styling Studio</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 8. PAYMENT */}
      <button 
        onClick={() => handleNavSelect('payment')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
          activeTab === 'payment' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        data-reticle-target="admin-nav-payment"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <DollarSign size={17} className="text-emerald-400 flex-shrink-0" /> 
          <span className="truncate whitespace-nowrap text-xs font-bold">Payment & Partial COD</span>
        </div>
      </button>

      {/* 9. TAXES & GST */}
      <button 
        onClick={() => handleNavSelect('taxes')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
          activeTab === 'taxes' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        data-reticle-target="admin-nav-taxes"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <FileText size={17} className="text-amber-400 flex-shrink-0" /> 
          <span className="truncate whitespace-nowrap text-xs font-bold">Taxes & GST Manager</span>
        </div>
        <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-md font-extrabold flex-shrink-0 whitespace-nowrap">
          36 States
        </span>
      </button>

      {/* 10. STORE SETTINGS */}
      <button 
        onClick={() => handleNavSelect('settings')}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
          activeTab === 'settings' ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
        data-reticle-target="admin-nav-settings"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Settings size={17} className="flex-shrink-0" /> 
          <span className="truncate whitespace-nowrap text-xs font-bold">Store Settings</span>
        </div>
      </button>
    </nav>
  );
}

import React, { useState } from 'react';
import { SlidersHorizontal, List, LayoutGrid, Eye, Heart, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';

export default function CatalogPage({
  products = [],
  categories = [],
  collections = [],
  filterGroups = [],
  selectedFilters = {},
  setSelectedFilters,
  currency = 'INR',
  currencySymbol = '₹',
  themeConfig = {},
  wishlist = [],
  onNavigate,
  onAddToCart,
  onToggleWishlist,
  onClearFilters
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');

  // Sorting products
  const sortedProducts = [...products].sort((a, b) => {
    const aPrice = currency === 'INR' ? (a.discount_inr || a.price_inr) : (a.discount_usd || a.price_usd);
    const bPrice = currency === 'INR' ? (b.discount_inr || b.price_inr) : (b.discount_usd || b.price_usd);
    if (sortBy === 'low_high') return aPrice - bPrice;
    if (sortBy === 'high_low') return bPrice - aPrice;
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen bg-[#fcfcf9] py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* FILTER & SORT BAR (Matching Screenshot 1 & 2) */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-gray-800 font-['Outfit']">
            <SlidersHorizontal size={16} className="text-[#3b6e14]" />
            <span>Filter and sort</span>
          </div>

          {/* VIEW MODE TOGGLE SWITCHER (Matching Screenshot 1) */}
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-gray-300 shadow-sm">
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                viewMode === 'list' 
                  ? 'bg-[#4a7729] text-white shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`} 
              title="List View"
            >
              <List size={16} />
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                viewMode === 'grid' 
                  ? 'bg-[#4a7729] text-white shadow' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`} 
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-gray-500 font-['Outfit']">
            {sortedProducts.length} Products
          </span>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-300 text-xs font-bold text-gray-800 rounded-full px-4 py-2 focus:outline-none focus:border-[#3b6e14] cursor-pointer shadow-sm"
          >
            <option value="default">Sort by ▾</option>
            <option value="low_high">Price: Low to High</option>
            <option value="high_low">Price: High to Low</option>
          </select>

          <button 
            onClick={onClearFilters}
            className="text-xs font-bold text-red-600 bg-red-50 px-3.5 py-2 rounded-full hover:bg-red-100 border border-red-200 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* COLLECTIONS FILTER PILLS */}
      {collections && collections.length > 0 && (
        <div className="bg-white rounded-2xl p-3.5 border border-gray-200 shadow-sm flex items-center gap-2.5 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] font-black uppercase text-emerald-800 shrink-0 font-mono">📦 Collections:</span>
          <div className="flex items-center gap-2 shrink-0">
            {collections.map(col => (
              <button
                key={col.id}
                onClick={() => onNavigate && onNavigate(`/collection/${col.slug || col.id}`, { view: 'catalog', slug: null, category: null, collection: col.id })}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <span>📦 {col.name}</span>
                <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full font-mono">
                  {col.product_count !== undefined ? col.product_count : (col.product_ids ? col.product_ids.length : 0)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCT GRID / LIST VIEW */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm my-8">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 font-['Outfit']">No Matching Organic Products Found</h3>
            <p className="text-xs text-slate-500 font-medium">No products match your active selection.</p>
          </div>
          <button 
            onClick={onClearFilters}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all"
          >
            Clear All Filters ✕
          </button>
        </div>
      ) : (
        <div className={`grid ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4 sm:gap-5`}>
          {sortedProducts.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              currency={currency}
              currencySymbol={currencySymbol}
              viewMode={viewMode}
              cardStyle={themeConfig?.card_style || 'VALUELIFE_ESSENTIALS'}
              isWishlisted={wishlist.some(w => w.id === p.id)}
              onNavigate={onNavigate}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      )}
    </div>
  );
}

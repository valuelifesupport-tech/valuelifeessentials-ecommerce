import React from 'react';
import { SlidersHorizontal, List, LayoutGrid } from 'lucide-react';

export default function CatalogControlsBar({
  mobileViewMode,
  setMobileViewMode,
  sortedProductsCount,
  sortBy,
  setSortBy,
  route,
  searchQuery,
  handleClearFilters
}) {
  return (
    <div className="flex flex-wrap justify-between items-center border-t border-b border-gray-200 py-3 gap-3" data-reticle-target="catalog-controls-bar">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-extrabold text-xs text-gray-800">
          <SlidersHorizontal size={16} className="text-[#3b6e14]" />
          <span>Filter and sort</span>
        </div>

        {/* LIST VIEW & GRID VIEW TOGGLES */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-full border border-gray-300 shadow-sm">
          <button 
            type="button"
            onClick={() => setMobileViewMode('list')}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
              mobileViewMode === 'list' 
                ? 'bg-[#4a7729] text-white shadow' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`} 
            title="List View"
            data-reticle-target="view-mode-list-btn"
          >
            <List size={16} />
          </button>
          <button 
            type="button"
            onClick={() => setMobileViewMode('grid')}
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
              mobileViewMode === 'grid' 
                ? 'bg-[#4a7729] text-white shadow' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`} 
            title="Grid View"
            data-reticle-target="view-mode-grid-btn"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-extrabold text-gray-500 font-['Outfit']">
          {sortedProductsCount} Products
        </span>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-white border border-gray-300 text-xs font-bold text-gray-800 rounded-full px-4 py-2 focus:outline-none focus:border-[#3b6e14] cursor-pointer shadow-sm"
          data-reticle-target="catalog-sort-select"
        >
          <option value="default">Sort by ▾</option>
          <option value="low_high">Price: Low to High</option>
          <option value="high_low">Price: High to Low</option>
        </select>

        {(route?.category || route?.collection || searchQuery || route?.view === 'all_products') && (
          <button 
            onClick={handleClearFilters}
            className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-full hover:bg-red-100 border border-red-200 cursor-pointer"
            data-reticle-target="catalog-clear-all-btn"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

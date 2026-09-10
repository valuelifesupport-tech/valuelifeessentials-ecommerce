import React from 'react';
import CatalogBanner from './catalog/CatalogBanner';
import CatalogFilterPills from './catalog/CatalogFilterPills';
import CatalogControlsBar from './catalog/CatalogControlsBar';
import CatalogProductCard from './catalog/CatalogProductCard';
import CatalogLoadMore from './catalog/CatalogLoadMore';

export default function CatalogView({
  route,
  categories = [],
  collections = [],
  filterGroups = [],
  selectedFilters = {},
  setSelectedFilters,
  activeFilterDropdown,
  setActiveFilterDropdown,
  mobileViewMode = 'grid',
  setMobileViewMode,
  sortBy = 'default',
  setSortBy,
  sortedProducts = [],
  isProductsLoading = false,
  visibleCount = 12,
  setVisibleCount,
  isLoadingMore = false,
  wishlist = [],
  currencySymbol = '₹',
  themeConfig = {},
  searchQuery = '',
  navigateTo,
  handleAddToCart,
  handleToggleWishlist,
  handleClearFilters,
  getProductPricing,
  openVariantModal
}) {
  return (
    <div className="space-y-6 pb-12" data-reticle-target="catalog-view">
      {/* 1. HERO HEADER BANNER WITH OVERLAY TITLE & BREADCRUMB */}
      <CatalogBanner
        route={route}
        categories={categories}
        collections={collections}
        searchQuery={searchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* 2. DYNAMIC PRODUCT FILTER PILLS ROW */}
        <CatalogFilterPills
          filterGroups={filterGroups}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          activeFilterDropdown={activeFilterDropdown}
          setActiveFilterDropdown={setActiveFilterDropdown}
        />

        {/* 3. MOBILE & DESKTOP CONTROLS BAR */}
        <CatalogControlsBar
          mobileViewMode={mobileViewMode}
          setMobileViewMode={setMobileViewMode}
          sortedProductsCount={sortedProducts.length}
          sortBy={sortBy}
          setSortBy={setSortBy}
          route={route}
          searchQuery={searchQuery}
          handleClearFilters={handleClearFilters}
        />

        {/* 4. PRODUCT CARDS GRID */}
        {isProductsLoading ? (
          <div className="py-20 text-center space-y-4 bg-white/70 rounded-3xl border border-gray-200/80 shadow-sm my-6" data-reticle-target="catalog-loading-state">
            <div className="w-12 h-12 border-4 border-[#3b6e14] border-t-transparent rounded-full animate-spin mx-auto shadow-md" />
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-gray-800 tracking-wide uppercase font-['Outfit'] animate-pulse">
                🌱 Loading Fresh Organic Products...
              </h3>
              <p className="text-xs text-gray-400 font-medium">Fetching catalog from ValueLife Essentials server</p>
            </div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm my-8" data-reticle-target="catalog-empty-state">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              🔍
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 font-['Outfit']">No Matching Organic Products Found</h3>
              <p className="text-xs text-slate-500 font-medium">No products match your selected filter options. Try clearing active filter pills.</p>
            </div>
            <button 
              onClick={() => setSelectedFilters({})}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all"
            >
              Clear Active Filter Pills ✕
            </button>
          </div>
        ) : (
          <div className={`grid ${mobileViewMode === 'list' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-4 sm:gap-5`}>
            {sortedProducts.slice(0, visibleCount).map((p) => (
              <CatalogProductCard
                key={p.id}
                product={p}
                viewMode={mobileViewMode}
                isWishlist={wishlist.some(w => w.id === p.id)}
                currencySymbol={currencySymbol}
                themeConfig={themeConfig}
                navigateTo={navigateTo}
                handleAddToCart={handleAddToCart}
                handleToggleWishlist={handleToggleWishlist}
                getProductPricing={getProductPricing}
                openVariantModal={openVariantModal}
              />
            ))}
          </div>
        )}

        {/* 5. INFINITE SCROLL / LOAD ON SCROLL FOOTER */}
        <CatalogLoadMore
          isLoadingMore={isLoadingMore}
          visibleCount={visibleCount}
          totalProducts={sortedProducts.length}
          onLoadMore={() => setVisibleCount(prev => Math.min(prev + 12, sortedProducts.length))}
        />
      </div>
    </div>
  );
}

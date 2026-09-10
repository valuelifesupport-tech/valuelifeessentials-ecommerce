import React from 'react';

export default function CatalogBanner({
  route,
  categories = [],
  collections = [],
  searchQuery = ''
}) {
  const getCategoryTitle = () => {
    if (!route.category) return 'Catalog';
    const found = (categories || []).find(c => String(c.id) === String(route.category) || c.slug === route.category);
    if (found && found.name) return found.name;
    return String(route.category).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCollectionTitle = () => {
    if (!route.collection) return 'Catalog';
    const found = (collections || []).find(c => String(c.id) === String(route.collection) || c.slug === route.collection);
    if (found && found.name) return found.name;
    return String(route.collection).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const titleText = route.view === 'offers' ? '🔥 Special Organic Offers & Discount Deals' :
    route.view === 'bestsellers' ? '⭐ Best Seller Organic Products' :
    route.view === 'new_arrivals' ? '✨ New Arrivals & Fresh Stock' :
    route.view === 'all_products' ? 'All Organic Products' :
    searchQuery ? `Search Results for "${searchQuery}"` :
    route.category ? getCategoryTitle() :
    route.collection ? getCollectionTitle() :
    'Organic Catalog';

  const breadcrumbText = route.view === 'offers' ? 'Offers' :
    route.view === 'bestsellers' ? 'Best Sellers' :
    route.view === 'new_arrivals' ? 'New Arrivals' :
    searchQuery ? 'Search' :
    route.category ? getCategoryTitle() :
    route.collection ? getCollectionTitle() : 'Catalog';

  return (
    <div className="relative w-full h-48 sm:h-56 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 overflow-hidden flex items-center justify-center text-center" data-reticle-target="catalog-hero-banner">
      <div className="relative z-10 space-y-2 px-4">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-['Outfit']">
          {titleText}
        </h1>
        <p className="text-xs font-bold text-emerald-200">
          <span>Home</span> / <span className="text-white font-extrabold">{breadcrumbText}</span>
        </p>
      </div>
    </div>
  );
}

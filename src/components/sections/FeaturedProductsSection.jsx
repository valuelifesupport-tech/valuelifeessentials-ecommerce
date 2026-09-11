import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { resolveImgUrl } from '../../api/config';

export default function FeaturedProductsSection({ 
  products = [], 
  onAddToCart, 
  onToggleWishlist, 
  isWishlisted, 
  navigateTo,
  currencySymbol = '₹'
}) {
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = [
    { id: 'ALL', label: 'All' },
    { id: 'BEST_SELLERS', label: 'Best Sellers' },
    { id: 'NEW_ARRIVALS', label: 'New Arrivals' },
    { id: 'ON_SALE', label: 'On Sale' }
  ];

  const handleProductClick = (slug) => {
    if (navigateTo) navigateTo(`/product/${slug}`, { view: 'product', slug });
  };

  // Real products from database only - no fake hardcoded products
  const displayItems = (products && products.length > 0)
    ? products.map((p, idx) => ({
        id: p.id,
        title: p.title || p.name || 'ValueLife Product',
        slug: p.slug || `product-${p.id}`,
        pack: (p.variants && p.variants[0]?.variant_name) || 'Standard Pack',
        price: Number(p.price_inr || p.price || 0),
        originalPrice: Number(p.compare_price_inr || p.compare_price || 0) || Math.round(Number(p.price_inr || p.price || 0) * 1.25),
        discount: p.discount_inr ? `₹${p.discount_inr} OFF` : 'Special Offer',
        rating: Number(p.rating || 5.0),
        reviews: Number(p.review_count || 1),
        image_url: resolveImgUrl(p.thumbnail || p.image_url),
        category: p.category_name || 'Natural Essentials',
        is_best_product: p.is_best_product,
        rawProduct: p
      }))
    : [];

  const filteredItems = displayItems.filter(item => {
    if (activeTab === 'BEST_SELLERS') return item.is_best_product === 1;
    if (activeTab === 'ON_SALE') return item.originalPrice > item.price;
    return true;
  });

  return (
    <section className="py-12 bg-white" data-reticle-target="featured-products-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Title and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-950">
              Featured Products
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Handpicked natural formulations for optimum health & wellness
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#164e3f] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => navigateTo && navigateTo('/products', { view: 'all_products' })}
              className="text-xs font-bold text-[#164e3f] hover:underline flex items-center gap-1 ml-2 shrink-0 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Real Products Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredItems.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className="group relative bg-white border border-gray-200/80 hover:border-emerald-500/50 rounded-2xl p-3 sm:p-3.5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image & Wishlist Container */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#faf8f5] mb-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    onClick={() => handleProductClick(item.slug)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => onToggleWishlist && onToggleWishlist(item.rawProduct || item)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-red-500 shadow-sm transition-colors cursor-pointer"
                    aria-label="Add to Wishlist"
                  >
                    <Heart size={14} fill={isWishlisted && isWishlisted(item.id) ? '#ef4444' : 'none'} color={isWishlisted && isWishlisted(item.id) ? '#ef4444' : 'currentColor'} />
                  </button>
                </div>

                {/* Content Details */}
                <div className="space-y-1">
                  <h3 
                    onClick={() => handleProductClick(item.slug)}
                    className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-1 hover:text-[#164e3f] cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 font-medium">{item.pack}</p>

                  <div className="flex items-center gap-1 text-amber-500 text-[11px] font-bold pt-0.5">
                    <Star size={11} fill="currentColor" />
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">({item.reviews})</span>
                  </div>

                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-sm sm:text-base font-extrabold text-gray-950 font-mono">
                      {currencySymbol}{item.price}
                    </span>
                    {item.originalPrice > item.price && (
                      <span className="text-[11px] text-gray-400 line-through font-mono">
                        {currencySymbol}{item.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart CTA */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => onAddToCart && onAddToCart(item.rawProduct || item)}
                    className="w-full bg-[#164e3f] hover:bg-[#0f382d] text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag size={13} />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-[#fbf9f5] rounded-3xl border border-dashed border-emerald-900/20">
            <span className="text-3xl block mb-2">🌿</span>
            <h3 className="font-bold text-gray-800 text-sm mb-1">Products Being Harvested</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Our organic catalog is being updated directly in the database. Check back shortly!
            </p>
          </div>
        )}

      </div>
    </section>
  );
}

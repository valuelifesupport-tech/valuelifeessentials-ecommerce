import React from 'react';
import { Sparkles, Heart, ShoppingBag, Layers } from 'lucide-react';
import HeroSection from './HeroSection';
import PromoBannerSlider from './PromoBannerSlider';
import CategorySlider from './CategorySlider';
import { resolveImgUrl } from '../../api/config';

export default function StoreHomeView({
  heroConfig,
  sectionsConfig,
  banners,
  categories,
  collections,
  bestProducts = [],
  wishlist = [],
  currencySymbol = '₹',
  themeConfig = {},
  navigateTo,
  handleAddToCart,
  handleToggleWishlist,
  getProductPricing,
  openVariantModal
}) {
  return (
    <div className="space-y-12" data-reticle-target="store-home-view">
      {/* MULTI-STYLE DYNAMIC HERO SECTION */}
      {(!sectionsConfig || Number(sectionsConfig.show_hero) !== 0) && (
        <HeroSection heroConfig={heroConfig} navigateTo={navigateTo} sectionsConfig={sectionsConfig} />
      )}
      {(!sectionsConfig || Number(sectionsConfig.show_promo_banners) !== 0) && (
        <PromoBannerSlider navigateTo={navigateTo} sectionsConfig={sectionsConfig} banners={banners} />
      )}

      {/* TRUST BADGES */}
      {(!sectionsConfig || Number(sectionsConfig.show_trust_badges) !== 0) && (
        <div className="bg-white py-6 border-b border-gray-200 shadow-sm" data-reticle-target="trust-badges-bar">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div className="flex items-center gap-3 p-2">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-[#2d6a4f] flex items-center justify-center font-bold text-lg">🌱</div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_1_title || '100% Pure Organic'}</h4>
                <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_1_sub || 'Chemical-free bio products'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg">🚚</div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_2_title || 'Fast Home Delivery'}</h4>
                <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_2_sub || 'Safe packaging across India'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-lg">💳</div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_3_title || 'Partial Payment & COD'}</h4>
                <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_3_sub || 'Pay 20% deposit online'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-lg">⭐</div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-xs">{sectionsConfig?.trust_badge_4_title || 'Top Rated Customer Service'}</h4>
                <p className="text-gray-500 text-[11px]">{sectionsConfig?.trust_badge_4_sub || '4.9 ★ Average Reviews'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CIRCULAR SHOP BY CATEGORIES SLIDER */}
      {(!sectionsConfig || Number(sectionsConfig.show_categories_slider) !== 0) && (
        <CategorySlider 
          categories={categories} 
          navigateTo={navigateTo} 
          sectionTitle={sectionsConfig?.category_slider_title} 
          sectionsConfig={sectionsConfig} 
        />
      )}

      {/* CURATED PRODUCT COLLECTIONS SECTION */}
      {collections && collections.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 space-y-6" data-reticle-target="curated-collections-section">
          <div className="bg-[#0f172a] text-white p-5 rounded-3xl border border-slate-800 flex justify-between items-center shadow-lg">
            <div>
              <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest flex items-center gap-1">
                📦 FEATURED CATALOG COLLECTIONS
              </span>
              <h2 className="text-2xl font-black text-white font-['Outfit']">Handpicked Collections</h2>
            </div>
            <button 
              onClick={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
              className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
              data-reticle-target="browse-all-collections-btn"
            >
              Browse All Products →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {collections.map(col => {
              const count = col.product_count !== undefined ? col.product_count : (col.product_ids ? col.product_ids.length : 0);
              const coverImg = col.image_url || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80';

              return (
                <div 
                  key={col.id}
                  onClick={() => navigateTo(`/collection/${col.slug || col.id}`, { view: 'catalog', slug: null, category: null, collection: col.id })}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-md hover:shadow-2xl transition-all cursor-pointer flex flex-col relative"
                  data-reticle-target={`collection-card-${col.id}`}
                >
                  <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                    <img 
                      src={resolveImgUrl(coverImg)} 
                      alt={col.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
                      <span className="bg-emerald-500 text-emerald-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full w-fit mb-1.5 shadow">
                        {count} {count === 1 ? 'Product' : 'Products'}
                      </span>
                      <h3 className="font-extrabold text-white text-lg font-['Outfit'] leading-snug group-hover:text-emerald-300 transition-colors">
                        {col.name}
                      </h3>
                    </div>
                  </div>

                  {col.description && (
                    <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                      <p className="text-xs text-gray-600 line-clamp-2">{col.description}</p>
                      <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-700 pt-2 border-t border-gray-100">
                        <span>Explore Collection</span>
                        <span>→</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BEST SELLERS SECTION */}
      {bestProducts.length > 0 && (!sectionsConfig || Number(sectionsConfig.show_bestsellers) !== 0) && (
        <div className="max-w-7xl mx-auto px-4 space-y-6" data-reticle-target="bestsellers-section">
          <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 flex justify-between items-center">
            <div>
              <span className="text-[11px] font-black uppercase text-amber-800 tracking-widest flex items-center gap-1">
                <Sparkles size={14} /> {sectionsConfig?.bestsellers_badge || 'HIGH DEMAND ITEMS'}
              </span>
              <h2 className="text-2xl font-black text-emerald-950 font-['Outfit']">{sectionsConfig?.bestsellers_title || '🔥 Best Seller Products'}</h2>
            </div>
            <button 
              onClick={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
              className="text-xs font-extrabold text-[#2d6a4f] hover:underline cursor-pointer"
              data-reticle-target="view-all-bestsellers-btn"
            >
              View All Products →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bestProducts.map((p) => {
              const { pPrice, pOriginal, pct, hasVariants } = getProductPricing(p);
              const variantsExist = Boolean(hasVariants || (Array.isArray(p.variants) && p.variants.length > 0));
              const isWish = wishlist.some(w => w.id === p.id);

              const handleActionClick = () => {
                if (variantsExist && openVariantModal) {
                  openVariantModal(p);
                } else {
                  handleAddToCart(p);
                }
              };

              return (
                <div 
                  key={p.id} 
                  className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-xl transition-all flex flex-col group p-3 space-y-3"
                  data-reticle-target={`bestseller-card-${p.id}`}
                >
                  <div 
                    onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
                    className="w-full h-48 sm:h-56 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex items-center justify-center p-2 group/img"
                  >
                    <img 
                      src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
                      alt={p.title} 
                      className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
                    />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md z-10 cursor-pointer ${
                        isWish ? 'bg-rose-600 text-white scale-105' : 'bg-[#f87171] hover:bg-rose-600 text-white hover:scale-105'
                      }`}
                      title={isWish ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      data-reticle-target={`wishlist-toggle-${p.id}`}
                    >
                      <Heart size={15} fill="currentColor" color="white" />
                    </button>
                  </div>

                  <div className="space-y-2 flex-1 flex flex-col justify-between px-1">
                    <div className="space-y-1">
                      <h3 
                        onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, id: p.id, category: null, collection: null })}
                        className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-[#3b6e14] cursor-pointer line-clamp-1 leading-snug"
                      >
                        {p.title}
                      </h3>

                      <div className="star-rating text-[11px] font-bold text-amber-500 flex items-center gap-1">
                        <span>★★★★★</span>
                        <span className="text-gray-700 font-extrabold">{Number(p.avg_rating || 0).toFixed(2)}</span>
                        <span className="text-gray-400 font-medium">| {p.review_count || 24}</span>
                      </div>

                      <div className="flex items-baseline gap-1.5 flex-wrap pt-1">
                        {variantsExist && (
                          <span className="text-[11px] font-semibold text-gray-500">From</span>
                        )}
                        <span className="text-base sm:text-lg font-black text-gray-900">{currencySymbol} {pPrice}.00</span>
                        {pOriginal > pPrice && (
                          <span className="text-xs text-gray-400 line-through font-bold">{currencySymbol} {pOriginal}.00</span>
                        )}
                        {pct > 0 && (
                          <span className="bg-[#4a7729] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            -{pct}% Off
                          </span>
                        )}
                      </div>
                    </div>

                    {(themeConfig?.card_style === 'CLASSIC_SPLIT') ? (
                      <div className="flex gap-1.5 pt-1">
                        <button 
                          onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
                          className="border-2 border-[#3b6e14] text-[#3b6e14] hover:bg-[#d8f3dc] flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center flex items-center justify-center min-w-0 cursor-pointer"
                        >
                          Details
                        </button>
                        <button 
                          onClick={handleActionClick}
                          className="bg-[#3b6e14] hover:bg-[#2e5710] text-white flex-1 py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-black shadow-md transition-all text-center flex items-center justify-center gap-1 min-w-0 cursor-pointer"
                          data-reticle-target={`add-to-cart-${p.id}`}
                        >
                          {variantsExist ? 'Options' : '+ Add'}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleActionClick}
                        className={`w-full text-white py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-2 cursor-pointer ${
                          variantsExist ? 'bg-[#2d6a4f] hover:bg-[#1b4332]' : 'bg-[#3b6e14] hover:bg-[#2e5710]'
                        }`}
                        data-reticle-target={`add-to-cart-${p.id}`}
                      >
                        {variantsExist ? (
                          <>
                            <Layers size={14} /> SELECT OPTIONS
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={15} /> ADD TO CART
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

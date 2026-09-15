import React from 'react';
import { Eye, Heart, ShoppingBag, Layers } from 'lucide-react';
import { resolveImgUrl } from '../../../api/config';

export default function CatalogProductCard({
  product,
  viewMode = 'grid',
  isWishlist,
  currencySymbol = '₹',
  themeConfig = {},
  navigateTo,
  handleAddToCart,
  handleToggleWishlist,
  getProductPricing,
  openVariantModal
}) {
  const p = product;
  const { pPrice, pOriginal, pct, hasVariants } = getProductPricing(p);
  const variantsExist = Boolean(hasVariants || (Array.isArray(p.variants) && p.variants.length > 0));

  const handleActionClick = () => {
    if (variantsExist && openVariantModal) {
      openVariantModal(p);
    } else {
      handleAddToCart(p);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm hover:shadow-xl transition-all flex flex-row items-center p-3.5 gap-4 group relative" data-reticle-target={`catalog-item-list-${p.id}`}>
        <div 
          onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
          className="w-36 sm:w-44 h-36 sm:h-44 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex-shrink-0 flex items-center justify-center p-2 border border-gray-200/80 group/img"
        >
          <img 
            src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
            alt={p.title}
            className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
          />
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${
              isWishlist 
                ? 'bg-white text-[#b91c1c] border border-red-300 shadow-md scale-105' 
                : 'bg-white/90 hover:bg-white text-gray-400 hover:text-[#b91c1c] border border-gray-200/80 hover:scale-105'
            }`}
            title={isWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            data-reticle-target={`catalog-wishlist-btn-${p.id}`}
          >
            <Heart 
              size={14} 
              fill={isWishlist ? '#b91c1c' : 'none'} 
              color={isWishlist ? '#b91c1c' : 'currentColor'} 
              strokeWidth={2}
            />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null });
            }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 hover:bg-white text-gray-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow border border-gray-200 flex items-center gap-1 cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
            data-reticle-target={`catalog-quickview-btn-${p.id}`}
          >
            <Eye size={12} className="text-[#3b6e14]" /> QUICK VIEW
          </button>
        </div>

        <div className="flex-1 space-y-2 flex flex-col justify-between py-1 min-w-0">
          <div className="space-y-1">
            <h3 
              onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
              className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-[#3b6e14] cursor-pointer line-clamp-2 leading-snug hover:underline"
            >
              {p.title}
            </h3>

            <div className="star-rating text-[11px] font-bold text-amber-500 flex items-center gap-1">
              <span>★★★★★</span>
              <span className="text-gray-700 font-extrabold">{Number(p.avg_rating || 0).toFixed(2)}</span>
              <span className="text-gray-400 font-medium">| {p.review_count || 56}</span>
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
              className={`w-full text-white py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-1 cursor-pointer ${
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
  }

  // Grid View Mode
  return (
    <div className="bg-[#f8f7f2] rounded-3xl overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-xl transition-all flex flex-col group p-3 space-y-3" data-reticle-target={`catalog-item-grid-${p.id}`}>
      <div 
        onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
        className="w-full h-52 sm:h-60 bg-white rounded-2xl relative overflow-hidden cursor-pointer flex items-center justify-center p-2 group/img"
      >
        <img 
          src={resolveImgUrl(p.thumbnail || p.image_url || p.images?.[0])} 
          alt={p.title}
          className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-500"
        />
        <button 
          type="button"
          onClick={(e) => { e.stopPropagation(); handleToggleWishlist(p); }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm z-10 cursor-pointer ${
            isWishlist 
              ? 'bg-white text-[#b91c1c] border border-red-300 shadow-md scale-105' 
              : 'bg-white/90 hover:bg-white text-gray-400 hover:text-[#b91c1c] border border-gray-200/80 hover:scale-105'
          }`}
          title={isWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          data-reticle-target={`catalog-wishlist-btn-${p.id}`}
        >
          <Heart 
            size={15} 
            fill={isWishlist ? '#b91c1c' : 'none'} 
            color={isWishlist ? '#b91c1c' : 'currentColor'} 
            strokeWidth={2}
          />
        </button>
      </div>

      <div className="space-y-2 flex-1 flex flex-col justify-between px-1">
        <div className="space-y-1">
          <h3 
            onClick={() => navigateTo(`/products/${p.slug}`, { view: 'pdp', slug: p.slug, category: null, collection: null })}
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
}

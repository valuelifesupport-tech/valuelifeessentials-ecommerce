import React from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';

export default function ProductPricingBox({
  productData,
  price,
  originalPrice,
  savingsAmount,
  currencySymbol = '₹',
  variantsList = [],
  selectedVariant,
  handleSelectVariant,
  quantity,
  setQuantity,
  isINR,
  onAddToCart,
  onAddToWishlist,
  showToast
}) {
  const activeVariant = selectedVariant || (variantsList && variantsList.length > 0 ? variantsList[0] : null);

  return (
    <div className="space-y-6" data-reticle-target="pdp-pricing-box">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug font-['Outfit']">
          {productData.title || productData.name || 'ValueLife Essentials Product'}
        </h1>

        {/* RATING STARS */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center text-amber-400 gap-0.5">
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
            <Star size={16} fill="currentColor" />
          </div>
          <span className="font-bold text-xs text-gray-700">
            {Number(productData.ratingStats?.avg_rating !== undefined ? productData.ratingStats.avg_rating : (productData.avg_rating || 0)).toFixed(1)} | {productData.ratingStats?.total_reviews ?? productData.total_reviews ?? 0} reviews
          </span>
        </div>
      </div>

      {/* PRICE HEADER */}
      <div className="space-y-1 pt-1 border-t border-gray-100">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700" data-reticle-target="pdp-current-price">
            {currencySymbol}{price.toFixed(2)}
          </span>
          {originalPrice > price && (
            <span className="text-lg text-gray-400 line-through font-medium">
              {currencySymbol}{originalPrice.toFixed(2)}
            </span>
          )}
          {savingsAmount > 0 && (
            <span className="bg-amber-300/80 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
              You Save: {currencySymbol}{savingsAmount.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Taxes included. <span className="underline cursor-pointer hover:text-gray-700">Shipping</span> calculated at checkout.
        </p>
      </div>

      {/* PRODUCT VARIANTS SELECTOR PILLS */}
      {variantsList && variantsList.length > 0 && (
        <div className="space-y-2 pt-2 pb-1 border-t border-gray-100" data-reticle-target="pdp-variants">
          <label className="text-xs font-bold text-gray-700 block">
            Select Size / Option:
          </label>

          <div className="flex flex-wrap gap-2.5">
            {variantsList.map((v, vIdx) => {
              const isSelected = (selectedVariant?.id && v.id && String(selectedVariant.id) === String(v.id)) || 
                                 (selectedVariant?.variant_name && v.variant_name && String(selectedVariant.variant_name).trim().toLowerCase() === String(v.variant_name).trim().toLowerCase()) ||
                                 (!selectedVariant && vIdx === 0);

              const vPrice = isINR 
                ? (Number(v.price_inr) || Number(v.price) || 0) 
                : (Number(v.price_usd) || (Number(v.price_inr || v.price) ? Number(((Number(v.price_inr || v.price)) / 95).toFixed(2)) : 0));

              return (
                <button
                  key={v.id || v.variant_name || vIdx}
                  type="button"
                  onClick={() => handleSelectVariant(v)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'border-2 border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm ring-2 ring-emerald-500/20 font-extrabold scale-105'
                      : 'border border-gray-200 bg-white text-gray-700 font-semibold hover:border-emerald-500 hover:bg-emerald-50/30'
                  }`}
                  data-reticle-target={`pdp-variant-${v.id || vIdx}`}
                >
                  <span>{v.variant_name || v.name || v.title || `Option ${vIdx + 1}`}</span>
                  {vPrice > 0 && (
                    <span className={`text-[11px] font-bold ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`}>
                      • {currencySymbol}{vPrice.toFixed(2)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QUANTITY & ADD TO CART BAR */}
      <div className="space-y-4 pt-2">
        <label className="text-xs font-bold text-gray-700 block mb-1">
          Quantity
        </label>

        <div className="flex items-center gap-4">
          {/* QUANTITY STEPPER */}
          <div className="inline-flex items-center border border-gray-300 rounded-full px-3 py-1.5 bg-gray-50/80">
            <button 
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2 text-base font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              data-reticle-target="pdp-qty-minus"
            >
              -
            </button>
            <span className="px-3 text-sm font-bold text-gray-900 min-w-[24px] text-center">{quantity}</span>
            <button 
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-2 text-base font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
              data-reticle-target="pdp-qty-plus"
            >
              +
            </button>
          </div>

          {/* GREEN ADD TO CART BUTTON */}
          <button 
            type="button"
            onClick={() => onAddToCart({ ...productData, variant: activeVariant, price, quantity })}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-8 rounded-full shadow-lg shadow-emerald-600/20 text-sm sm:text-base flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer transition-all"
            data-reticle-target="pdp-add-to-cart-btn"
          >
            <ShoppingBag size={18} /> ADD TO CART
          </button>
        </div>
      </div>

      {/* SUB-ACTIONS ROW */}
      <div className="flex items-center gap-6 pt-3 text-xs text-gray-600 border-t border-gray-100">
        <button 
          type="button"
          onClick={() => onAddToWishlist(productData, activeVariant)}
          className="flex items-center gap-1.5 font-bold hover:text-emerald-700 transition-colors cursor-pointer"
          data-reticle-target="pdp-wishlist-btn"
        >
          <Heart size={16} /> Add To Wishlist
        </button>

        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200/80 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          In stock ({activeVariant?.stock || productData.stock || 100})
        </span>

        <button 
          type="button"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: productData.title, url: window.location.href });
            } else if (showToast) {
              showToast('success', 'Link Copied', 'Product link copied to clipboard!');
            }
          }}
          className="flex items-center gap-1 font-bold hover:text-emerald-700 transition-colors cursor-pointer"
          data-reticle-target="pdp-share-btn"
        >
          Share
        </button>
      </div>

      {/* TRUST BADGES */}
      <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-4 grid grid-cols-3 gap-2 text-center mt-6">
        <div className="flex flex-col items-center gap-1 px-1">
          <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-lg shadow-xs">
            🚚
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block leading-tight">Free Shipping</span>
            <span className="text-[10px] text-gray-500 font-medium">Above ₹499</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-1 border-x border-gray-200/80">
          <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-lg shadow-xs">
            🛡️
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block leading-tight">7 Days Free</span>
            <span className="text-[10px] text-gray-500 font-medium">Damage Replacement</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 px-1">
          <div className="w-10 h-10 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-lg shadow-xs">
            🌱
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 block leading-tight">100% Organic</span>
            <span className="text-[10px] text-gray-500 font-medium">Certified Quality</span>
          </div>
        </div>
      </div>
    </div>
  );
}

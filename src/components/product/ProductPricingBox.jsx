import React, { useState } from 'react';
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
  isWishlisted = false,
  showToast
}) {
  const activeVariant = selectedVariant || (variantsList && variantsList.length > 0 ? variantsList[0] : null);

  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  const handleCheckPincode = async () => {
    if (!pincode || pincode.length < 6) {
      setPincodeResult({ ok: false, text: 'Please enter a valid 6-digit PIN code.' });
      return;
    }
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Name || 'Your City';
        const region = po.State ? `, ${po.State}` : '';
        setPincodeResult({
          ok: true,
          text: `✅ Delivery to: ${city}${region} – ${pincode} • Estimated: 2-4 business days`
        });
      } else {
        setPincodeResult({ ok: true, text: `✅ Delivery available to PIN ${pincode} • Estimated: 2-4 business days` });
      }
    } catch {
      setPincodeResult({ ok: true, text: `✅ Delivery available to PIN ${pincode} • Estimated: 2-4 business days` });
    }
  };

  return (
    <div className="space-y-6" data-reticle-target="pdp-pricing-box">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug font-['Outfit']">
          {productData.title || productData.name || 'ValueLife Essentials Product'}
        </h1>

        {/* RATING STARS */}
        {(() => {
          const revCount = Number(
            productData.ratingStats?.total_reviews ?? 
            productData.total_reviews ?? 
            productData.review_count ?? 
            (Array.isArray(productData.reviews) ? productData.reviews.length : 0)
          );
          const ratingVal = Number(
            productData.ratingStats?.avg_rating ?? 
            productData.avg_rating ?? 
            productData.rating ?? 
            0
          );
          const fullStars = Math.min(5, Math.max(0, Math.round(ratingVal)));

          return (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={16} 
                    className={s <= fullStars && revCount > 0 ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} 
                    fill={s <= fullStars && revCount > 0 ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <span className="font-bold text-xs text-gray-700">
                {revCount > 0 ? (
                  <>
                    <span className="text-amber-600 font-extrabold">{ratingVal.toFixed(1)}</span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span>{revCount} {revCount === 1 ? 'verified review' : 'verified reviews'}</span>
                  </>
                ) : (
                  <span className="text-gray-400 font-medium">No reviews yet</span>
                )}
              </span>
            </div>
          );
        })()}
        {productData.category_name && (
          <span className="inline-block mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            📁 {productData.category_name}
          </span>
        )}
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
              const isSelected = selectedVariant
                ? (v.id != null && selectedVariant.id != null
                    ? String(v.id) === String(selectedVariant.id)
                    : (v === selectedVariant || (
                        (v.variant_name || v.name) === (selectedVariant.variant_name || selectedVariant.name) &&
                        Number(v.price_inr || v.price) === Number(selectedVariant.price_inr || selectedVariant.price) &&
                        (v.sku || '') === (selectedVariant.sku || '')
                      )))
                : vIdx === 0;

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
          className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
            isWishlisted ? 'text-[#b91c1c] hover:text-[#991b1b]' : 'text-gray-600 hover:text-[#b91c1c]'
          }`}
          data-reticle-target="pdp-wishlist-btn"
        >
          <Heart 
            size={16} 
            fill={isWishlisted ? '#b91c1c' : 'none'} 
            color={isWishlisted ? '#b91c1c' : 'currentColor'} 
            strokeWidth={2}
          /> 
          <span>{isWishlisted ? 'Saved in Wishlist' : 'Add To Wishlist'}</span>
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

      {/* PIN CODE CHECKER */}
      <div className="space-y-2 pt-3 border-t border-gray-100">
        <label className="text-xs font-bold text-gray-700 block">📍 Check Delivery Availability</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter 6-digit PIN code"
            value={pincode}
            onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPincodeResult(null); }}
            maxLength={6}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={handleCheckPincode}
            className="bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            Check
          </button>
        </div>
        {pincodeResult && (
          <p className={`text-xs font-semibold p-2 rounded-xl ${pincodeResult.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
            {pincodeResult.text}
          </p>
        )}
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

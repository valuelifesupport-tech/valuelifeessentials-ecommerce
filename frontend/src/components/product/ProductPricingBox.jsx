import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, MapPin, Truck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getApiUrl } from '../../api/config';

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

  const [pincode, setPincode] = useState(() => {
    try { return localStorage.getItem('user_delivery_pincode') || ''; } catch (e) { return ''; }
  });
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState(null);

  const handleCheckPincode = async (e) => {
    if (e) e.preventDefault();
    const cleanPin = pincode.trim();
    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      if (showToast) showToast('warning', 'Invalid Pincode', 'Please enter a valid 6-digit Indian pincode.');
      return;
    }

    setCheckingPincode(true);
    setDeliveryResult(null);
    try {
      const res = await fetch(getApiUrl('/api/shipping/shiprocket/check-serviceability'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_pincode: cleanPin,
          weight: 0.5,
          cod: 1
        })
      });
      const data = await res.json();
      if (data.serviceable && data.couriers && data.couriers.length > 0) {
        const fastest = data.couriers[0];
        setDeliveryResult({
          success: true,
          pincode: cleanPin,
          courierName: fastest.name || 'Express Courier',
          days: fastest.estimated_delivery_days || 3,
          etd: fastest.etd || null,
          codAvailable: data.couriers.some(c => c.cod_available)
        });
        try { localStorage.setItem('user_delivery_pincode', cleanPin); } catch (e) {}
      } else {
        setDeliveryResult({
          success: false,
          pincode: cleanPin,
          message: data.message || 'Delivery currently unavailable for this pincode.'
        });
      }
    } catch (err) {
      setDeliveryResult({
        success: false,
        pincode: cleanPin,
        message: 'Could not verify delivery right now. Please try again later.'
      });
    } finally {
      setCheckingPincode(false);
    }
  };

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

      {/* SHIPROCKET LIVE PINCODE CHECKER WIDGET */}
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5" data-reticle-target="pdp-pincode-checker">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-gray-900 flex items-center gap-1.5 font-['Outfit']">
            <Truck size={16} className="text-emerald-700" /> Delivery Availability & Speed
          </span>
          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/60">
            ⚡ Express Courier
          </span>
        </div>

        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              maxLength={6}
              placeholder="Enter 6-digit Pincode"
              value={pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setPincode(val);
                if (deliveryResult) setDeliveryResult(null);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={checkingPincode || pincode.trim().length !== 6}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
          >
            {checkingPincode ? <RefreshCw size={13} className="animate-spin" /> : 'Check'}
          </button>
        </form>

        {deliveryResult && (
          <div className={`p-3 rounded-xl text-xs space-y-1 ${
            deliveryResult.success
              ? 'bg-white border border-emerald-300 text-emerald-950 shadow-xs'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {deliveryResult.success ? (
              <>
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>Deliverable to <b>{deliveryResult.pincode}</b></span>
                </div>
                <div className="text-[11px] text-gray-600 pl-5 space-y-0.5">
                  <p>
                    Estimated delivery in <b>{deliveryResult.days} business days</b> {deliveryResult.etd ? `(${deliveryResult.etd})` : ''} via <b>{deliveryResult.courierName}</b>.
                  </p>
                  <p className="text-emerald-700 font-medium">
                    ✓ {deliveryResult.codAvailable ? 'Cash on Delivery (COD) & Online Payment available' : 'Online Payment available'}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-rose-700">
                <AlertCircle size={15} className="shrink-0" />
                <span>{deliveryResult.message}</span>
              </div>
            )}
          </div>
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

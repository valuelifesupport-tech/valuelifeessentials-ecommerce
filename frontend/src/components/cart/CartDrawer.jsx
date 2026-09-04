import { getApiUrl } from '../../api/config';
import React, { useState } from 'react';
import { X, Trash2, ShieldCheck, Tag, ArrowRight, CreditCard, Banknote, Sparkles, Plus, Check } from 'lucide-react';

const resolveImgUrl = (url, fallback = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80') => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  let clean = url.trim();

  if (clean.startsWith('data:')) return clean;

  if (clean.includes('/uploads/')) {
    const filename = clean.split('/uploads/').pop();
    return getApiUrl(`/api/media/file/${filename}`);
  }

  if (clean.includes('/images/')) {
    const relative = clean.split('/images/').pop();
    return `/images/${relative}`;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return getApiUrl(path);
};

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  currency, 
  currencySymbol,
  onProceedToCheckout,
  settings,
  onAddToCart,
  allProducts = []
}) {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [paymentMode, setPaymentMode] = useState('FULL'); // 'FULL', 'PARTIAL', 'COD'
  const [addedSuggestions, setAddedSuggestions] = useState({});

  if (!isOpen) return null;

  const depositPercent = settings?.partial_deposit_percent || 20;
  const enablePartial = settings?.enable_partial_payment !== 0;
  const isTaxInclusive = Number(settings?.all_prices_include_tax ?? 1) === 1;

  // Calculate Subtotal & GST Tax Amount based on item GST % or store tax rate
  let rawSubtotal = 0;
  let calculatedGstTax = 0;

  cartItems.forEach(item => {
    const itemPrice = item.price !== undefined && item.price !== null ? Number(item.price) : (currency === 'INR' ? (item.discount_inr || item.price_inr || 0) : (item.discount_usd || item.price_usd || 0));
    const itemTotal = itemPrice * item.quantity;
    rawSubtotal += itemTotal;

    const itemGstRate = (item.gst_percent !== undefined && item.gst_percent !== null && item.gst_percent !== '')
      ? Number(item.gst_percent)
      : (settings?.federal_tax_rate ? Number(settings.federal_tax_rate) : 18);

    if (isTaxInclusive) {
      const incGst = itemTotal * (itemGstRate / (100 + itemGstRate));
      calculatedGstTax += incGst;
    } else {
      const addGst = itemTotal * (itemGstRate / 100);
      calculatedGstTax += addGst;
    }
  });

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const afterDiscountSubtotal = Math.max(0, rawSubtotal - discountAmount);

  const finalTaxAmount = Math.round(calculatedGstTax * 100) / 100;
  const finalTotal = isTaxInclusive 
    ? afterDiscountSubtotal 
    : Math.round((afterDiscountSubtotal + finalTaxAmount) * 100) / 100;

  const depositAmount = Math.round(finalTotal * (depositPercent / 100));
  const remainingAmount = finalTotal - depositAmount;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await fetch(getApiUrl('/api/coupons/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, order_amount: rawSubtotal, cart_items: cartItems })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon(data);
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Error validating coupon code');
    }
  };

  const suggestedProducts = (allProducts && allProducts.length > 0)
    ? allProducts.filter(p => !cartItems.some(item => item.id === p.id))
    : [];

  const handleAddSuggestion = (prod) => {
    if (typeof onAddToCart === 'function') {
      onAddToCart(prod);
      setAddedSuggestions(prev => ({ ...prev, [prod.id]: true }));
      setTimeout(() => {
        setAddedSuggestions(prev => ({ ...prev, [prod.id]: false }));
      }, 2500);
    }
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer-content">
        {/* Drawer Header */}
        <div className="p-4 border-b border-emerald-900/20 flex justify-between items-center bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white shadow-md shrink-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛒</span>
            <h3 className="font-extrabold text-white text-lg font-['Outfit']">Your Shopping Cart</h3>
            <span className="bg-emerald-400/20 border border-emerald-300/40 text-emerald-200 text-xs font-black px-2.5 py-0.5 rounded-full">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 text-emerald-100 hover:text-white rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100/60 text-[#2d6a4f] flex items-center justify-center mx-auto text-2xl font-bold">🌱</div>
              <p className="font-extrabold text-gray-800 text-base font-['Outfit']">Your cart is currently empty!</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Explore our 100% certified organic fertilizers and terrace garden boosters.</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const price = item.price !== undefined && item.price !== null ? Number(item.price) : (currency === 'INR' ? (item.discount_inr || item.price_inr || 0) : (item.discount_usd || item.price_usd || 0));
              const itemKey = item.cartKey || item.id;
              const variantName = item.variant_name || item.variant?.variant_name || item.variant?.name || null;

              return (
                <div key={itemKey} className="flex gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group">
                  <img 
                    src={resolveImgUrl(item.thumbnail || item.image_url || item.selectedVariant?.image_url)} 
                    alt={item.title} 
                    className="w-20 h-20 object-cover rounded-xl border border-gray-100 bg-gray-50 shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=200&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="font-extrabold text-sm text-gray-900 line-clamp-1 font-['Outfit']">{item.title}</h4>
                    
                    {variantName && (
                      <div className="mt-1">
                        <span className="inline-block bg-[#f0f7e6] text-[#33691e] border border-[#558b2f]/30 text-[11px] font-extrabold px-2 py-0.5 rounded-md">
                          Variant: {variantName}
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-[#2d6a4f] font-black mt-1">
                      {currencySymbol}{price} <span className="text-gray-400 font-medium text-[11px]">/ unit</span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
                        <button 
                          onClick={() => onUpdateQuantity(itemKey, item.quantity - 1)}
                          className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-black text-gray-900 font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(itemKey, item.quantity + 1)}
                          className="px-3 py-1 text-gray-700 font-bold hover:bg-gray-200 transition-colors cursor-pointer text-xs"
                        >
                          +
                        </button>
                      </div>

                      <button 
                        onClick={() => onRemoveItem(itemKey)}
                        className="text-rose-500 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove item from cart"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* FREQUENTLY BOUGHT TOGETHER / CROSS-SELL SUGGESTIONS WIDGET */}
          {cartItems.length > 0 && suggestedProducts.length > 0 && (
            <div className="pt-3 border-t border-gray-200/80 space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-black text-gray-900 font-['Outfit'] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500 animate-pulse" />
                  <span>Frequently Bought Together</span>
                </span>
                <span className="text-[10px] font-extrabold text-[#2d6a4f] bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                  ⚡ Popular Add-ons
                </span>
              </div>

              <div className="space-y-2">
                {suggestedProducts.slice(0, 3).map((sp) => {
                  const spPrice = currency === 'INR' ? (sp.discount_inr || sp.price_inr) : (sp.discount_usd || sp.price_usd);
                  const isAdded = addedSuggestions[sp.id];

                  return (
                    <div key={sp.id} className="p-2.5 bg-white rounded-xl border border-emerald-100 shadow-sm flex items-center justify-between gap-2.5 hover:border-emerald-300 transition-all">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img 
                          src={resolveImgUrl(sp.thumbnail || sp.image_url)} 
                          alt={sp.title} 
                          className="w-11 h-11 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-extrabold text-xs text-gray-900 truncate font-['Outfit']">{sp.title}</h5>
                          <span className="text-xs font-black text-[#2d6a4f] block">{currencySymbol}{spPrice}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddSuggestion(sp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                          isAdded 
                            ? 'bg-emerald-600 text-white shadow' 
                            : 'bg-emerald-50 hover:bg-[#2d6a4f] text-[#2d6a4f] hover:text-white border border-emerald-200/80'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={13} />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} />
                            <span>+ Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="shrink-0 p-4 border-t border-gray-200 bg-white space-y-3 shadow-2xl overflow-y-auto max-h-[60vh] sm:max-h-none z-10">
            {/* Coupon Code Selector */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={16} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Enter Coupon Code (e.g. ORGANIC15)" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-[#2d6a4f]"
                />
              </div>
              <button type="submit" className="bg-[#2d6a4f] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#1b4332]">
                Apply
              </button>
            </form>

            {couponError && <p className="text-xs text-red-500 font-medium">{couponError}</p>}
            {appliedCoupon && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-2 rounded-lg flex justify-between items-center font-bold">
                <span>✓ Coupon '{appliedCoupon.code}' Applied!</span>
                <button onClick={() => setAppliedCoupon(null)} className="text-red-500">Remove</button>
              </div>
            )}

            {/* Payment Mode Selector (Dynamic Full COD, Partial COD & Prepaid System) */}
            <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-200 space-y-2.5 shadow-sm">
              <span className="text-xs font-extrabold text-amber-900 flex items-center justify-between">
                <span>{settings?.partial_payment_heading || '⚡ Choose Payment Option:'}</span>
                {settings?.enable_cod !== 0 && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-md border border-emerald-300 font-extrabold">
                    ✓ COD Available
                  </span>
                )}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* OPTION 1: 100% PREPAID PAYMENT */}
                <button 
                  type="button"
                  onClick={() => setPaymentMode('FULL')}
                  className={`p-2.5 rounded-xl text-left border flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    paymentMode === 'FULL' 
                      ? 'bg-[#2d6a4f] text-white border-[#2d6a4f] shadow-md ring-2 ring-[#2d6a4f]/20' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-600'
                  }`}
                >
                  <CreditCard size={18} className="text-emerald-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold flex items-center justify-between gap-1">
                      <span>Pay 100% Full</span>
                      {settings?.prepaid_discount_percent > 0 && (
                        <span className="bg-amber-400 text-amber-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                          {settings.prepaid_discount_percent}% OFF
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {settings?.prepaid_discount_percent > 0 
                        ? `Get extra ${settings.prepaid_discount_percent}% Prepaid discount!` 
                        : 'Instant Online Confirmation'}
                    </div>
                  </div>
                </button>

                {/* OPTION 2: FULL CASH ON DELIVERY (100% COD) - SHOWN WHEN COD IS ENABLED ON */}
                {settings?.enable_cod !== 0 && (
                  <button 
                    type="button"
                    onClick={() => setPaymentMode('COD')}
                    className={`p-2.5 rounded-xl text-left border flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                      paymentMode === 'COD' 
                        ? 'bg-[#2d6a4f] text-white border-[#2d6a4f] shadow-md ring-2 ring-[#2d6a4f]/20' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-600'
                    }`}
                  >
                    <Banknote size={18} className="text-amber-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>100% Full COD</span>
                        <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          COD
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80">Pay full cash on delivery</div>
                    </div>
                  </button>
                )}

                {/* OPTION 3: PARTIAL DEPOSIT COD - SHOWN WHEN COD & PARTIAL PAY ARE ON */}
                {settings?.enable_cod !== 0 && settings?.enable_partial_payment === 1 && (
                  <button 
                    type="button"
                    onClick={() => setPaymentMode('PARTIAL')}
                    className={`p-2.5 rounded-xl text-left border flex items-center gap-2 font-semibold transition-all cursor-pointer sm:col-span-2 ${
                      paymentMode === 'PARTIAL' 
                        ? 'bg-[#2d6a4f] text-white border-[#2d6a4f] shadow-md ring-2 ring-[#2d6a4f]/20' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-600'
                    }`}
                  >
                    <ShieldCheck size={18} className="text-emerald-300 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold flex items-center justify-between">
                        <span>Partial {depositPercent}% Deposit</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                          {depositPercent}% NOW
                        </span>
                      </div>
                      <div className="text-[10px] opacity-80">{settings?.partial_payment_subtext || 'Pay rest on Delivery'}</div>
                    </div>
                  </button>
                )}
              </div>

              {/* BREAKDOWN DISPLAY FOR PARTIAL MODE */}
              {paymentMode === 'PARTIAL' && settings?.enable_cod !== 0 && settings?.enable_partial_payment === 1 && (
                <div className="mt-2 p-2.5 bg-white rounded-xl text-[11px] text-gray-700 border border-emerald-200 space-y-1 shadow-inner">
                  <div className="flex justify-between">
                    <span>Pay Deposit Online Now ({depositPercent}%):</span>
                    <strong className="text-emerald-700 font-extrabold">{currencySymbol}{depositAmount}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining Balance Due on Delivery (COD):</span>
                    <strong className="text-amber-900 font-extrabold">{currencySymbol}{remainingAmount}</strong>
                  </div>
                </div>
              )}

              {/* BREAKDOWN DISPLAY FOR FULL COD MODE */}
              {paymentMode === 'COD' && settings?.enable_cod !== 0 && (
                <div className="mt-2 p-2.5 bg-amber-100/70 rounded-xl text-[11px] text-amber-900 border border-amber-300 space-y-1 shadow-inner">
                  <div className="flex justify-between">
                    <span>💵 Online Deposit Required Now:</span>
                    <strong className="text-emerald-800 font-extrabold">{currencySymbol}0 (FREE)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>💵 Total Cash Payable on Delivery (COD):</span>
                    <strong className="text-amber-950 font-black">{currencySymbol}{finalTotal}</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Total Pricing Calculation */}
            <div className="space-y-1.5 text-xs text-gray-600 border-t pt-2">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="font-bold text-gray-900">{currencySymbol}{rawSubtotal}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-{currencySymbol}{discountAmount}</span>
                </div>
              )}

              {appliedCoupon?.free_shipping && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Delivery / Shipping</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-extrabold">FREE 🚚</span>
                </div>
              )}

              {!isTaxInclusive ? (
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>GST Tax (Added at Checkout)</span>
                  <span>+{currencySymbol}{finalTaxAmount}</span>
                </div>
              ) : (
                <div className="flex justify-between text-gray-500 font-medium text-[11px]">
                  <span>GST Tax (Inclusive)</span>
                  <span>(Includes {currencySymbol}{finalTaxAmount} GST)</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t pt-2">
                <span>Total Amount</span>
                <span className="text-emerald-800 text-base">{currencySymbol}{finalTotal}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button 
              onClick={() => onProceedToCheckout({ 
                paymentMode, 
                rawSubtotal,
                discountAmount,
                taxAmount: finalTaxAmount,
                isTaxInclusive,
                finalTotal, 
                depositAmount, 
                remainingAmount, 
                appliedCoupon 
              })}
              className="btn-primary w-full py-3 text-sm font-bold shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

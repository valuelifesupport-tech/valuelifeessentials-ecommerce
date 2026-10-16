import { getApiUrl } from '../../api/config';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import CartItemCard from './CartItemCard';
import CartCrossSell from './CartCrossSell';
import CartPaymentSelector from './CartPaymentSelector';
import CartSummary from './CartSummary';

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

  if (!isOpen) return null;

  const depositPercent = settings?.partial_deposit_percent || 20;
  const isTaxInclusive = Number(settings?.all_prices_include_tax ?? 1) === 1;

  // Calculate Subtotal & GST Tax Amount based on item GST % or store tax rate
  let rawSubtotal = 0;
  let calculatedGstTax = 0;

  cartItems.forEach(item => {
    let itemPrice = item.price !== undefined && item.price !== null && Number(item.price) > 0
      ? Number(item.price) 
      : null;

    if (itemPrice === null && Array.isArray(allProducts) && allProducts.length > 0) {
      const matched = allProducts.find(p => Number(p.id) === Number(item.product_id) || Number(p.id) === Number(item.id) || (p.slug && item.slug && p.slug === item.slug));
      if (matched) {
        const matchedVar = (item.variant_id && matched.variants) ? matched.variants.find(v => Number(v.id) === Number(item.variant_id)) : null;
        if (matchedVar) {
          itemPrice = currency === 'INR'
            ? (Number(matchedVar.discount_inr) > 0 ? Number(matchedVar.discount_inr) : Number(matchedVar.price_inr || 0))
            : (Number(matchedVar.discount_usd) > 0 ? Number(matchedVar.discount_usd) : Number(matchedVar.price_usd || 0));
        } else {
          itemPrice = currency === 'INR'
            ? (Number(matched.discount_inr) > 0 ? Number(matched.discount_inr) : Number(matched.price_inr || matched.price || 0))
            : (Number(matched.discount_usd) > 0 ? Number(matched.discount_usd) : Number(matched.price_usd || 0));
        }
      }
    }

    if (itemPrice === null) {
      itemPrice = currency === 'INR' ? Number(item.discount_inr || item.price_inr || 0) : Number(item.discount_usd || item.price_usd || 0);
    }

    const qty = Math.max(1, Number(item.quantity) || 1);
    const itemTotal = itemPrice * qty;
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

  // Dynamic Shipping Fee Calculation matching backend priceSecurity logic
  const freeShippingThreshold = Number(settings?.free_shipping_threshold) > 0 ? Number(settings.free_shipping_threshold) : 499;
  const standardShippingFee = (settings?.shipping_fee !== undefined && settings?.shipping_fee !== null && settings?.shipping_fee !== '')
    ? Number(settings.shipping_fee)
    : 50;
  const isFreeShippingEnabled = settings?.enable_free_shipping === undefined || Number(settings?.enable_free_shipping) === 1;

  const isFreeShipping = Boolean(
    appliedCoupon?.free_shipping || 
    (isFreeShippingEnabled && afterDiscountSubtotal >= freeShippingThreshold)
  );
  const shippingAmount = isFreeShipping ? 0 : standardShippingFee;

  const finalTaxAmount = Math.round(calculatedGstTax * 100) / 100;
  const finalTotal = isTaxInclusive 
    ? Math.round((afterDiscountSubtotal + shippingAmount) * 100) / 100
    : Math.round((afterDiscountSubtotal + finalTaxAmount + shippingAmount) * 100) / 100;

  const depositAmount = Math.round(finalTotal * (depositPercent / 100));
  const remainingAmount = Math.max(0, finalTotal - depositAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const res = await fetch(getApiUrl('/api/coupons/validate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cart_subtotal: rawSubtotal, order_amount: rawSubtotal, cart_items: cartItems })
      });
      const data = await res.json();
      if (res.ok) {
        setAppliedCoupon({
          ...data,
          discount: data.discount_amount || data.discount || 0,
          free_shipping: data.free_shipping || false
        });
        setCouponError('');
      } else {
        setCouponError(data.error || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Error validating coupon code');
    }
  };

  return (
    <div className="drawer-overlay" data-reticle-target="cart-drawer-modal">
      <div className="drawer-content">
        {/* Drawer Header */}
        <div className="p-4 border-b border-emerald-900/20 flex justify-between items-center bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white shadow-md shrink-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🛒</span>
            <div>
              <h3 className="font-extrabold text-white text-lg font-['Outfit'] leading-tight">Your Shopping Cart</h3>
              <p className="text-[11px] text-emerald-200 font-bold mt-0.5">
                {cartItems.length} {cartItems.length === 1 ? 'Product' : 'Products'} • {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} Total Units
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 text-emerald-100 hover:text-white rounded-full transition-colors cursor-pointer" data-reticle-target="cart-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 bg-slate-50/70 custom-scrollbar">
          {cartItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-3" data-reticle-target="cart-empty-state">
              <div className="w-16 h-16 rounded-full bg-emerald-100/60 text-[#2d6a4f] flex items-center justify-center mx-auto text-2xl font-bold">🌱</div>
              <p className="font-extrabold text-gray-800 text-base font-['Outfit']">Your cart is currently empty!</p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Explore our 100% certified organic fertilizers and terrace garden boosters.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItemCard
                key={item.cartKey || item.id}
                item={item}
                allProducts={allProducts}
                currency={currency}
                currencySymbol={currencySymbol}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
              />
            ))
          )}

          {/* FREQUENTLY BOUGHT TOGETHER / CROSS-SELL SUGGESTIONS WIDGET */}
          <CartCrossSell
            cartItems={cartItems}
            allProducts={allProducts}
            currency={currency}
            currencySymbol={currencySymbol}
            onAddToCart={onAddToCart}
          />
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="p-4 bg-white border-t border-gray-100">
              {/* Payment Mode Selector */}
              <CartPaymentSelector
                settings={settings}
                paymentMode={paymentMode}
                setPaymentMode={setPaymentMode}
                depositPercent={depositPercent}
                currencySymbol={currencySymbol}
                depositAmount={depositAmount}
                remainingAmount={remainingAmount}
                finalTotal={finalTotal}
              />
            </div>

            {/* Total Pricing Calculation & Checkout */}
            <CartSummary
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              couponError={couponError}
              onApplyCoupon={handleApplyCoupon}
              currencySymbol={currencySymbol}
              rawSubtotal={rawSubtotal}
              discountAmount={discountAmount}
              shippingAmount={shippingAmount}
              isFreeShipping={isFreeShipping}
              freeShippingThreshold={freeShippingThreshold}
              isTaxInclusive={isTaxInclusive}
              finalTaxAmount={finalTaxAmount}
              finalTotal={finalTotal}
              onProceedToCheckout={onProceedToCheckout}
              paymentMode={paymentMode}
              depositAmount={depositAmount}
              remainingAmount={remainingAmount}
            />
          </>
        )}
      </div>
    </div>
  );
}

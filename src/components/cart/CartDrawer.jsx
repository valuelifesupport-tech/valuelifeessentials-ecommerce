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
    const itemPrice = item.price !== undefined && item.price !== null 
      ? Number(item.price) 
      : (currency === 'INR' ? (item.discount_inr || item.price_inr || 0) : (item.discount_usd || item.price_usd || 0));
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

  return (
    <div className="drawer-overlay" data-reticle-target="cart-drawer-modal">
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

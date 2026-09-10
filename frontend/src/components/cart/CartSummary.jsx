import React from 'react';
import { Tag, ArrowRight } from 'lucide-react';

export default function CartSummary({
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  couponError,
  onApplyCoupon,
  currencySymbol,
  rawSubtotal,
  discountAmount,
  isTaxInclusive,
  finalTaxAmount,
  finalTotal,
  onProceedToCheckout,
  paymentMode,
  depositAmount,
  remainingAmount
}) {
  return (
    <div className="shrink-0 p-4 border-t border-gray-200 bg-white space-y-3 shadow-2xl overflow-y-auto max-h-[60vh] sm:max-h-none z-10" data-reticle-target="cart-summary-section">
      {/* Coupon Code Selector */}
      <form onSubmit={onApplyCoupon} className="flex gap-2" data-reticle-target="cart-coupon-form">
        <div className="relative flex-1">
          <Tag size={16} className="absolute left-3 top-3 text-gray-400" />
          <input 
            type="text" 
            placeholder="Enter Coupon Code (e.g. ORGANIC15)" 
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:border-[#2d6a4f]"
            data-reticle-target="cart-coupon-input"
          />
        </div>
        <button 
          type="submit" 
          className="bg-[#2d6a4f] text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-[#1b4332] cursor-pointer"
          data-reticle-target="cart-coupon-apply-btn"
        >
          Apply
        </button>
      </form>

      {couponError && <p className="text-xs text-red-500 font-medium" data-reticle-target="cart-coupon-error">{couponError}</p>}
      {appliedCoupon && (
        <div className="bg-emerald-50 text-emerald-800 text-xs p-2 rounded-lg flex justify-between items-center font-bold" data-reticle-target="cart-coupon-applied-badge">
          <span>✓ Coupon '{appliedCoupon.code}' Applied!</span>
          <button onClick={() => setAppliedCoupon(null)} className="text-red-500 cursor-pointer">Remove</button>
        </div>
      )}

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
        className="btn-primary w-full py-3 text-sm font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
        data-reticle-target="cart-proceed-checkout-btn"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

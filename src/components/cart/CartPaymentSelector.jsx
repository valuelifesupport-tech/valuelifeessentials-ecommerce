import React from 'react';
import { CreditCard, Banknote, ShieldCheck } from 'lucide-react';

export default function CartPaymentSelector({
  settings,
  paymentMode,
  setPaymentMode,
  depositPercent,
  currencySymbol,
  depositAmount,
  remainingAmount,
  finalTotal
}) {
  return (
    <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-200 space-y-2.5 shadow-sm" data-reticle-target="cart-payment-selector">
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
          data-reticle-target="cart-pay-full-btn"
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

        {/* OPTION 2: FULL CASH ON DELIVERY (100% COD) - SHOWN WHEN COD IS ENABLED */}
        {settings?.enable_cod !== 0 && (
          <button 
            type="button"
            onClick={() => setPaymentMode('COD')}
            className={`p-2.5 rounded-xl text-left border flex items-center gap-2 font-semibold transition-all cursor-pointer ${
              paymentMode === 'COD' 
                ? 'bg-[#2d6a4f] text-white border-[#2d6a4f] shadow-md ring-2 ring-[#2d6a4f]/20' 
                : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-600'
            }`}
            data-reticle-target="cart-pay-cod-btn"
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
            data-reticle-target="cart-pay-partial-btn"
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
  );
}

import React from 'react';
import { X, Lock } from 'lucide-react';

export default function PaymentGatewayHeader({
  selectedGateway,
  orderNum,
  displayAmount,
  currencySymbol = '₹',
  isProcessing,
  onClose
}) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0c2340] to-[#0284c7] text-white p-5 relative" data-reticle-target="payment-gateway-header">
      <button 
        onClick={onClose} 
        disabled={isProcessing}
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
        data-reticle-target="payment-modal-close-btn"
      >
        <X size={18} />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-black text-lg shadow-inner">
          ⚡
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base tracking-tight font-['Outfit']">
              {selectedGateway === 'razorpay' ? 'Razorpay Secure Checkout' :
               selectedGateway === 'phonepe' ? 'PhonePe Payment Gateway' :
               selectedGateway === 'cashfree' ? 'Cashfree Payments' :
               selectedGateway === 'paytm' ? 'Paytm Gateway' : 'ValueLife Secure Payment'}
            </h3>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              TEST / SANDBOX
            </span>
          </div>
          <p className="text-[11px] text-blue-100/70 flex items-center gap-1 mt-0.5">
            <Lock size={10} /> 256-Bit SSL Encrypted • Test Gateway Simulator
          </p>
        </div>
      </div>

      {/* ORDER AMOUNT SUMMARY STRIP */}
      <div className="mt-4 p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-blue-200 block">Order Reference</span>
          <span className="font-mono text-xs font-bold text-white">{orderNum}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-blue-200 block">Payable Amount</span>
          <span className="font-black text-xl text-emerald-300 font-['Outfit']">
            {currencySymbol}{displayAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

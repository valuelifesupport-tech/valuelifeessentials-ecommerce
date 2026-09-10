import React from 'react';
import { ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export default function PaymentSimulatorFooter({
  isProcessing,
  processStatus,
  displayAmount,
  currencySymbol = '₹',
  selectedGateway,
  onSimulatePayment,
  onClose
}) {
  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2.5" data-reticle-target="payment-modal-footer">
      {isProcessing ? (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-1.5 animate-pulse">
          <RefreshCw className="animate-spin text-blue-600 mx-auto" size={20} />
          <p className="font-extrabold text-xs text-blue-900">
            {processStatus === 'authorizing' ? 'Contacting Payment Gateway Simulator...' :
             processStatus === 'verifying' ? 'Verifying HMAC Signature & Updating Order...' :
             'Confirming transaction...'}
          </p>
          <p className="text-[10px] text-blue-700">Please do not refresh or press back button</p>
        </div>
      ) : (
        <>
          {/* PRIMARY PAY NOW BUTTON (SIMULATE SUCCESS) */}
          <button
            type="button"
            onClick={() => onSimulatePayment(true)}
            className="w-full bg-gradient-to-r from-emerald-600 to-[#2d6a4f] hover:from-emerald-500 hover:to-[#1b4332] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-950/20 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            data-reticle-target="payment-modal-pay-now-btn"
          >
            <ShieldCheck size={18} />
            <span>Pay {currencySymbol}{displayAmount.toFixed(2)} with {selectedGateway.toUpperCase()}</span>
            <ArrowRight size={16} />
          </button>

          {/* DUAL SECONDARY ACTIONS: SIMULATE FAILURE & CANCEL */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSimulatePayment(false)}
              className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-[11px] cursor-pointer transition-colors"
              title="Test how your system handles bank failure"
              data-reticle-target="payment-modal-simulate-failure-btn"
            >
              ⚠️ Simulate Failed Payment
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-bold text-[11px] cursor-pointer transition-colors"
              data-reticle-target="payment-modal-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
        <span>🛡️</span> Encrypted & Verified by ValueLife Essentials Multi-Gateway Engine
      </p>
    </div>
  );
}

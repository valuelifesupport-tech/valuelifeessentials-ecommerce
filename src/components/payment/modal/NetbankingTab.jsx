import React from 'react';

const BANKS = ['HDFC', 'ICICI', 'SBI', 'Axis Bank', 'Kotak', 'PNB'];

export default function NetbankingTab({
  selectedBank,
  setSelectedBank
}) {
  return (
    <div className="space-y-3 text-xs" data-reticle-target="payment-tab-netbanking">
      <span className="font-bold text-gray-700 block mb-1">Select Bank</span>
      <div className="grid grid-cols-3 gap-2">
        {BANKS.map(bank => (
          <button
            key={bank}
            type="button"
            onClick={() => setSelectedBank(bank)}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
              selectedBank === bank
                ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
            data-reticle-target={`bank-select-btn-${bank.toLowerCase().replace(/\s+/g, '-')}`}
          >
            🏛️ {bank}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-gray-500 pt-1">
        You will be redirected to {selectedBank} secure test banking portal for OTP authorization.
      </p>
    </div>
  );
}

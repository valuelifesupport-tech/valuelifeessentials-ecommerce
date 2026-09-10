import React from 'react';

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🟢 GPay' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣 PhonePe' },
  { id: 'paytm', name: 'Paytm UPI', icon: '🔵 Paytm' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🟠 BHIM' }
];

export default function UpiPaymentTab({
  selectedUpiApp,
  setSelectedUpiApp,
  upiId,
  setUpiId
}) {
  return (
    <div className="space-y-4 text-xs" data-reticle-target="payment-tab-upi">
      <div className="grid grid-cols-4 gap-2">
        {UPI_APPS.map(app => (
          <button
            key={app.id}
            type="button"
            onClick={() => setSelectedUpiApp(app.id)}
            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
              selectedUpiApp === app.id
                ? 'border-blue-600 bg-blue-50/80 font-black text-blue-900 shadow-sm ring-1 ring-blue-500'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            data-reticle-target={`upi-app-btn-${app.id}`}
          >
            <span className="block font-bold text-[11px]">{app.icon}</span>
          </button>
        ))}
      </div>

      <div>
        <label className="block font-bold text-gray-700 mb-1">Enter Virtual Payment Address (VPA / UPI ID)</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={upiId} 
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="mobile@upi or username@okhdfcbank"
            className="flex-1 p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
            data-reticle-target="payment-upi-vpa-input"
          />
          <button 
            type="button"
            onClick={() => setUpiId('success@razorpay')}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-[11px] cursor-pointer"
            data-reticle-target="payment-upi-sample-btn"
          >
            Use Sample VPA
          </button>
        </div>
      </div>

      {/* SIMULATED QR CODE SECTION */}
      <div className="p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-blue-200/80 flex items-center gap-3">
        <div className="w-16 h-16 bg-white rounded-xl border border-gray-300 p-1 flex items-center justify-center font-mono text-[9px] text-center shadow-sm shrink-0">
          <div className="space-y-0.5">
            <span className="block font-black text-xs text-blue-900">QR SCAN</span>
            <span className="block text-[8px] text-emerald-600 font-bold">READY</span>
          </div>
        </div>
        <div className="space-y-1 min-w-0">
          <h4 className="font-extrabold text-xs text-gray-900">Scan & Pay using any UPI App</h4>
          <p className="text-[10px] text-gray-600 leading-tight">
            Open Google Pay, PhonePe, Paytm or BHIM on your smartphone to scan and approve.
          </p>
        </div>
      </div>
    </div>
  );
}

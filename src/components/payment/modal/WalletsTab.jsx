import React from 'react';

const WALLETS = [
  { name: 'Paytm Wallet', balance: '₹1,500.00' },
  { name: 'PhonePe Wallet', balance: '₹850.00' },
  { name: 'Amazon Pay Balance', balance: '₹2,400.00' },
  { name: 'MobiKwik', balance: '₹400.00' }
];

export default function WalletsTab() {
  return (
    <div className="space-y-2 text-xs" data-reticle-target="payment-tab-wallets">
      <span className="font-bold text-gray-700 block mb-1">Select Digital Wallet</span>
      <div className="space-y-2">
        {WALLETS.map(w => (
          <div 
            key={w.name}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors"
            data-reticle-target={`wallet-row-${w.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center gap-2">
              <span>👛</span>
              <span className="font-bold text-gray-900">{w.name}</span>
            </div>
            <span className="text-emerald-700 font-mono font-bold text-[11px]">{w.balance}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

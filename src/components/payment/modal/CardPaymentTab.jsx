import React from 'react';

export default function CardPaymentTab({
  cardForm,
  setCardForm
}) {
  return (
    <div className="space-y-3 text-xs" data-reticle-target="payment-tab-card">
      <div className="flex justify-between items-center pb-1">
        <span className="font-bold text-gray-700">Enter Card Details</span>
        <button 
          type="button" 
          onClick={() => setCardForm({ number: '4111 2222 3333 4444', expiry: '12/28', cvv: '999', name: 'Authorized Test User' })}
          className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer"
          data-reticle-target="payment-fill-sample-card-btn"
        >
          ⚡ Fill Sample Test Card
        </button>
      </div>

      <div>
        <label className="block text-gray-600 font-bold mb-1">Card Number</label>
        <input 
          type="text" 
          value={cardForm.number}
          onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
          placeholder="4111 2222 3333 4444"
          className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
          data-reticle-target="payment-card-number-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-600 font-bold mb-1">Expiry Date (MM/YY)</label>
          <input 
            type="text" 
            value={cardForm.expiry}
            onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
            placeholder="12/28"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
            data-reticle-target="payment-card-expiry-input"
          />
        </div>
        <div>
          <label className="block text-gray-600 font-bold mb-1">CVV / CVC</label>
          <input 
            type="password" 
            maxLength={4}
            value={cardForm.cvv}
            onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
            placeholder="888"
            className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
            data-reticle-target="payment-card-cvv-input"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-600 font-bold mb-1">Cardholder Name</label>
        <input 
          type="text" 
          value={cardForm.name}
          onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
          placeholder="Cardholder Name"
          className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
          data-reticle-target="payment-card-name-input"
        />
      </div>
    </div>
  );
}

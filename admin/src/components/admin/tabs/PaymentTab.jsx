import React from 'react';
import { ToggleRight, ToggleLeft } from 'lucide-react';

export default function PaymentTab({
  settingsForm = {},
  setSettingsForm,
  handleSettingsSubmit
}) {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md w-full max-w-5xl space-y-6" data-reticle-target="admin-payment-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PAYMENT ARCHITECTURE</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">Payment Settings & Partial COD Controls</h3>
        <p className="text-xs text-slate-400">Configure Cash on Delivery (COD), partial deposit breakdown %, and prepaid discounts.</p>
      </div>

      <form onSubmit={handleSettingsSubmit} className="space-y-5 text-xs" data-reticle-target="admin-payment-form">
        {/* 1. CASH ON DELIVERY (COD) TOGGLE CONTROL */}
        <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-extrabold text-sm text-white block">Cash on Delivery (COD) Payment Mode</span>
              <p className="text-slate-400 text-xs">Enable or disable Cash on Delivery option for customer checkout.</p>
            </div>

            <button 
              type="button"
              onClick={() => setSettingsForm({ ...settingsForm, enable_cod: settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? 0 : 1 })}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
              data-reticle-target="admin-toggle-cod"
            >
              {settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              <span>{settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? 'COD ENABLED (ON)' : 'COD DISABLED (OFF)'}</span>
            </button>
          </div>
        </div>

        {/* 2. PARTIAL PAYMENT BREAKDOWN CONTROL */}
        <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <span className="font-extrabold text-sm text-white block">Partial Payment Breakdown Control</span>
              <p className="text-slate-400 text-xs">Allow customers to pay a small online deposit (e.g., 20%) and pay the remaining balance on COD delivery.</p>
            </div>

            <button 
              type="button"
              onClick={() => setSettingsForm({ ...settingsForm, enable_partial_payment: settingsForm.enable_partial_payment === 1 ? 0 : 1 })}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                settingsForm.enable_partial_payment === 1 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
              data-reticle-target="admin-toggle-partial-payment"
            >
              {settingsForm.enable_partial_payment === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              <span>{settingsForm.enable_partial_payment === 1 ? 'PARTIAL PAY ON' : 'PARTIAL PAY OFF'}</span>
            </button>
          </div>

          {settingsForm.enable_partial_payment === 1 && (
            <div className="space-y-4 pt-1 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-200 mb-1">
                  <label>Partial Deposit Percentage (%)</label>
                  <span className="text-emerald-400 font-black">{settingsForm.partial_deposit_percent || 20}% DEPOSIT</span>
                </div>
                <input 
                  type="range" min="5" max="50" step="5"
                  value={settingsForm.partial_deposit_percent || 20}
                  onChange={(e) => setSettingsForm({ ...settingsForm, partial_deposit_percent: Number(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                  data-reticle-target="admin-partial-deposit-range"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Payment Breakdown Heading *</label>
                  <input 
                    type="text"
                    value={settingsForm.partial_payment_heading || 'Choose Payment Breakdown Option:'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, partial_payment_heading: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Deposit Button Subtext *</label>
                  <input 
                    type="text"
                    value={settingsForm.partial_payment_subtext || 'Pay rest on Delivery'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, partial_payment_subtext: e.target.value })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. PREPAID FULL PAYMENT DISCOUNT CONTROL */}
        <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-extrabold text-sm text-white block">100% Full Prepaid Payment Discount (%)</span>
              <p className="text-slate-400 text-xs">Offer customers an extra discount percentage when choosing 100% Full Online Payment.</p>
            </div>
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-black px-3 py-1 rounded-full">
              {settingsForm.prepaid_discount_percent || 0}% OFF PREPAID
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="range" min="0" max="25" step="1"
              value={settingsForm.prepaid_discount_percent || 0}
              onChange={(e) => setSettingsForm({ ...settingsForm, prepaid_discount_percent: Number(e.target.value) })}
              className="flex-1 accent-emerald-500 cursor-pointer"
            />
            <input 
              type="number" min="0" max="25"
              value={settingsForm.prepaid_discount_percent || 0}
              onChange={(e) => setSettingsForm({ ...settingsForm, prepaid_discount_percent: Number(e.target.value) })}
              className="w-20 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-center"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg uppercase tracking-wider text-xs cursor-pointer"
          data-reticle-target="admin-save-payment-settings-btn"
        >
          Save Payment Settings Live
        </button>
      </form>
    </div>
  );
}

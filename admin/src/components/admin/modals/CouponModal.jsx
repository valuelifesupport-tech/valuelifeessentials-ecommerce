import React from 'react';
import DiscountStrategyPanel from './coupon/DiscountStrategyPanel';
import CustomerEligibilityCard from './coupon/CustomerEligibilityCard';
import DiscountLimitsCard from './coupon/DiscountLimitsCard';

export default function CouponModal({
  showCouponModal,
  setShowCouponModal,
  setShowDiscountTypeModal,
  selectedDiscountType,
  discountMethod,
  setDiscountMethod,
  setShowBrowseModal,
  browseTargetType,
  setBrowseTargetType,
  setBrowseTargetField,
  discountSelections = {},
  setDiscountSelections,
  eligibilityType,
  setEligibilityType,
  limitTotalUses,
  setLimitTotalUses,
  limitTotalUsesVal,
  setLimitTotalUsesVal,
  limitOnePerCustomer,
  setLimitOnePerCustomer,
  couponForm = {},
  setCouponForm,
  handleCouponSubmit,
  products = [],
  categories = [],
  collections = []
}) {
  if (!showCouponModal || !selectedDiscountType) return null;

  return (
    <div data-reticle-target="admin-coupon-modal" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[9999]">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-4xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => { setShowCouponModal(false); setShowDiscountTypeModal(true); }}
              className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              ‹ Back to discount types
            </button>
            <span className="text-slate-500">•</span>
            <h3 className="font-extrabold text-base text-white">{selectedDiscountType.title}</h3>
          </div>
          <button onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-white font-bold cursor-pointer self-end sm:self-auto">✕</button>
        </div>

        <form onSubmit={handleCouponSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          {/* LEFT COLUMN (2 COLS WIDE) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* METHOD SELECTOR CARD */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-sm text-white block">{selectedDiscountType.title}</span>
              <span className="text-xs text-slate-400 font-semibold block">Method</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountMethod('CODE')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    discountMethod === 'CODE' 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Discount code
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountMethod('AUTO')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    discountMethod === 'AUTO' 
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Automatic discount
                </button>
              </div>

              {discountMethod === 'CODE' && (
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-extrabold text-xs text-slate-300">Discount Code *</label>
                    <button
                      type="button"
                      onClick={() => setCouponForm({ ...couponForm, code: `ORGANIC-${Math.floor(1000 + Math.random() * 9000)}` })}
                      className="text-emerald-400 font-bold text-xs hover:underline"
                    >
                      Generate random code ⚡
                    </button>
                  </div>
                  <input 
                    type="text" required placeholder="e.g. ORGANIC15"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono uppercase font-bold text-sm tracking-wider"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Customers must enter this code at checkout.</span>
                </div>
              )}
            </div>

            <DiscountStrategyPanel 
              selectedDiscountType={selectedDiscountType}
              couponForm={couponForm}
              setCouponForm={setCouponForm}
              discountMethod={discountMethod}
              discountSelections={discountSelections}
              setDiscountSelections={setDiscountSelections}
              setShowBrowseModal={setShowBrowseModal}
              browseTargetType={browseTargetType}
              setBrowseTargetType={setBrowseTargetType}
              setBrowseTargetField={setBrowseTargetField}
              products={products}
              collections={collections}
              categories={categories}
            />

            <CustomerEligibilityCard 
              eligibilityType={eligibilityType}
              setEligibilityType={setEligibilityType}
              discountSelections={discountSelections}
              setDiscountSelections={setDiscountSelections}
              setShowBrowseModal={setShowBrowseModal}
              setBrowseTargetType={setBrowseTargetType}
              setBrowseTargetField={setBrowseTargetField}
            />

            {/* COMMON MINIMUM PURCHASE REQUIREMENTS CARD */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-sm text-white block">Minimum purchase requirements</span>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input 
                    type="radio" name="minReq" 
                    checked={Number(couponForm.min_spend_inr || 0) === 0}
                    onChange={() => setCouponForm({ ...couponForm, min_spend_inr: 0 })}
                    className="accent-emerald-500" 
                  />
                  <span>No minimum requirements</span>
                </label>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                    <input 
                      type="radio" name="minReq" 
                      checked={Number(couponForm.min_spend_inr || 0) > 0}
                      onChange={() => setCouponForm({ ...couponForm, min_spend_inr: couponForm.min_spend_inr || 300 })}
                      className="accent-emerald-500" 
                    />
                    <span>Minimum purchase amount (₹)</span>
                  </label>
                  {Number(couponForm.min_spend_inr || 0) > 0 && (
                    <input 
                      type="number" 
                      placeholder="₹ 300.00"
                      value={couponForm.min_spend_inr}
                      onChange={(e) => setCouponForm({ ...couponForm, min_spend_inr: Math.max(0, Number(e.target.value)) })}
                      className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  )}
                </div>
              </div>
            </div>

            <DiscountLimitsCard 
              limitTotalUses={limitTotalUses}
              setLimitTotalUses={setLimitTotalUses}
              limitTotalUsesVal={limitTotalUsesVal}
              setLimitTotalUsesVal={setLimitTotalUsesVal}
              limitOnePerCustomer={limitOnePerCustomer}
              setLimitOnePerCustomer={setLimitOnePerCustomer}
            />

            {/* COMMON ACTIVE DATES CARD */}
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="font-extrabold text-sm text-white block">Active dates & Description</span>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Start date</label>
                  <input 
                    type="date" 
                    value={couponForm.start_date || ''}
                    onChange={(e) => setCouponForm({ ...couponForm, start_date: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">End date (Optional)</label>
                  <input 
                    type="date" 
                    value={couponForm.end_date || ''}
                    onChange={(e) => setCouponForm({ ...couponForm, end_date: e.target.value })}
                    className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block font-bold text-slate-400 mb-1">Description / Internal Note</label>
                <input 
                  type="text" 
                  placeholder="e.g. Special promotional discount for festival season"
                  value={couponForm.description || ''}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs" 
                />
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (1 COL WIDE) - LIVE SUMMARY CARD */}
          <div className="space-y-4">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 sticky top-0">
              <span className="font-extrabold text-sm text-white block">Discount Summary Preview</span>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="font-mono font-black text-emerald-400 text-base">{couponForm.code || 'NO CODE SET YET'}</div>
                <div className="text-xs text-slate-300 font-bold">{selectedDiscountType.title}</div>
                <div className="text-[10px] text-emerald-400 font-mono">🏷️ {selectedDiscountType.subtitle}</div>

                <ul className="text-[11px] text-slate-400 space-y-1.5 pt-3 border-t border-slate-800">
                  <li className="flex items-center gap-1.5 text-emerald-400">✓ All customers</li>
                  <li className="flex items-center gap-1.5 text-emerald-400">✓ For Online Store</li>
                  <li className="flex items-center gap-1.5">
                    {couponForm.min_spend_inr > 0 ? `✓ Minimum purchase of ₹${couponForm.min_spend_inr}` : '✓ No minimum purchase requirement'}
                  </li>
                  <li className="flex items-center gap-1.5 text-slate-400">✓ Can't combine with other discounts</li>
                  <li className="flex items-center gap-1.5 text-slate-400">✓ Active from today</li>
                </ul>
              </div>

              <button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg text-xs tracking-wider uppercase"
              >
                Save & Activate Discount Code
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

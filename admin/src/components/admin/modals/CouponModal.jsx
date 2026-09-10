import React from 'react';
import { Search } from 'lucide-react';

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

                {/* 1. AMOUNT OFF PRODUCTS SPECIFIC CARD (SCREENSHOT 1) */}
                {selectedDiscountType.id === 'amount_off_products' && (
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="font-extrabold text-sm text-white block">Discount value</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Value Type</label>
                        <select 
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                        >
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FLAT">Fixed Amount (₹ / $)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Discount Value *</label>
                        <input 
                          type="number" required placeholder={couponForm.discount_type === 'PERCENT' ? '15%' : '₹100'}
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Applies to</label>
                      <select 
                        value={browseTargetType}
                        onChange={(e) => setBrowseTargetType(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold mb-2"
                      >
                        <option value="products">Specific products</option>
                        <option value="collections">Specific collections</option>
                        <option value="categories">Specific categories</option>
                      </select>

                      <div className="flex gap-2">
                        <div 
                          onClick={() => { setBrowseTargetField('applies_to'); setShowBrowseModal(true); }}
                          className="relative flex-1 cursor-pointer"
                        >
                          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input 
                            type="text" readOnly
                            placeholder={`Click Browse to select real ${browseTargetType}...`} 
                            value={discountSelections.applies_to.map(item => item.name || item.title).join(', ')}
                            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetField('applies_to'); setShowBrowseModal(true); }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 flex items-center gap-1 shadow-md"
                        >
                          <Search size={14} /> Browse Real Data
                        </button>
                      </div>

                      {/* SELECTED ITEMS TAG PILLS */}
                      {discountSelections.applies_to.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {discountSelections.applies_to.map(item => (
                            <span key={item.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>{item.name || item.title}</span>
                              <button 
                                type="button"
                                onClick={() => setDiscountSelections(prev => ({ ...prev, applies_to: prev.applies_to.filter(i => i.id !== item.id) }))}
                                className="text-emerald-400 hover:text-rose-400 font-bold"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. BUY X GET Y SPECIFIC CARD (SCREENSHOT 2) */}
                {selectedDiscountType.id === 'buy_x_get_y' && (
                  <div className="space-y-4">
                    {/* CUSTOMER BUYS CARD */}
                    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-sm text-white block">Customer buys</span>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                          <input type="radio" name="buyReq" defaultChecked className="accent-emerald-500" />
                          <span>Minimum quantity of items</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                          <input type="radio" name="buyReq" className="accent-emerald-500" />
                          <span>Minimum purchase amount (₹)</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Quantity</label>
                          <input 
                            type="number" min="1"
                            value={couponForm.buy_qty || 1}
                            onChange={(e) => setCouponForm({ ...couponForm, buy_qty: Math.max(1, Number(e.target.value)) })}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" 
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block font-bold text-slate-400 mb-1">Any items from</label>
                          <select 
                            value={browseTargetType}
                            onChange={(e) => setBrowseTargetType(e.target.value)}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="products">Specific products</option>
                            <option value="collections">Specific collections</option>
                            <option value="categories">Specific categories</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" readOnly
                          placeholder={`Select real ${browseTargetType}...`} 
                          value={discountSelections.buys.map(i => i.name || i.title).join(', ')}
                          onClick={() => { setBrowseTargetField('buys'); setShowBrowseModal(true); }}
                          className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer" 
                        />
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetField('buys'); setShowBrowseModal(true); }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 text-xs"
                        >
                          Browse Real Data
                        </button>
                      </div>

                      {discountSelections.buys.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {discountSelections.buys.map(item => (
                            <span key={item.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>{item.name || item.title}</span>
                              <button type="button" onClick={() => setDiscountSelections(prev => ({ ...prev, buys: prev.buys.filter(i => i.id !== item.id) }))} className="text-rose-400">✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* CUSTOMER GETS CARD */}
                    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                      <span className="font-extrabold text-sm text-white block">Customer gets</span>
                      <p className="text-[11px] text-slate-400">Customers must add the quantity of items specified below to their cart.</p>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-400 mb-1">Quantity</label>
                          <input 
                            type="number" min="1"
                            value={couponForm.get_qty || 1}
                            onChange={(e) => setCouponForm({ ...couponForm, get_qty: Math.max(1, Number(e.target.value)) })}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold" 
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block font-bold text-slate-400 mb-1">Any items from</label>
                          <select 
                            value={browseTargetType}
                            onChange={(e) => setBrowseTargetType(e.target.value)}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                          >
                            <option value="products">Specific products</option>
                            <option value="collections">Specific collections</option>
                            <option value="categories">Specific categories</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text" readOnly
                          placeholder={`Select real ${browseTargetType}...`} 
                          value={discountSelections.gets.map(i => i.name || i.title).join(', ')}
                          onClick={() => { setBrowseTargetField('gets'); setShowBrowseModal(true); }}
                          className="flex-1 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer" 
                        />
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetField('gets'); setShowBrowseModal(true); }}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 text-xs"
                        >
                          Browse Real Data
                        </button>
                      </div>

                      {discountSelections.gets.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {discountSelections.gets.map(item => (
                            <span key={item.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>{item.name || item.title}</span>
                              <button type="button" onClick={() => setDiscountSelections(prev => ({ ...prev, gets: prev.gets.filter(i => i.id !== item.id) }))} className="text-rose-400">✕</button>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 space-y-2 border-t border-slate-800">
                        <span className="font-extrabold text-xs text-white block">At a discounted value</span>
                        <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                          <input 
                            type="radio" name="getVal" 
                            checked={couponForm.get_discount_type === 'PERCENT'}
                            onChange={() => setCouponForm({ ...couponForm, get_discount_type: 'PERCENT' })}
                            className="accent-emerald-500" 
                          />
                          <span>Percentage (%)</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                          <input 
                            type="radio" name="getVal" 
                            checked={couponForm.get_discount_type === 'FLAT'}
                            onChange={() => setCouponForm({ ...couponForm, get_discount_type: 'FLAT' })}
                            className="accent-emerald-500" 
                          />
                          <span>Amount off each</span>
                        </label>
                        <label className="flex items-center gap-2 text-slate-200 font-bold text-emerald-400 cursor-pointer">
                          <input 
                            type="radio" name="getVal" 
                            checked={couponForm.get_discount_type === 'FREE'}
                            onChange={() => setCouponForm({ ...couponForm, get_discount_type: 'FREE' })}
                            className="accent-emerald-500" 
                          />
                          <span>Free 🎁</span>
                        </label>
                      </div>

                      <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/80 text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                        <span>⚡ Rule Note:</span>
                        <span>The higher price product is billable. Free/Discounted item applies to equal or lower value items.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. AMOUNT OFF ORDER SPECIFIC CARD (SCREENSHOT 3) */}
                {selectedDiscountType.id === 'amount_off_order' && (
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="font-extrabold text-sm text-white block">Discount value</span>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Value Type</label>
                        <select 
                          value={couponForm.discount_type}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                        >
                          <option value="PERCENT">Percentage (%)</option>
                          <option value="FLAT">Fixed Amount (₹ / $)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">Discount Amount *</label>
                        <input 
                          type="number" required placeholder={couponForm.discount_type === 'PERCENT' ? '15%' : '₹100'}
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: Number(e.target.value) })}
                          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. FREE SHIPPING SPECIFIC CARD (SCREENSHOT 4) */}
                {selectedDiscountType.id === 'free_shipping' && (
                  <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-4">
                    <span className="font-extrabold text-sm text-white block">Countries</span>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                        <input type="radio" name="countryReq" defaultChecked className="accent-emerald-500" />
                        <span>All countries</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                        <input type="radio" name="countryReq" className="accent-emerald-500" />
                        <span>Selected countries</span>
                      </label>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input type="checkbox" className="accent-emerald-500" />
                        <span>Exclude shipping rates over a certain amount</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* COMMON ELIGIBILITY CARD (SCREENSHOT 2) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Eligibility</span>
                  <select 
                    value={eligibilityType}
                    onChange={(e) => setEligibilityType(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                  >
                    <option value="all">All customers</option>
                    <option value="segments">Specific customer segments</option>
                    <option value="specific">Specific customers</option>
                  </select>

                  {(eligibilityType === 'specific' || eligibilityType === 'segments') && (
                    <div className="pt-1 space-y-2">
                      <div className="flex gap-2">
                        <div 
                          onClick={() => { setBrowseTargetType('customers'); setBrowseTargetField('customers'); setShowBrowseModal(true); }}
                          className="relative flex-1 cursor-pointer"
                        >
                          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input 
                            type="text" readOnly
                            placeholder="Search registered customers..." 
                            value={discountSelections.customers.map(c => c.name || c.email).join(', ')}
                            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs cursor-pointer"
                          />
                        </div>
                        <button 
                          type="button" 
                          onClick={() => { setBrowseTargetType('customers'); setBrowseTargetField('customers'); setShowBrowseModal(true); }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg border border-emerald-500 text-xs shadow-md"
                        >
                          Browse
                        </button>
                      </div>

                      {discountSelections.customers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {discountSelections.customers.map(c => (
                            <span key={c.id} className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <span>👤 {c.name} ({c.email})</span>
                              <button type="button" onClick={() => setDiscountSelections(prev => ({ ...prev, customers: prev.customers.filter(i => i.id !== c.id) }))} className="text-rose-400">✕</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

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

                {/* MAXIMUM DISCOUNT USES CARD (SCREENSHOT 1) */}
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                  <span className="font-extrabold text-sm text-white block">Maximum discount uses</span>

                  <div className="space-y-2 text-slate-200 text-xs">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer font-medium">
                        <input 
                          type="checkbox" 
                          checked={limitTotalUses} 
                          onChange={(e) => setLimitTotalUses(e.target.checked)}
                          className="accent-emerald-500 w-4 h-4 rounded" 
                        />
                        <span>Limit number of times this discount can be used in total</span>
                      </label>
                      {limitTotalUses && (
                        <div className="mt-2 pl-6">
                          <input 
                            type="number" 
                            value={limitTotalUsesVal}
                            onChange={(e) => setLimitTotalUsesVal(Number(e.target.value))}
                            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-xs"
                            placeholder="e.g. 100 uses total"
                          />
                        </div>
                      )}
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer font-medium pt-1">
                      <input 
                        type="checkbox" 
                        checked={limitOnePerCustomer} 
                        onChange={(e) => setLimitOnePerCustomer(e.target.checked)}
                        className="accent-emerald-500 w-4 h-4 rounded" 
                      />
                      <span>Limit to one use per customer</span>
                    </label>
                  </div>
                </div>

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

import React from 'react';
import { Search } from 'lucide-react';
import SelectedItemsPills from './SelectedItemsPills';

export default function DiscountStrategyPanel({
  selectedDiscountType,
  couponForm,
  setCouponForm,
  discountSelections,
  setDiscountSelections,
  setShowBrowseModal,
  browseTargetType,
  setBrowseTargetType,
  setBrowseTargetField
}) {
  return (
    <>
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

            <SelectedItemsPills 
              items={discountSelections.applies_to} 
              onRemove={(id) => setDiscountSelections(prev => ({ ...prev, applies_to: prev.applies_to.filter(i => i.id !== id) }))}
            />
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

            <SelectedItemsPills 
              items={discountSelections.buys} 
              onRemove={(id) => setDiscountSelections(prev => ({ ...prev, buys: prev.buys.filter(i => i.id !== id) }))}
            />
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

            <SelectedItemsPills 
              items={discountSelections.gets} 
              onRemove={(id) => setDiscountSelections(prev => ({ ...prev, gets: prev.gets.filter(i => i.id !== id) }))}
            />

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
    </>
  );
}

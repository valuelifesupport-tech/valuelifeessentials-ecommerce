import React from 'react';
import { convertInrToUsd, sanitizeNumericInput } from '../../../../utils/currency';

export default function ProductPricingSection({ productForm, setProductForm }) {
  return (
    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
      <span className="font-extrabold text-sm text-white block">Pricing & Profit Margins</span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-emerald-400 font-bold mb-1 text-xs">Price INR (₹) *</label>
          <input 
            type="number" min="0" required placeholder="₹ 0.00"
            value={productForm.price_inr ?? ''}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
              const autoUsd = (val !== '' && val > 0) ? convertInrToUsd(val) : '';
              setProductForm(prev => ({ 
                ...prev, 
                price_inr: val, 
                discount_inr: val,
                price_usd: autoUsd,
                discount_usd: autoUsd
              }));
            }}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-emerald-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-blue-400 font-bold mb-1 text-xs">Price USD ($) *</label>
          <input 
            type="number" min="0" required placeholder="$ 0.00" step="0.01"
            value={productForm.price_usd ?? ''}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
              setProductForm(prev => ({ 
                ...prev, 
                price_usd: val, 
                discount_usd: val 
              }));
            }}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-blue-400 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div>
          <label className="block text-slate-300 font-medium mb-1 text-xs">Compare-at Price INR (₹)</label>
          <input 
            type="number" min="0" placeholder="₹ Original / MRP (INR)"
            value={productForm.compare_price_inr ?? ''}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
              const autoUsd = (val !== '' && val > 0) ? convertInrToUsd(val) : '';
              setProductForm(prev => ({ 
                ...prev, 
                compare_price_inr: val,
                compare_price_usd: autoUsd
              }));
            }}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-blue-300 font-medium mb-1 text-xs">Compare-at Price USD ($)</label>
          <input 
            type="number" min="0" placeholder="$ Original / MRP (USD)" step="0.01"
            value={productForm.compare_price_usd ?? ''}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
              setProductForm(prev => ({ ...prev, compare_price_usd: val }));
            }}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-blue-200 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
        <div>
          <label className="block text-slate-400 mb-1 text-xs">Cost per item INR (₹)</label>
          <input 
            type="number" min="0" placeholder="₹ Supplier Cost (INR)"
            value={productForm.cost_per_item_inr ?? ''}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
              const autoUsd = (val !== '' && val > 0) ? convertInrToUsd(val) : '';
              setProductForm(prev => ({ 
                ...prev, 
                cost_per_item_inr: val,
                cost_per_item_usd: autoUsd
              }));
            }}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs"
          />
        </div>
        <div>
          <label className="block text-blue-400/80 mb-1 text-xs">Cost per item USD ($)</label>
          <input 
            type="number" min="0" placeholder="$ Supplier Cost (USD)" step="0.01"
            value={productForm.cost_per_item_usd ?? ''}
            onWheel={(e) => e.target.blur()}
            onChange={(e) => {
              const val = e.target.value === '' ? '' : sanitizeNumericInput(e.target.value);
              setProductForm(prev => ({ ...prev, cost_per_item_usd: val }));
            }}
            className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-blue-300 text-xs"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800">
        <label className="block text-amber-400 font-bold mb-1 flex items-center gap-1.5 text-xs">
          <span>🏷️ Product Specific GST Tax Rate (%)</span>
        </label>
        <select
          value={productForm.gst_percent ?? ''}
          onChange={(e) => setProductForm({ ...productForm, gst_percent: e.target.value === '' ? '' : Number(e.target.value) })}
          className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer focus:border-amber-500 text-xs"
        >
          <option value="">⚙️ Default (Inherit Store / Collection Tax Rate)</option>
          <option value="0">0% GST (Tax Exempt / Nil Rated)</option>
          <option value="5">5% GST (Organic Fertilizers & Seeds)</option>
          <option value="12">12% GST (Bio-Pesticides & Processed Goods)</option>
          <option value="18">18% GST (Garden Tools & Equipment)</option>
          <option value="28">28% GST (Luxury Goods)</option>
        </select>
        <p className="text-[11px] text-slate-400 mt-1">
          💡 Setting a custom GST rate here overrides the default store & collection tax rates for this specific product.
        </p>
      </div>
    </div>
  );
}

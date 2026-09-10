import React from 'react';
import { XCircle, Trash2 } from 'lucide-react';

export default function ManageVariantsModal({
  selectedProductForVariants,
  setSelectedProductForVariants,
  handleDeleteVariant,
  handleAddVariant,
  variantForm = {},
  setVariantForm
}) {
  if (!selectedProductForVariants) return null;

  return (
    <div className="drawer-overlay flex items-center justify-center p-2 sm:p-4 z-50" data-reticle-target="admin-manage-variants-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl sm:rounded-3xl max-w-4xl w-full p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 shadow-2xl max-h-[94vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white">Variant Pills CRUD Manager</h3>
            <p className="text-xs text-emerald-400">{selectedProductForVariants.title}</p>
          </div>
          <button 
            type="button"
            onClick={() => setSelectedProductForVariants(null)} 
            className="cursor-pointer text-slate-400 hover:text-white"
          >
            <XCircle size={24} />
          </button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Existing Variant Pills:</span>
          {selectedProductForVariants.variants?.map(v => (
            <div key={v.id} className="p-3 border border-slate-800 bg-slate-850 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-white">{v.variant_name}</span>
                <div className="text-[11px] text-emerald-400 font-bold flex flex-wrap items-center gap-2">
                  <span>Offer Price: ₹{v.discount_inr || v.price_inr}</span>
                  {v.price_inr > (v.discount_inr || v.price_inr) && (
                    <span className="text-slate-400 line-through text-[10px]">MRP: ₹{v.price_inr}</span>
                  )}
                  <span className="text-blue-400">(${v.discount_usd || v.price_usd})</span>
                  <span className="text-slate-300">Stock: {v.stock}</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => handleDeleteVariant(v.id)} 
                className="bg-rose-900/50 text-rose-300 p-1.5 rounded-lg border border-rose-700 hover:bg-rose-800 cursor-pointer shrink-0"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddVariant} className="space-y-3 border-t border-slate-800 pt-3 text-xs">
          <span className="font-bold text-white block">+ Add New Variant Pill:</span>
          <input 
            type="text" required
            placeholder="Variant Pill Name (e.g. Pack of 1, 5 Kg, 500ml)" 
            value={variantForm.variant_name || ''}
            onChange={(e) => setVariantForm({ ...variantForm, variant_name: e.target.value })}
            className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
          />

          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-emerald-400 mb-1">Offer / Sale Price INR (₹) *</label>
                <input 
                  type="number" min="0" required placeholder="Offer Price (e.g. 249)"
                  value={variantForm.discount_inr || ''}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setVariantForm({ ...variantForm, discount_inr: Math.max(0, Number(e.target.value)) })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Compare At / MRP (₹)</label>
                <input 
                  type="number" min="0" placeholder="MRP Price (e.g. 349)"
                  value={variantForm.price_inr || ''}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setVariantForm({ ...variantForm, price_inr: Math.max(0, Number(e.target.value)) })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-blue-400 mb-1">Offer USD ($) *</label>
                <input 
                  type="number" min="0" step="0.01" required placeholder="Offer USD"
                  value={variantForm.discount_usd || ''}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setVariantForm({ ...variantForm, discount_usd: Math.max(0, Number(e.target.value)) })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Compare USD ($)</label>
                <input 
                  type="number" min="0" step="0.01" placeholder="MRP USD"
                  value={variantForm.price_usd || ''}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setVariantForm({ ...variantForm, price_usd: Math.max(0, Number(e.target.value)) })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-300 mb-1">Stock Qty *</label>
                <input 
                  type="number" min="0" required placeholder="Stock"
                  value={variantForm.stock || ''}
                  onWheel={(e) => e.target.blur()}
                  onChange={(e) => setVariantForm({ ...variantForm, stock: Math.max(0, Number(e.target.value)) })}
                  className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                />
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-lg cursor-pointer">
            Save & Create Variant Pill
          </button>
        </form>
      </div>
    </div>
  );
}

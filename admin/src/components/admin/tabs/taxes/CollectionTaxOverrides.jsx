import React from 'react';
import { Trash2 } from 'lucide-react';

export default function CollectionTaxOverrides({
  collections,
  newOverrideForm,
  setNewOverrideForm,
  handleCreateTaxOverride,
  taxOverrides,
  handleDeleteTaxOverride,
  stateTaxRates
}) {
  return (
    <div className="pt-4 border-t border-slate-800 space-y-4">
      <div>
        <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
          📦 Product Collection Tax Overrides & Exemptions
        </h4>
        <p className="text-slate-400 text-xs">Create custom tax rates for specific product collections/categories per state region.</p>
      </div>

      <form onSubmit={handleCreateTaxOverride} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Override Label / Title *</label>
            <input 
              type="text" required
              placeholder="e.g. Bio-Fertilizers 5% Tax Slab"
              value={newOverrideForm.title || ''}
              onChange={(e) => setNewOverrideForm({ ...newOverrideForm, title: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Select Product Collection *</label>
            <select 
              required
              value={newOverrideForm.collection_id || ''}
              onChange={(e) => setNewOverrideForm({ ...newOverrideForm, collection_id: e.target.value ? Number(e.target.value) : '' })}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer"
            >
              <option value="">-- Select Collection --</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Applicable Region State *</label>
            <select 
              value={newOverrideForm.state_name || 'ALL'}
              onChange={(e) => setNewOverrideForm({ ...newOverrideForm, state_name: e.target.value })}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer"
            >
              <option value="ALL">All India (National Collection Tax)</option>
              {stateTaxRates.map(st => (
                <option key={st.id} value={st.state_name}>{st.state_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Custom Collection Tax Rate (%) *</label>
            <select 
              value={newOverrideForm.tax_rate ?? 5.0}
              onChange={(e) => setNewOverrideForm({ ...newOverrideForm, tax_rate: parseFloat(e.target.value) })}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-extrabold cursor-pointer"
            >
              <option value={0}>0% (Tax Exempt Collection)</option>
              <option value={5.0}>5% (Fertilizers & Seeds)</option>
              <option value={12.0}>12% (Processed Foods)</option>
              <option value={18.0}>18% (Supplements & Garden Tools)</option>
              <option value={28.0}>28% (Luxury Goods)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-2 rounded-lg text-xs shadow-md cursor-pointer flex items-center gap-1.5"
          >
            + Add Collection Tax Override
          </button>
        </div>
      </form>

      {taxOverrides.length > 0 && (
        <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-12 bg-slate-900 p-2.5 font-bold text-slate-400 text-[11px] uppercase border-b border-slate-800">
            <div className="col-span-3">Override Label</div>
            <div className="col-span-3">Target Collection</div>
            <div className="col-span-3">State Region</div>
            <div className="col-span-2">Tax Rate</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {taxOverrides.map((ov) => (
              <div key={ov.id} className="grid grid-cols-12 p-2.5 bg-slate-850 hover:bg-slate-800 items-center text-xs">
                <div className="col-span-3 font-bold text-white">{ov.title}</div>
                <div className="col-span-3 text-emerald-400 font-bold">{ov.collection_name || 'All Collections'}</div>
                <div className="col-span-3 text-slate-300 font-mono text-[11px]">{ov.state_name}</div>
                <div className="col-span-2 text-emerald-300 font-extrabold">{ov.tax_rate}% GST</div>
                <div className="col-span-1 text-right">
                  <button 
                    type="button"
                    onClick={() => handleDeleteTaxOverride && handleDeleteTaxOverride(ov.id)}
                    className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-950/60 rounded cursor-pointer"
                    title="Delete Tax Override"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

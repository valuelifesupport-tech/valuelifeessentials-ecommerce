import React from 'react';
import { ToggleRight, ToggleLeft } from 'lucide-react';

export default function StateTaxRatesTable({
  settingsForm,
  setSettingsForm,
  updateAndSaveSettingToggle,
  stateTaxRates,
  setStateTaxRates,
  taxPage,
  setTaxPage,
  taxesPerPage,
  handleResetStateTaxRates,
  handleSaveStateTaxRates
}) {
  return (
    <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-5 shadow-md">
      <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[11px] font-bold text-slate-400 block font-mono">
            🛍️ Taxes & Duties &gt; India &gt; Regional Base Taxes
          </span>
          <h3 className="font-extrabold text-base text-white font-['Outfit']">
            Base Taxes & Regional Tax Rates
          </h3>
          <p className="text-slate-400 text-xs">Configure state-wise tax rates, IGST / SGST labels, and create product collection tax overrides.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Manual Tax • Active (Free service)
          </span>
        </div>
      </div>

      <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-extrabold text-xs text-white block">
              🏷️ Tax Calculation Mode: {Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? 'TAX INCLUSIVE (All prices include tax)' : 'TAX EXCLUSIVE (Tax added at checkout)'}
            </span>
            <p className="text-slate-400 text-[11px]">
              {Number(settingsForm.all_prices_include_tax ?? 1) === 1 
                ? 'Product prices in store already include all taxes. Tax is extracted at checkout.' 
                : 'Product prices are net. Applicable state GST is calculated & added on top at checkout.'}
            </p>
          </div>

          <button 
            type="button"
            onClick={() => {
              const newVal = Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? 0 : 1;
              setSettingsForm({ ...settingsForm, all_prices_include_tax: newVal });
              if (typeof updateAndSaveSettingToggle === 'function') {
                updateAndSaveSettingToggle('all_prices_include_tax', newVal);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              Number(settingsForm.all_prices_include_tax ?? 1) === 1 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-amber-600 text-white shadow-lg'
            }`}
          >
            {Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{Number(settingsForm.all_prices_include_tax ?? 1) === 1 ? 'INCLUSIVE (INCLUDED)' : 'EXCLUSIVE (ADDED AT CHECKOUT)'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-extrabold text-sm text-white">Base Taxes (Regions)</h4>
          
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleResetStateTaxRates}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              Reset to default tax rates
            </button>

            <button 
              type="button"
              onClick={handleSaveStateTaxRates}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-lg shadow-md cursor-pointer"
            >
              Save State Tax Rates
            </button>
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
          <div className="grid grid-cols-12 bg-slate-900 p-3 font-extrabold text-slate-300 border-b border-slate-800 text-[11px] uppercase tracking-wider">
            <div className="col-span-3">Regions</div>
            <div className="col-span-2">Tax Rate %</div>
            <div className="col-span-3">Tax Name / Label</div>
            <div className="col-span-4">Tax Rule Behavior</div>
          </div>

          <div className="grid grid-cols-12 p-3 bg-slate-850 border-b border-slate-800/80 items-center font-bold text-white">
            <div className="col-span-3 font-extrabold text-sm">India (Federal Base)</div>
            <div className="col-span-2 flex items-center gap-1">
              <input 
                type="number" step="0.1" 
                value={settingsForm.federal_tax_rate ?? 0}
                onChange={(e) => setSettingsForm({ ...settingsForm, federal_tax_rate: parseFloat(e.target.value) || 0 })}
                className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold text-center"
              />
              <span className="text-slate-400">%</span>
            </div>
            <div className="col-span-3 text-slate-400 font-mono text-[11px]">FEDERAL GST</div>
            <div className="col-span-4 text-slate-400 text-[11px]">Country Level Default Base Tax</div>
          </div>

          {(() => {
            const totalTaxPages = Math.ceil(stateTaxRates.length / taxesPerPage);
            const startIndex = (taxPage - 1) * taxesPerPage;
            const currentStates = stateTaxRates.slice(startIndex, startIndex + taxesPerPage);

            return (
              <div className="divide-y divide-slate-800/60">
                {currentStates.map((st) => (
                  <div key={st.id} className="grid grid-cols-12 p-3 hover:bg-slate-800/50 items-center text-xs">
                    <div className="col-span-3 font-bold text-slate-200">{st.state_name}</div>
                    <div className="col-span-2 flex items-center gap-1">
                      <input 
                        type="number" step="0.1"
                        value={st.tax_rate}
                        onChange={(e) => {
                          const newVal = parseFloat(e.target.value) || 0;
                          setStateTaxRates(stateTaxRates.map(item => item.id === st.id ? { ...item, tax_rate: newVal } : item));
                        }}
                        className="w-16 p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono font-extrabold text-center"
                      />
                      <span className="text-slate-400 font-bold">%</span>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text"
                        value={st.tax_label || 'IGST'}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setStateTaxRates(stateTaxRates.map(item => item.id === st.id ? { ...item, tax_label: newVal } : item));
                        }}
                        className="w-full max-w-[120px] p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                    <div className="col-span-4">
                      <select 
                        value={st.tax_rule || 'INSTEAD_OF_FEDERAL'}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setStateTaxRates(stateTaxRates.map(item => item.id === st.id ? { ...item, tax_rule: newVal } : item));
                        }}
                        className="w-full p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-[11px] font-medium cursor-pointer"
                      >
                        <option value="INSTEAD_OF_FEDERAL">instead of 0% federal tax</option>
                        <option value="ADDED_TO_FEDERAL">added to 0% federal tax</option>
                        <option value="COMPOUNDED">compounded on 0% federal tax</option>
                      </select>
                    </div>
                  </div>
                ))}

                <div className="p-3 bg-slate-900 flex justify-between items-center border-t border-slate-800">
                  <span className="text-[11px] text-slate-400 font-bold">
                    Showing {startIndex + 1} - {Math.min(startIndex + taxesPerPage, stateTaxRates.length)} of {stateTaxRates.length} State Regions
                  </span>

                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      disabled={taxPage === 1}
                      onClick={() => setTaxPage(taxPage - 1)}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs ${
                        taxPage === 1 ? 'border-slate-800 text-slate-600 bg-slate-850 cursor-not-allowed' : 'border-slate-700 text-white bg-slate-800 hover:bg-slate-700 cursor-pointer'
                      }`}
                    >
                      ‹
                    </button>
                    <span className="px-2 font-mono text-xs text-emerald-400 font-bold">{taxPage} / {totalTaxPages || 1}</span>
                    <button 
                      type="button"
                      disabled={taxPage >= totalTaxPages}
                      onClick={() => setTaxPage(taxPage + 1)}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-xs ${
                        taxPage >= totalTaxPages ? 'border-slate-800 text-slate-600 bg-slate-850 cursor-not-allowed' : 'border-slate-700 text-white bg-slate-800 hover:bg-slate-700 cursor-pointer'
                      }`}
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { ToggleRight, ToggleLeft, Download, Trash2 } from 'lucide-react';

export default function TaxesTab({
  settingsForm = {},
  setSettingsForm,
  updateAndSaveSettingToggle,
  handleDownloadGstCSV,
  onUpdateSettings,
  selectedGstMonth,
  setSelectedGstMonth,
  gstSummaryData,
  handleResetStateTaxRates,
  handleSaveStateTaxRates,
  stateTaxRates = [],
  setStateTaxRates,
  taxOverrides = [],
  taxPage = 1,
  setTaxPage,
  taxesPerPage = 12,
  newOverrideForm = {},
  setNewOverrideForm,
  handleCreateTaxOverride,
  handleDeleteTaxOverride,
  collections = []
}) {
  return (
    <div className="space-y-6 w-full max-w-5xl" data-reticle-target="admin-taxes-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">INDIAN GST & REGIONAL TAX STUDIO</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">🏛️ Taxes & GST Management Center</h3>
        <p className="text-xs text-slate-400">Configure global GSTIN, State-wise regional tax rates, Tax Inclusive/Exclusive rules, and export tax ledger reports.</p>
      </div>

      {/* GST TAX CONFIGURATION & INVOICE SETTINGS CARD */}
      <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="font-extrabold text-sm text-white block flex items-center gap-2">
              🏛️ GST Tax & Invoice Configuration (Indian GST System)
            </span>
            <p className="text-slate-400 text-xs">Configure Store GSTIN, Tax Rates, CGST/SGST vs IGST state splitting, and export tax ledger CSV.</p>
          </div>

          <button 
            type="button"
            onClick={() => {
              const newVal = Number(settingsForm.enable_gst ?? 1) === 1 ? 0 : 1;
              if (typeof updateAndSaveSettingToggle === 'function') {
                updateAndSaveSettingToggle('enable_gst', newVal);
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              Number(settingsForm.enable_gst ?? 1) === 1 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {Number(settingsForm.enable_gst ?? 1) === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{Number(settingsForm.enable_gst ?? 1) === 1 ? 'GST TAX ENABLED' : 'GST TAX DISABLED'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Store GSTIN Identification Number *</label>
            <input 
              type="text" 
              placeholder="e.g. 27AAAAA0000A1Z5"
              value={settingsForm.gstin_number || '27AAAAA0000A1Z5'}
              onChange={(e) => setSettingsForm({ ...settingsForm, gstin_number: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Legal Business / Entity Name *</label>
            <input 
              type="text" 
              placeholder="e.g. VALUELIFE ESSENTIALS Retail Pvt Ltd"
              value={settingsForm.legal_business_name || 'ValueLife Essentials Private Limited'}
              onChange={(e) => setSettingsForm({ ...settingsForm, legal_business_name: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Store Base State (for CGST/SGST vs IGST) *</label>
            <select 
              value={settingsForm.store_state || 'Maharashtra'}
              onChange={(e) => setSettingsForm({ ...settingsForm, store_state: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold cursor-pointer"
            >
              {[
                "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
                "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
                "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
                "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
                "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
                "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
                "Uttarakhand", "West Bengal"
              ].map(stName => (
                <option key={stName} value={stName}>{stName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Default GST Rate (%) *</label>
            <select 
              value={settingsForm.default_gst_percent ?? 5.0}
              onChange={(e) => setSettingsForm({ ...settingsForm, default_gst_percent: Number(e.target.value) })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-extrabold cursor-pointer"
            >
              <option value={0}>0% (Exempt / Nil Rated)</option>
              <option value={5.0}>5% (Organic Groceries & Fertilizers)</option>
              <option value={12.0}>12% (Processed Organic Foods)</option>
              <option value={18.0}>18% (Supplements & Garden Tools)</option>
              <option value={28.0}>28% (Luxury Goods)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <button 
            type="button"
            onClick={handleDownloadGstCSV}
            className="bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download size={15} /> 📥 Export GST Tax Register (CSV for CA)
          </button>

          <button 
            type="button"
            onClick={() => onUpdateSettings && onUpdateSettings(settingsForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2 rounded-xl shadow-md cursor-pointer"
          >
            Save GST Tax Settings
          </button>
        </div>
      </div>

      {/* MONTHLY GST TAX LEDGER & CSV EXPORT CARD */}
      <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2 font-['Outfit']">
              📅 Monthly GST Tax Register & CA CSV Export
            </h3>
            <p className="text-slate-400 text-xs">Filter tax liability by month and download month-specific GST reports for CA tax filing.</p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={selectedGstMonth}
              onChange={(e) => setSelectedGstMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-extrabold px-3 py-2 rounded-xl cursor-pointer shadow-inner"
            >
              <option value="ALL">📅 All Months (Cumulative Report)</option>
              {(gstSummaryData?.availableMonths || ['2026-08', '2026-07', '2026-06']).map(mKey => {
                const dateObj = new Date(`${mKey}-01`);
                const monthLabel = isNaN(dateObj.getTime()) ? mKey : dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                return (
                  <option key={mKey} value={mKey}>{monthLabel} ({mKey})</option>
                );
              })}
            </select>

            <button 
              type="button"
              onClick={() => handleDownloadGstCSV && handleDownloadGstCSV(selectedGstMonth)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Download size={15} /> 📥 Export {selectedGstMonth === 'ALL' ? 'All Months' : selectedGstMonth} CSV
            </button>
          </div>
        </div>

        {/* MONTH-FILTERED GST KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total GST Liability</span>
            <div className="text-2xl font-black text-emerald-400">₹{(gstSummaryData?.totalGst || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">{selectedGstMonth === 'ALL' ? 'All Time GST' : `Month: ${selectedGstMonth}`}</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Central Tax (CGST 50%)</span>
            <div className="text-2xl font-black text-blue-400">₹{(gstSummaryData?.totalCgst || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">Intra-State CGST</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">State Tax (SGST 50%)</span>
            <div className="text-2xl font-black text-purple-400">₹{(gstSummaryData?.totalSgst || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">Intra-State SGST</span>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Integrated Tax (IGST)</span>
            <div className="text-2xl font-black text-amber-400">₹{(gstSummaryData?.totalIgst || 0).toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-slate-500">Inter-State IGST</span>
          </div>
        </div>
      </div>

      {/* SHOPIFY-STYLE BASE TAXES & REGIONAL STATE TAX COLLECTION MANAGER */}
      <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-5 shadow-md">
        {/* HEADER & BREADCRUMB */}
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

        {/* TAX INCLUSIVE VS EXCLUSIVE ADMIN TOGGLE */}
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

        {/* BASE TAXES STATE REGIONS TABLE */}
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
            {/* HEADER ROW */}
            <div className="grid grid-cols-12 bg-slate-900 p-3 font-extrabold text-slate-300 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <div className="col-span-3">Regions</div>
              <div className="col-span-2">Tax Rate %</div>
              <div className="col-span-3">Tax Name / Label</div>
              <div className="col-span-4">Tax Rule Behavior</div>
            </div>

            {/* INDIA FEDERAL COUNTRY ROW */}
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

            {/* 36 INDIAN STATES REGION ROWS WITH PAGINATION */}
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

                  {/* PAGINATION CONTROLS */}
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

        {/* COLLECTION TAX OVERRIDES MANAGER */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          <div>
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              📦 Product Collection Tax Overrides & Exemptions
            </h4>
            <p className="text-slate-400 text-xs">Create custom tax rates for specific product collections/categories per state region.</p>
          </div>

          {/* CREATE OVERRIDE FORM */}
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

          {/* ACTIVE OVERRIDES TABLE */}
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
      </div>
    </div>
  );
}

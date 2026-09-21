import React from 'react';
import { ToggleRight, ToggleLeft, Download } from 'lucide-react';

export default function GstConfigCard({
  settingsForm = {},
  setSettingsForm,
  updateAndSaveSettingToggle,
  onUpdateSettings,
  handleDownloadGstCSV,
  selectedGstMonth
}) {
  return (
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
          onClick={() => handleDownloadGstCSV && handleDownloadGstCSV(selectedGstMonth, 'ALL')}
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
  );
}

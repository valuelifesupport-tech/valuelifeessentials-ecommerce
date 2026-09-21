import React from 'react';
import { Download, RotateCcw, CheckCircle2 } from 'lucide-react';
import { formatInr } from '../../../../utils/currency';

export default function MonthlyReconciliationKpis({
  selectedGstMonth,
  setSelectedGstMonth,
  handleDownloadGstCSV,
  grossTax,
  reversedTax,
  netTax,
  netTaxable,
  creditNotesCount,
  availableMonths
}) {
  return (
    <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4 shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2 font-['Outfit']">
            📅 Monthly GST Tax Reconciliation & CA CSV Export
          </h3>
          <p className="text-slate-400 text-xs">Filter tax liability by month and download month-specific GST reports with return/refund credit note adjustments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={selectedGstMonth}
            onChange={(e) => setSelectedGstMonth(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-extrabold px-3 py-2 rounded-xl cursor-pointer shadow-inner"
          >
            <option value="ALL">📅 All Months (Cumulative Report)</option>
            {availableMonths.map(mKey => {
              const dateObj = new Date(`${mKey}-01`);
              const monthLabel = isNaN(dateObj.getTime()) ? mKey : dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });
              return (
                <option key={mKey} value={mKey}>{monthLabel} ({mKey})</option>
              );
            })}
          </select>

          <button 
            type="button"
            onClick={() => handleDownloadGstCSV && handleDownloadGstCSV(selectedGstMonth, 'ALL')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
            title="Download CA-compliant Sales Register CSV"
          >
            <Download size={14} /> Sales Register CSV
          </button>

          <button 
            type="button"
            onClick={() => handleDownloadGstCSV && handleDownloadGstCSV(selectedGstMonth, 'returns')}
            className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold text-xs px-3 py-2 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            title="Download Returns & Credit Notes Tax Adjustment CSV"
          >
            <RotateCcw size={14} /> Returns CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Gross GST Collected</span>
          <div className="text-2xl font-black text-blue-400">₹{grossTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[10px] text-slate-500">Sales Invoices Total</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-rose-400 uppercase block flex items-center gap-1">
            <RotateCcw size={12} /> Reversed on Returns
          </span>
          <div className="text-2xl font-black text-rose-400">-₹{reversedTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[10px] text-rose-400/80 font-semibold">{creditNotesCount} Credit Notes Issued</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-emerald-800/80 bg-emerald-950/20 space-y-1 ring-1 ring-emerald-500/30">
          <span className="text-[10px] font-extrabold text-emerald-400 uppercase block flex items-center gap-1">
            <CheckCircle2 size={12} /> Net GST Payable to Govt
          </span>
          <div className="text-2xl font-black text-emerald-300">₹{netTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[10px] text-emerald-400 font-bold">Gross - Returns Adjusted</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase block">Net Taxable Turnover</span>
          <div className="text-2xl font-black text-amber-300">₹{netTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[10px] text-slate-500">Net Base Revenue</span>
        </div>
      </div>
    </div>
  );
}

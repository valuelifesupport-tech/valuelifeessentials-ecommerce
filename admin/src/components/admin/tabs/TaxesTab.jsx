import React, { useState, useEffect } from 'react';
import { ToggleRight, ToggleLeft, Download, Trash2, Search, Eye, RotateCcw, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

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
  collections = [],
  orders = [],
  handleFetchOrderDetails,
  adminFetch,
  showToast
}) {
  // ORDER TAX LEDGER STATE
  const [ledgerOrders, setLedgerOrders] = useState([]);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('ALL');
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPerPage = 8;

  // FETCH ORDERS TAX LEDGER
  const fetchLedgerData = async () => {
    if (!adminFetch) return;
    try {
      setLedgerLoading(true);
      const res = await adminFetch(`/api/admin/taxes/orders-ledger?month=${selectedGstMonth}`);
      if (res.ok) {
        const data = await res.json();
        setLedgerOrders(data.orders || []);
        setLedgerSummary(data.summary || null);
      }
    } catch (e) {
      console.warn('Failed to fetch tax ledger:', e);
    } finally {
      setLedgerLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
    setLedgerPage(1);
  }, [selectedGstMonth]);

  // FALLBACK COMPUTATION IF LEDGER ORDERS IS EMPTY BUT ORDERS PROP EXISTS
  const effectiveOrdersList = ledgerOrders.length > 0 ? ledgerOrders : orders.map(o => {
    const taxAmt = Number(o.tax_amount || o.gst_amount || 0);
    const isCancelled = o.order_status === 'CANCELLED' || o.payment_status === 'REFUNDED';
    const isIntra = !o.state_name || o.state_name.toLowerCase() === 'maharashtra';
    const taxableVal = Math.max(0, Number(o.total_amount || 0) - taxAmt);
    const cgst = Number(o.cgst_amount || 0) || (isIntra ? taxAmt / 2 : 0);
    const sgst = Number(o.sgst_amount || 0) || (isIntra ? taxAmt / 2 : 0);
    const igst = Number(o.igst_amount || 0) || (!isIntra ? taxAmt : 0);

    return {
      id: o.id,
      order_number: o.order_number,
      created_at: o.created_at,
      customer_name: o.customer_name || 'Guest Customer',
      customer_phone: o.customer_phone || '',
      customer_email: o.customer_email || '',
      customer_gstin: o.customer_gstin || '',
      shipping_address: o.shipping_address || '',
      state_name: o.state_name || 'Maharashtra',
      is_intra_state: isIntra,
      tax_type: isIntra ? 'INTRA-STATE (CGST + SGST)' : 'INTER-STATE (IGST)',
      taxable_value: taxableVal,
      tax_rate: 5,
      cgst_amount: cgst,
      sgst_amount: sgst,
      igst_amount: igst,
      total_tax: taxAmt,
      total_amount: Number(o.total_amount || 0),
      order_status: o.order_status || 'PROCESSING',
      payment_status: o.payment_status || 'PENDING',
      is_return: isCancelled,
      tax_status: isCancelled ? 'REVERSED' : 'COLLECTED',
      credit_note_number: isCancelled ? `CN-${o.order_number}` : null
    };
  });

  // FILTERED LEDGER ORDERS
  const filteredLedgerOrders = effectiveOrdersList.filter(o => {
    const q = ledgerSearchQuery.trim().toLowerCase();
    const matchesSearch = !q ||
      (o.order_number && o.order_number.toLowerCase().includes(q)) ||
      (o.customer_name && o.customer_name.toLowerCase().includes(q)) ||
      (o.customer_phone && o.customer_phone.toLowerCase().includes(q)) ||
      (o.customer_gstin && o.customer_gstin.toLowerCase().includes(q)) ||
      (o.state_name && o.state_name.toLowerCase().includes(q)) ||
      (o.credit_note_number && o.credit_note_number.toLowerCase().includes(q));

    const matchesStatus = ledgerStatusFilter === 'ALL' || o.tax_status === ledgerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalLedgerPages = Math.ceil(filteredLedgerOrders.length / ledgerPerPage) || 1;
  const paginatedLedgerOrders = filteredLedgerOrders.slice((ledgerPage - 1) * ledgerPerPage, ledgerPage * ledgerPerPage);

  // SUMMARY CALCULATIONS
  const grossTax = ledgerSummary?.gross_tax_collected ?? (gstSummaryData?.grossGst ?? 0);
  const reversedTax = ledgerSummary?.tax_reversed_on_returns ?? (gstSummaryData?.reversedGst ?? 0);
  const netTax = ledgerSummary?.net_tax_payable ?? (gstSummaryData?.totalGst ?? 0);
  const netTaxable = ledgerSummary?.net_taxable_turnover ?? (gstSummaryData?.netTaxableTurnover ?? 0);
  const creditNotesCount = ledgerSummary?.credit_notes_count ?? (effectiveOrdersList.filter(o => o.tax_status === 'REVERSED').length);

  return (
    <div className="space-y-6 w-full max-w-5xl" data-reticle-target="admin-taxes-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block">INDIAN GST & REGIONAL TAX STUDIO</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">🏛️ Taxes & GST Management Center</h3>
        <p className="text-xs text-slate-400">Configure global GSTIN, State-wise regional tax rates, track order-level taxes, and manage return/refund tax reversals.</p>
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

      {/* MONTHLY RECONCILIATION & RETURN ADJUSTMENT KPI CARDS */}
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
              {(ledgerSummary?.available_months || gstSummaryData?.availableMonths || ['2026-09', '2026-08']).map(mKey => {
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

        {/* MONTH-FILTERED RECONCILIATION KPI CARDS */}
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

      {/* DEDICATED ORDER TAX & RETURN MANAGEMENT LEDGER */}
      <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4 shadow-md" data-reticle-target="admin-tax-orders-ledger">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">REAL-TIME INVOICE & CREDIT NOTE AUDIT</span>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2 font-['Outfit']">
              📑 Order Tax & Returns Reconciliation Ledger
            </h3>
            <p className="text-slate-400 text-xs">Track every order's taxable base, CGST/SGST vs IGST paid, and manage return/refund tax reversals with automated Credit Notes.</p>
          </div>

          <span className="bg-slate-800 text-emerald-400 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl">
            {filteredLedgerOrders.length} Invoices & Credit Notes
          </span>
        </div>

        {/* LEDGER FILTERS BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          {/* SEARCH BOX */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search Order #, Customer, State, GSTIN, CN #..."
              value={ledgerSearchQuery}
              onChange={(e) => { setLedgerSearchQuery(e.target.value); setLedgerPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-medium focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* STATUS FILTER PILLS */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => { setLedgerStatusFilter('ALL'); setLedgerPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                ledgerStatusFilter === 'ALL'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              All ({effectiveOrdersList.length})
            </button>

            <button
              type="button"
              onClick={() => { setLedgerStatusFilter('COLLECTED'); setLedgerPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                ledgerStatusFilter === 'COLLECTED'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                  : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750'
              }`}
            >
              ✓ Tax Collected ({effectiveOrdersList.filter(o => o.tax_status === 'COLLECTED').length})
            </button>

            <button
              type="button"
              onClick={() => { setLedgerStatusFilter('REVERSED'); setLedgerPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 ${
                ledgerStatusFilter === 'REVERSED'
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60'
              }`}
            >
              <RotateCcw size={12} /> Reversed on Returns ({creditNotesCount})
            </button>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 custom-scrollbar">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead className="bg-slate-800 text-slate-400 font-bold uppercase border-b border-slate-700 text-[11px]">
              <tr>
                <th className="p-3">Order / Credit Note</th>
                <th className="p-3">Customer & State</th>
                <th className="p-3">Tax Type</th>
                <th className="p-3">Taxable Base</th>
                <th className="p-3">GST Rate</th>
                <th className="p-3">Tax Split (CGST/SGST/IGST)</th>
                <th className="p-3">Total Tax Paid</th>
                <th className="p-3">Tax Ledger Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {paginatedLedgerOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400">
                    No tax records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLedgerOrders.map((o) => {
                  const isCancelled = o.tax_status === 'REVERSED';
                  const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : 'Recent';

                  return (
                    <tr key={o.id} className={`hover:bg-slate-800/50 ${isCancelled ? 'bg-rose-950/10' : ''}`}>
                      {/* ORDER NUMBER & DATE */}
                      <td className="p-3">
                        <div className="font-bold text-white font-mono">{o.order_number}</div>
                        <div className="text-[10px] text-slate-400">{dateStr}</div>
                        {isCancelled && o.credit_note_number && (
                          <div className="text-[9px] font-mono text-rose-300 font-bold mt-0.5">
                            CN: {o.credit_note_number}
                          </div>
                        )}
                      </td>

                      {/* CUSTOMER & STATE */}
                      <td className="p-3">
                        <div className="font-bold text-white">{o.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{o.customer_phone || o.state_name}</div>
                        {o.customer_gstin && (
                          <span className="inline-block bg-emerald-950 text-emerald-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-800 mt-0.5">
                            B2B: {o.customer_gstin}
                          </span>
                        )}
                      </td>

                      {/* TAX TYPE */}
                      <td className="p-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          o.is_intra_state 
                            ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                            : 'bg-amber-950/70 text-amber-300 border-amber-800'
                        }`}>
                          {o.is_intra_state ? 'CGST + SGST (Intra)' : 'IGST (Inter)'}
                        </span>
                      </td>

                      {/* TAXABLE BASE */}
                      <td className="p-3 font-bold text-slate-200">
                        ₹{(o.taxable_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* GST RATE */}
                      <td className="p-3 font-extrabold text-emerald-400 font-mono">
                        {o.tax_rate}%
                      </td>

                      {/* TAX SPLIT */}
                      <td className="p-3 font-mono text-[11px]">
                        {o.is_intra_state ? (
                          <div className="space-y-0.5">
                            <span className="block text-blue-400">CGST: ₹{Number(o.cgst_amount || 0).toFixed(2)}</span>
                            <span className="block text-purple-400">SGST: ₹{Number(o.sgst_amount || 0).toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="text-amber-400 font-bold">IGST: ₹{Number(o.igst_amount || 0).toFixed(2)}</span>
                        )}
                      </td>

                      {/* TOTAL TAX PAID */}
                      <td className="p-3 font-black text-sm">
                        <span className={isCancelled ? 'text-rose-400 line-through' : 'text-emerald-400'}>
                          ₹{Number(o.total_tax || 0).toFixed(2)}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">
                          Inv Total: ₹{Number(o.total_amount || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* STATUS BADGE */}
                      <td className="p-3">
                        {isCancelled ? (
                          <div>
                            <span className="inline-flex items-center gap-1 bg-rose-950/80 text-rose-300 border border-rose-800 text-[10px] font-black px-2 py-0.5 rounded">
                              <RotateCcw size={10} /> REVERSED (CREDIT NOTE)
                            </span>
                            <span className="block text-[9px] text-rose-400 mt-0.5">Tax liability deducted</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-black px-2 py-0.5 rounded">
                            <CheckCircle2 size={10} /> TAX COLLECTED
                          </span>
                        )}
                      </td>

                      {/* ACTION */}
                      <td className="p-3 text-right">
                        {handleFetchOrderDetails && (
                          <button
                            type="button"
                            onClick={() => {
                              const found = orders.find(ord => ord.id === o.id || ord.order_number === o.order_number);
                              handleFetchOrderDetails(found || o);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Invoice & Order Details"
                          >
                            <Eye size={13} /> View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* LEDGER PAGINATION */}
        {filteredLedgerOrders.length > ledgerPerPage && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 text-xs text-slate-400">
            <span>
              Showing {(ledgerPage - 1) * ledgerPerPage + 1} - {Math.min(ledgerPage * ledgerPerPage, filteredLedgerOrders.length)} of {filteredLedgerOrders.length} records
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={ledgerPage === 1}
                onClick={() => setLedgerPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg font-bold border border-slate-700 cursor-pointer"
              >
                ‹ Prev
              </button>

              <span className="px-2 font-mono text-emerald-400 font-bold">
                {ledgerPage} / {totalLedgerPages}
              </span>

              <button
                type="button"
                disabled={ledgerPage >= totalLedgerPages}
                onClick={() => setLedgerPage(prev => Math.min(totalLedgerPages, prev + 1))}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded-lg font-bold border border-slate-700 cursor-pointer"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
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

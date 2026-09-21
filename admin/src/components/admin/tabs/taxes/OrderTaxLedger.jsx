import React, { useState } from 'react';
import { Search, RotateCcw, CheckCircle2, Eye } from 'lucide-react';
import { formatInr } from '../../../../utils/currency';

export default function OrderTaxLedger({
  effectiveOrdersList,
  handleFetchOrderDetails,
  orders,
  creditNotesCount
}) {
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('ALL');
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPerPage = 8;

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

  return (
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

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
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
                    <td className="p-3">
                      <div className="font-bold text-white font-mono">{o.order_number}</div>
                      <div className="text-[10px] text-slate-400">{dateStr}</div>
                      {isCancelled && o.credit_note_number && (
                        <div className="text-[9px] font-mono text-rose-300 font-bold mt-0.5">
                          CN: {o.credit_note_number}
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white">{o.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{o.customer_phone || o.state_name}</div>
                      {o.customer_gstin && (
                        <span className="inline-block bg-emerald-950 text-emerald-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-emerald-800 mt-0.5">
                          B2B: {o.customer_gstin}
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        o.is_intra_state 
                          ? 'bg-blue-950/70 text-blue-300 border-blue-800' 
                          : 'bg-amber-950/70 text-amber-300 border-amber-800'
                      }`}>
                        {o.is_intra_state ? 'CGST + SGST (Intra)' : 'IGST (Inter)'}
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-200">
                      ₹{(o.taxable_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="p-3 font-extrabold text-emerald-400 font-mono">
                      {o.tax_rate}%
                    </td>

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

                    <td className="p-3 font-black text-sm">
                      <span className={isCancelled ? 'text-rose-400 line-through' : 'text-emerald-400'}>
                        ₹{Number(o.total_tax || 0).toFixed(2)}
                      </span>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Inv Total: ₹{Number(o.total_amount || 0).toLocaleString('en-IN')}
                      </div>
                    </td>

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
  );
}

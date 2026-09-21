import React from 'react';

export default function OrderGstBreakdown({ selectedOrderDetails, settingsForm = {} }) {
  const taxAmt = Number(selectedOrderDetails.tax_amount || selectedOrderDetails.gst_amount || 0);
  const isCancelled = selectedOrderDetails.order_status === 'CANCELLED' || selectedOrderDetails.payment_status === 'REFUNDED';
  const cgst = Number(selectedOrderDetails.cgst_amount || 0);
  const sgst = Number(selectedOrderDetails.sgst_amount || 0);
  const igst = Number(selectedOrderDetails.igst_amount || 0);
  const stateName = selectedOrderDetails.state_name || 'Maharashtra';
  const isIntra = (!selectedOrderDetails.state_name || selectedOrderDetails.state_name.toLowerCase() === 'maharashtra');
  const taxableVal = Math.max(0, Number(selectedOrderDetails.total_amount || 0) - taxAmt);

  return (
    <div className={`p-4 rounded-xl border space-y-3 text-xs ${
      isCancelled 
        ? 'bg-rose-950/20 border-rose-900/60' 
        : 'bg-slate-850 border-slate-800'
    }`}>
      <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2">
        <span className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
          🏛️ GST Tax Invoice Breakdown (Store GSTIN: {settingsForm.gstin_number || '27AAAAA0000A1Z5'})
        </span>
        <div className="flex items-center gap-2">
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono text-[10px] border border-slate-700">
            📍 {stateName} ({isIntra ? 'Intra-State' : 'Inter-State'})
          </span>
          {selectedOrderDetails.customer_gstin && (
            <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-mono text-[10px] border border-emerald-800">
              B2B GSTIN: {selectedOrderDetails.customer_gstin}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-1 font-mono text-[11px]">
        <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
          <span className="text-[9px] text-slate-400 block uppercase">Taxable Value</span>
          <div className="font-bold text-white">₹{taxableVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>

        <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
          <span className="text-[9px] text-slate-400 block uppercase">CGST (Central)</span>
          <div className="font-bold text-blue-400">₹{(cgst || (isIntra ? taxAmt / 2 : 0)).toFixed(2)}</div>
        </div>

        <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
          <span className="text-[9px] text-slate-400 block uppercase">SGST (State)</span>
          <div className="font-bold text-purple-400">₹{(sgst || (isIntra ? taxAmt / 2 : 0)).toFixed(2)}</div>
        </div>

        <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
          <span className="text-[9px] text-slate-400 block uppercase">IGST (Integrated)</span>
          <div className="font-bold text-amber-400">₹{(igst || (!isIntra ? taxAmt : 0)).toFixed(2)}</div>
        </div>

        <div className={`p-2 rounded-lg border ${
          isCancelled 
            ? 'bg-rose-950/60 border-rose-800 text-rose-300' 
            : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
        }`}>
          <span className="text-[9px] text-slate-400 block uppercase">Total GST Paid</span>
          <div className="font-extrabold text-xs">₹{taxAmt.toFixed(2)}</div>
        </div>
      </div>

      {/* RETURN / REVERSAL STATUS NOTICE */}
      {isCancelled ? (
        <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-rose-300 font-extrabold text-xs flex items-center gap-1.5">
              ↩️ TAX REVERSED ON RETURN / REFUND (Credit Note: CN-{selectedOrderDetails.order_number})
            </span>
            <span className="bg-rose-900 text-rose-200 text-[10px] font-black px-2 py-0.5 rounded">
              Reversed: -₹{taxAmt.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-rose-200/80">
            This order is cancelled/refunded. Total ₹{taxAmt.toFixed(2)} GST has been deducted from your store's net tax liability in the Taxes Tab. No tax is payable to the government for this order.
          </p>
        </div>
      ) : (
        <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center justify-between text-[11px]">
          <span className="text-emerald-300 font-bold flex items-center gap-1.5">
            ✓ Tax Collected: ₹{taxAmt.toFixed(2)} GST recorded in Monthly Tax Ledger.
          </span>
          <span className="text-slate-400 text-[10px]">
            (Credit Note auto-generated if returned)
          </span>
        </div>
      )}
    </div>
  );
}

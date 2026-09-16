import React, { useState, useEffect } from 'react';
import {
  ToggleRight, ToggleLeft, ShieldCheck, RefreshCw, Search,
  AlertTriangle, CheckCircle2, Clock, XCircle, Eye, ExternalLink, ShieldAlert
} from 'lucide-react';

export default function PaymentTab({
  settingsForm = {},
  setSettingsForm,
  handleSettingsSubmit,
  adminFetch
}) {
  const [transactions, setTransactions] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [searchTxn, setSearchTxn] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTxn, setSelectedTxn] = useState(null);

  const fetchTransactions = async () => {
    setLoadingTxns(true);
    try {
      const fetcher = adminFetch || fetch;
      const url = `/api/payment/transactions?status=${statusFilter}&search=${encodeURIComponent(searchTxn)}`;
      const res = await fetcher(url);
      const data = await res.json();
      setTransactions(data?.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoadingTxns(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 size={12} /> PAID
          </span>
        );
      case 'ORDER_CREATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-sky-950/80 text-sky-400 border border-sky-800">
            <Clock size={12} /> HANDSHAKE OK
          </span>
        );
      case 'INITIATED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-950/80 text-amber-400 border border-amber-800">
            <Clock size={12} /> INITIATED
          </span>
        );
      case 'SIGNATURE_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-950 text-rose-300 border border-rose-700 animate-pulse">
            <ShieldAlert size={12} /> TAMPER ALERT
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-800 text-rose-400 border border-slate-700">
            <XCircle size={12} /> FAILED
          </span>
        );
    }
  };

  const getStepLabel = (step) => {
    switch (step) {
      case '1_PAYMENT_REQ':
        return <span className="text-amber-400 font-mono text-[11px]">1. Payment Req</span>;
      case '2_HANDSHAKE_RAZORPAY':
        return <span className="text-sky-400 font-mono text-[11px]">2. Razorpay Handshake</span>;
      case '3_USER_PAY_FAIL':
        return <span className="text-rose-400 font-mono text-[11px]">3. User Pay Failed</span>;
      case '4_VERIFY_SUCCESS':
        return <span className="text-emerald-400 font-mono text-[11px]">4. Verified & Paid</span>;
      case '4_VERIFY_FAILED':
        return <span className="text-rose-400 font-mono text-[11px]">4. Verify Failed</span>;
      default:
        return <span className="text-slate-400 font-mono text-[11px]">{step || '—'}</span>;
    }
  };

  return (
    <div className="space-y-8 w-full max-w-6xl" data-reticle-target="admin-payment-tab">
      {/* 1. PAYMENT SETTINGS & COD CONTROLS */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
        <div>
          <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">PAYMENT ARCHITECTURE</span>
          <h3 className="text-xl font-black text-white font-['Outfit']">Payment Settings & Partial COD Controls</h3>
          <p className="text-xs text-slate-400">Configure Cash on Delivery (COD), partial deposit breakdown %, and prepaid discounts.</p>
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-5 text-xs" data-reticle-target="admin-payment-form">
          {/* CASH ON DELIVERY (COD) TOGGLE */}
          <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-extrabold text-sm text-white block">Cash on Delivery (COD) Payment Mode</span>
                <p className="text-slate-400 text-xs">Enable or disable Cash on Delivery option for customer checkout.</p>
              </div>

              <button 
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, enable_cod: settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? 0 : 1 })}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
                data-reticle-target="admin-toggle-cod"
              >
                {settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{settingsForm.enable_cod === 1 || settingsForm.enable_cod === undefined ? 'COD ENABLED (ON)' : 'COD DISABLED (OFF)'}</span>
              </button>
            </div>
          </div>

          {/* PARTIAL PAYMENT BREAKDOWN CONTROL */}
          <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="font-extrabold text-sm text-white block">Partial Payment Breakdown Control</span>
                <p className="text-slate-400 text-xs">Allow customers to pay a small online deposit (e.g., 20%) and pay the remaining balance on COD delivery.</p>
              </div>

              <button 
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, enable_partial_payment: settingsForm.enable_partial_payment === 1 ? 0 : 1 })}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  settingsForm.enable_partial_payment === 1 
                    ? 'bg-emerald-600 text-white shadow-lg' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
                data-reticle-target="admin-toggle-partial-payment"
              >
                {settingsForm.enable_partial_payment === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                <span>{settingsForm.enable_partial_payment === 1 ? 'PARTIAL PAY ON' : 'PARTIAL PAY OFF'}</span>
              </button>
            </div>

            {settingsForm.enable_partial_payment === 1 && (
              <div className="space-y-4 pt-1 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-200 mb-1">
                    <label>Partial Deposit Percentage (%)</label>
                    <span className="text-emerald-400 font-black">{settingsForm.partial_deposit_percent || 20}% DEPOSIT</span>
                  </div>
                  <input 
                    type="range" min="5" max="50" step="5"
                    value={settingsForm.partial_deposit_percent || 20}
                    onChange={(e) => setSettingsForm({ ...settingsForm, partial_deposit_percent: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                    data-reticle-target="admin-partial-deposit-range"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Payment Breakdown Heading *</label>
                    <input 
                      type="text"
                      value={settingsForm.partial_payment_heading || 'Choose Payment Breakdown Option:'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, partial_payment_heading: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Deposit Button Subtext *</label>
                    <input 
                      type="text"
                      value={settingsForm.partial_payment_subtext || 'Pay rest on Delivery'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, partial_payment_subtext: e.target.value })}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PREPAID FULL PAYMENT DISCOUNT CONTROL */}
          <div className="p-5 bg-slate-850 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-extrabold text-sm text-white block">100% Full Prepaid Payment Discount (%)</span>
                <p className="text-slate-400 text-xs">Offer customers an extra discount percentage when choosing 100% Full Online Payment.</p>
              </div>
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-black px-3 py-1 rounded-full">
                {settingsForm.prepaid_discount_percent || 0}% OFF PREPAID
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input 
                type="range" min="0" max="25" step="1"
                value={settingsForm.prepaid_discount_percent || 0}
                onChange={(e) => setSettingsForm({ ...settingsForm, prepaid_discount_percent: Number(e.target.value) })}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <input 
                type="number" min="0" max="25"
                value={settingsForm.prepaid_discount_percent || 0}
                onChange={(e) => setSettingsForm({ ...settingsForm, prepaid_discount_percent: Number(e.target.value) })}
                className="w-20 p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-center"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg uppercase tracking-wider text-xs cursor-pointer"
            data-reticle-target="admin-save-payment-settings-btn"
          >
            Save Payment Settings Live
          </button>
        </form>
      </div>

      {/* 2. LIVE PAYMENT TRANSACTIONS & ANTI-TAMPERING AUDIT LOG */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-400" size={20} />
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ZERO-TRUST AUDIT TRAIL</span>
            </div>
            <h3 className="text-xl font-black text-white font-['Outfit']">Payment Transactions & Handshake Logs</h3>
            <p className="text-xs text-slate-400">Complete database log tracking every payment request, Razorpay handshake, user outcome, and cryptographic signature.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTransactions}
              disabled={loadingTxns}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCw size={14} className={loadingTxns ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Txn ID, Order #, Email..."
              value={searchTxn}
              onChange={(e) => setSearchTxn(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-850 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-850 border border-slate-700 rounded-xl text-white px-3 py-2 font-bold cursor-pointer focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">PAID (Verified)</option>
              <option value="ORDER_CREATED">ORDER_CREATED (Handshake)</option>
              <option value="INITIATED">INITIATED</option>
              <option value="FAILED">FAILED</option>
              <option value="SIGNATURE_MISMATCH">SIGNATURE_MISMATCH (Tamper)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850 uppercase text-[10px] font-black text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Transaction ID & Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Authentic Amount</th>
                <th className="p-3">Audit Step</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    {loadingTxns ? 'Loading audit records from database...' : 'No payment transactions recorded yet.'}
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id || tx.transaction_id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {tx.created_at ? new Date(tx.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-emerald-400 font-bold text-[11px]">{tx.transaction_id}</div>
                      <div className="text-[10px] text-slate-400">Order: #{tx.order_number || tx.order_id || 'N/A'}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{tx.customer_name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400">{tx.customer_phone || tx.customer_email || '—'}</div>
                    </td>
                    <td className="p-3 font-black text-white text-sm">
                      ₹{tx.amount}
                      <span className="text-[10px] text-slate-400 font-normal block font-mono">({tx.amount_paise} paise)</span>
                    </td>
                    <td className="p-3">
                      {getStepLabel(tx.step)}
                    </td>
                    <td className="p-3">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelectedTxn(tx)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="View Full Handshake & Cryptographic Payload"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. TRANSACTION DETAIL & AUDIT PAYLOAD MODAL */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">AUDIT INSPECTION</span>
                <h4 className="font-mono font-bold text-white text-sm">{selectedTxn.transaction_id}</h4>
              </div>
              <button
                onClick={() => setSelectedTxn(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Status & Step:</span>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusBadge(selectedTxn.status)}
                  {getStepLabel(selectedTxn.step)}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Authentic Amount:</span>
                <div className="font-black text-white text-base">₹{selectedTxn.amount} ({selectedTxn.amount_paise} paise)</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Gateway Order ID:</span>
                <div className="font-mono text-slate-200">{selectedTxn.gateway_order_id || 'Not generated yet'}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Gateway Payment ID:</span>
                <div className="font-mono text-slate-200">{selectedTxn.gateway_payment_id || 'Not captured yet'}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Client IP & User Agent:</span>
                <div className="font-mono text-slate-300 text-[10px] truncate">{selectedTxn.ip_address || '—'}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Verified Timestamp:</span>
                <div className="font-mono text-slate-300 text-[10px]">{selectedTxn.verified_at || 'Not verified'}</div>
              </div>
            </div>

            {/* Error detail if failed */}
            {(selectedTxn.error_code || selectedTxn.error_description) && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-1">
                <span className="text-rose-400 font-bold uppercase text-[10px] block">Failure / Security Warning:</span>
                <div className="text-rose-200 font-mono text-xs">{selectedTxn.error_code}: {selectedTxn.error_description}</div>
              </div>
            )}

            {/* Payloads */}
            <div className="space-y-3">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Step 1 Request Payload Snapshot:</span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                  {selectedTxn.request_payload ? JSON.stringify(typeof selectedTxn.request_payload === 'string' ? JSON.parse(selectedTxn.request_payload) : selectedTxn.request_payload, null, 2) : 'No request payload recorded.'}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Step 2 Gateway Handshake Response:</span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                  {selectedTxn.response_payload ? JSON.stringify(typeof selectedTxn.response_payload === 'string' ? JSON.parse(selectedTxn.response_payload) : selectedTxn.response_payload, null, 2) : 'No gateway response recorded.'}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Step 4 Verification & HMAC Result:</span>
                <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36">
                  {selectedTxn.verification_payload ? JSON.stringify(typeof selectedTxn.verification_payload === 'string' ? JSON.parse(selectedTxn.verification_payload) : selectedTxn.verification_payload, null, 2) : 'No verification payload.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Truck, RefreshCw } from 'lucide-react';

export default function OrderStatusControl({
  selectedOrderDetails,
  setSelectedOrderDetails,
  adminOrderStatusInput,
  setAdminOrderStatusInput,
  courierInput,
  setCourierInput,
  trackingInput,
  setTrackingInput,
  adminCancelReasonInput,
  setAdminCancelReasonInput,
  updatingShippingStatus,
  handleUpdateOrderShippingAndStatus,
  adminFetch,
  fetchAdminData,
  showToast
}) {
  const handleApproveRefund = async () => {
    await adminFetch(`/api/admin/orders/${selectedOrderDetails.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_status: 'CANCELLED',
        payment_status: 'REFUNDED',
        cancellation_notes: 'Refund approved and initiated by Admin'
      })
    });
    if (fetchAdminData) fetchAdminData();
    setSelectedOrderDetails(prev => ({ ...prev, payment_status: 'REFUNDED' }));
    if (showToast) showToast('success', 'Refund Approved', `₹${selectedOrderDetails.paid_amount} marked as REFUNDED.`);
  };

  const handleRejectAndRestore = async () => {
    await adminFetch(`/api/admin/orders/${selectedOrderDetails.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_status: 'PROCESSING',
        cancellation_reason: ''
      })
    });
    if (fetchAdminData) fetchAdminData();
    setSelectedOrderDetails(prev => ({ ...prev, order_status: 'PROCESSING', cancellation_reason: '' }));
    setAdminOrderStatusInput('PROCESSING');
    if (showToast) showToast('info', 'Order Restored', 'Order reverted back to PROCESSING status.');
  };

  return (
    <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
      <span className="text-[10px] font-black uppercase text-blue-400 block tracking-wider flex items-center gap-1.5">
        <Truck size={14} /> Shipping, Courier Tracking & Cancellation Control
      </span>

      <form onSubmit={handleUpdateOrderShippingAndStatus} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-slate-400 mb-1 font-bold">Order Status</label>
            <select
              value={adminOrderStatusInput}
              onChange={(e) => setAdminOrderStatusInput(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold cursor-pointer"
            >
              <option value="PROCESSING">🟡 PROCESSING</option>
              <option value="SHIPPED">🔵 SHIPPED</option>
              <option value="DELIVERED">🟢 DELIVERED</option>
              <option value="CANCELLED">🔴 CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">Courier Partner Name</label>
            <input
              type="text"
              placeholder="e.g. Delhivery, BlueDart, DTDC"
              value={courierInput}
              onChange={(e) => setCourierInput(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-bold">Tracking Number / AWB #</label>
            <input
              type="text"
              placeholder="e.g. 123456789"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-mono"
            />
          </div>
        </div>

        {adminOrderStatusInput === 'CANCELLED' && (
          <div className="space-y-2 p-3 bg-rose-950/40 border border-rose-800 rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-rose-300 font-bold text-xs">Cancellation Reason & Admin Remarks</label>
              <div className="flex items-center gap-2">
                {Number(selectedOrderDetails.paid_amount) > 0 && selectedOrderDetails.payment_status !== 'REFUNDED' && (
                  <button
                    type="button"
                    onClick={handleApproveRefund}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shadow cursor-pointer transition-colors"
                  >
                    <span>💸 Approve Refund (₹{selectedOrderDetails.paid_amount})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRejectAndRestore}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/50 font-bold px-2 py-1 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>↩️ Reject & Restore</span>
                </button>
              </div>
            </div>
            <input
              type="text"
              placeholder="Reason for cancellation (e.g. Customer request, Out of stock)"
              value={adminCancelReasonInput}
              onChange={(e) => setAdminCancelReasonInput(e.target.value)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs"
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updatingShippingStatus}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold px-4 py-2 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {updatingShippingStatus ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Updating Status...
              </>
            ) : (
              <>
                <Truck size={14} /> Update Shipping & Status
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

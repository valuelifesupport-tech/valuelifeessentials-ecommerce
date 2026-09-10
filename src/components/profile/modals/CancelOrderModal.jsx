import React from 'react';
import { X } from 'lucide-react';

export default function CancelOrderModal({
  selectedOrderToCancel,
  onClose,
  cancelReason,
  setCancelReason,
  cancelNotes,
  setCancelNotes,
  cancellingOrder,
  onSubmit
}) {
  if (!selectedOrderToCancel) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" data-reticle-target="user-cancel-order-modal">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">
              Cancel Order #{selectedOrderToCancel.order_number}
            </h3>
            <p className="text-xs text-gray-500">Select reason for pre-shipping cancellation</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
            data-reticle-target="user-cancel-order-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Reason for Cancellation *</label>
            <select 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 cursor-pointer focus:outline-none focus:border-rose-500"
              data-reticle-target="user-cancel-order-reason-select"
            >
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Found better price elsewhere">Found better price elsewhere</option>
              <option value="Need to change delivery address">Need to change delivery address</option>
              <option value="Changed mind / Don't need anymore">Changed mind / Don't need anymore</option>
              <option value="Other reason">Other reason</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Additional Notes / Details</label>
            <textarea 
              rows={2}
              placeholder="Optional comments for customer support"
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:outline-none focus:border-rose-500"
              data-reticle-target="user-cancel-order-notes-textarea"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              data-reticle-target="user-cancel-order-keep-btn"
            >
              Keep Order
            </button>
            <button 
              type="submit"
              disabled={cancellingOrder}
              className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer disabled:opacity-50"
              data-reticle-target="user-cancel-order-confirm-btn"
            >
              {cancellingOrder ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

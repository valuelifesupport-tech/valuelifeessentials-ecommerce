import React from 'react';
import { Package, LogOut, X } from 'lucide-react';

export default function ProfileSummaryView({
  currentUser,
  onLogout,
  myOrders,
  loadingOrders,
  selectedOrderToCancel,
  setSelectedOrderToCancel,
  cancelReason,
  setCancelReason,
  cancelNotes,
  setCancelNotes,
  cancellingOrder,
  onCancelOrderSubmit
}) {
  return (
    <div className="space-y-4 text-xs" data-reticle-target="user-auth-profile-summary">
      {/* PROFILE BANNER */}
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center" data-reticle-target="user-auth-profile-banner">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#3b6e14] text-white font-extrabold text-lg flex items-center justify-center shadow-md font-mono">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-gray-900">{currentUser?.name}</h4>
            <p className="text-emerald-800 font-mono text-[11px] font-bold">{currentUser?.email}</p>
            {currentUser?.phone && <p className="text-gray-500 text-[10px]">{currentUser.phone}</p>}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          data-reticle-target="user-auth-signout-btn"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {/* MY ORDER HISTORY SECTION */}
      <div className="space-y-3" data-reticle-target="user-auth-orders-section">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5 font-['Outfit']">
            <Package size={16} className="text-[#3b6e14]" /> My Order History ({myOrders?.length || 0})
          </span>
          <span className="text-[10px] text-gray-500 font-bold">Real-time status</span>
        </div>

        {loadingOrders ? (
          <div className="text-center py-6 text-gray-400 text-xs font-bold">Loading order history...</div>
        ) : (!myOrders || myOrders.length === 0) ? (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-2">
            <div className="text-3xl">🌱</div>
            <p className="font-bold text-gray-700 text-xs">No orders placed yet!</p>
            <p className="text-[11px] text-gray-500">Your recent orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
            {myOrders.map((order) => {
              const status = (order.order_status || 'PROCESSING').toUpperCase();
              const isPreShipping = status === 'PROCESSING' || status === 'PENDING';
              const isCancelled = status === 'CANCELLED';
              const isShipped = status === 'SHIPPED';

              return (
                <div key={order.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 hover:border-emerald-500 transition-all" data-reticle-target={`user-order-card-${order.id}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-black text-xs text-[#1b4332] font-mono">{order.order_number}</span>
                    <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      isCancelled ? 'bg-rose-100 text-rose-800 border-rose-300' :
                      isShipped ? 'bg-blue-100 text-blue-800 border-blue-300' :
                      status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {isCancelled ? '❌ CANCELLED' : isShipped ? '🚚 SHIPPED' : status === 'DELIVERED' ? '✅ DELIVERED' : '⏳ PROCESSING'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-medium text-gray-700">
                    <span>Total: <strong className="text-gray-900">₹{order.total_amount}</strong> ({order.payment_mode})</span>
                    <span className="text-gray-400 font-mono text-[10px]">{new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</span>
                  </div>

                  {/* COURIER / TRACKING DETAILS IF SHIPPED */}
                  {isShipped && (order.courier_name || order.tracking_number) && (
                    <div className="bg-blue-50 p-2 rounded-xl text-[10px] text-blue-900 border border-blue-200 font-bold flex items-center justify-between">
                      <span>🚚 Courier: {order.courier_name || 'Standard Shipping'}</span>
                      {order.tracking_number && (
                        <span className="font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                          AWB: #{order.tracking_number}
                        </span>
                      )}
                    </div>
                  )}

                  {/* CANCELLATION REASON IF CANCELLED */}
                  {isCancelled && order.cancellation_reason && (
                    <div className="bg-rose-50 p-2 rounded-xl text-[10px] text-rose-900 border border-rose-200 font-bold space-y-0.5">
                      <div>🚫 Reason: "{order.cancellation_reason}"</div>
                      {order.cancellation_notes && <div className="text-rose-700 font-normal">Note: {order.cancellation_notes}</div>}
                    </div>
                  )}

                  {order.order_notes && !isCancelled && (
                    <div className="bg-amber-50/70 p-2 rounded-xl text-[10px] text-amber-900 border border-amber-200/80 font-bold truncate">
                      📝 Remark: "{order.order_notes}"
                    </div>
                  )}

                  {/* CANCEL ORDER BUTTON (BEFORE SHIPPING ONLY) */}
                  {isPreShipping && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderToCancel(order);
                          setCancelReason('Ordered by mistake');
                          setCancelNotes('');
                        }}
                        className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                        data-reticle-target={`user-cancel-order-btn-${order.id}`}
                      >
                        🚫 Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUSTOMER ORDER CANCELLATION MODAL */}
      {selectedOrderToCancel && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-gray-900">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider block">PRE-SHIPPING CANCELLATION</span>
                <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">Cancel Order #{selectedOrderToCancel.order_number}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderToCancel(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onCancelOrderSubmit} className="space-y-4 text-xs">
              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-rose-900 text-[11px] font-medium leading-relaxed">
                ⚠️ Order cancellation is available before dispatch. Once cancelled, your refund/payment will be updated.
              </div>

              <div className="space-y-1">
                <label className="block font-extrabold text-gray-800">Select Cancellation Reason *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-rose-500 text-xs cursor-pointer"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Want to change shipping address or phone">Want to change shipping address or phone</option>
                  <option value="Want to add/remove items from order">Want to add/remove items from order</option>
                  <option value="Delivery takes too long">Delivery takes too long</option>
                  <option value="Want to change payment mode">Want to change payment mode</option>
                  <option value="Other / Changed my mind">Other / Changed my mind</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-extrabold text-gray-800">Additional Comments / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Provide any additional context or instructions..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedOrderToCancel(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Keep My Order
                </button>
                <button
                  type="submit"
                  disabled={cancellingOrder}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancellingOrder ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

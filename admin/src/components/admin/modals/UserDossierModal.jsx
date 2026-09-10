import React from 'react';
import { X } from 'lucide-react';

export default function UserDossierModal({
  selectedUserDossier,
  setSelectedUserDossier,
  handleUpdateUserRole
}) {
  if (!selectedUserDossier) return null;

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" data-reticle-target="admin-user-dossier-modal">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl font-black flex items-center justify-center text-lg ${
              (selectedUserDossier.user?.role || '').toUpperCase() === 'ADMIN' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              {(selectedUserDossier.user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white font-['Outfit']">
                  {selectedUserDossier.user?.name || 'User Profile Dossier'}
                </h3>
                {(selectedUserDossier.user?.role || '').toUpperCase() === 'ADMIN' ? (
                  <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    👑 MASTER ADMIN
                  </span>
                ) : (
                  <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    CUSTOMER
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-400 font-mono">{selectedUserDossier.user?.email}</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setSelectedUserDossier(null)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* DOSSIER SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number</span>
            <div className="font-extrabold text-white font-mono">{selectedUserDossier.user?.phone || 'N/A'}</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Orders</span>
            <div className="font-extrabold text-emerald-400">{selectedUserDossier.orders?.length || 0} Orders</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Spent</span>
            <div className="font-black text-amber-400">₹{(selectedUserDossier.user?.total_spent || 0).toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* DELIVERY ADDRESS & B2B GSTIN */}
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3 text-xs">
          <span className="font-extrabold text-white block">🏠 Saved Delivery Address & Billing Info</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Street Address</span>
              <p className="font-medium">{selectedUserDossier.user?.address || 'No address saved yet'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block uppercase font-bold">City, State & Pincode</span>
              <p className="font-medium">
                {selectedUserDossier.user?.city ? `${selectedUserDossier.user.city}, ` : ''}
                {selectedUserDossier.user?.state || 'N/A'} 
                {selectedUserDossier.user?.pincode ? ` - ${selectedUserDossier.user.pincode}` : ''}
              </p>
            </div>

            {selectedUserDossier.user?.gstin_number && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex items-center justify-between text-emerald-400">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">B2B Business Name & GSTIN</span>
                  <p className="font-mono font-bold">{selectedUserDossier.user.business_name} ({selectedUserDossier.user.gstin_number})</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ROLE MANAGEMENT ACTION */}
        <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-white block">Account Administrative Role</span>
            <p className="text-slate-400 text-[11px]">Grant or revoke Administrator access rights for this user account.</p>
          </div>

          <div className="flex items-center gap-2">
            {(selectedUserDossier.user?.role || '').toUpperCase() === 'ADMIN' ? (
              <button
                type="button"
                onClick={() => handleUpdateUserRole && handleUpdateUserRole(selectedUserDossier.user.id, 'CUSTOMER')}
                className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
              >
                Revoke Admin Access
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleUpdateUserRole && handleUpdateUserRole(selectedUserDossier.user.id, 'ADMIN')}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-4 py-1.5 rounded-xl shadow-md cursor-pointer"
              >
                👑 Promote to Admin
              </button>
            )}
          </div>
        </div>

        {/* ORDER HISTORY LIST */}
        <div className="space-y-3 pt-2">
          <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
            📦 Customer Order History ({selectedUserDossier.orders?.length || 0})
          </h4>

          {(!selectedUserDossier.orders || selectedUserDossier.orders.length === 0) ? (
            <div className="p-6 text-center text-slate-400 text-xs font-bold bg-slate-850 rounded-xl border border-slate-800">
              No orders placed by this customer yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs custom-scrollbar">
              {selectedUserDossier.orders.map(ord => (
                <div key={ord.id} className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white font-mono block">{ord.order_number}</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(ord.created_at || Date.now()).toLocaleDateString()} • ₹{ord.total_amount} ({ord.payment_mode})
                    </span>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    ord.order_status === 'CANCELLED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {ord.order_status || 'PROCESSING'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

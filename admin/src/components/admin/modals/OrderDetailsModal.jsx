import React from 'react';
import { XCircle, MessageSquare } from 'lucide-react';
import OrderCustomerCard from './order/OrderCustomerCard';
import OrderGstBreakdown from './order/OrderGstBreakdown';
import OrderShiprocketCard from './order/OrderShiprocketCard';
import OrderStatusControl from './order/OrderStatusControl';
import OrderItemList from './order/OrderItemList';
import OrderNotesForm from './order/OrderNotesForm';

export default function OrderDetailsModal({
  selectedOrderDetails,
  setSelectedOrderDetails,
  settingsForm = {},
  adminOrderStatusInput,
  setAdminOrderStatusInput,
  courierInput,
  setCourierInput,
  trackingInput,
  setTrackingInput,
  adminCancelReasonInput,
  setAdminCancelReasonInput,
  adminFetch,
  fetchAdminData,
  showToast,
  updatingShippingStatus,
  handleUpdateOrderShippingAndStatus,
  orderNoteInput,
  setOrderNoteInput,
  savingOrderNote,
  handleSaveOrderNotes
}) {
  if (!selectedOrderDetails) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[9999]" data-reticle-target="admin-order-details-modal">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ORDER INVOICE & DETAILS</span>
            <h3 className="font-extrabold text-base sm:text-lg text-white font-mono">{selectedOrderDetails.order_number}</h3>
          </div>
          <button 
            type="button"
            onClick={() => setSelectedOrderDetails(null)} 
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <XCircle size={24} />
          </button>
        </div>

        <OrderCustomerCard
          selectedOrderDetails={selectedOrderDetails}
          setSelectedOrderDetails={setSelectedOrderDetails}
          adminFetch={adminFetch}
          fetchAdminData={fetchAdminData}
          showToast={showToast}
        />

        {/* CUSTOMER REMARK / SPECIAL INSTRUCTIONS HIGHLIGHT CARD */}
        {selectedOrderDetails.order_notes && (
          <div className="p-3.5 bg-amber-950/70 border border-amber-500/50 rounded-xl space-y-1 shadow-md">
            <div className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
              <MessageSquare size={16} /> 📝 Customer Remark & Special Instructions:
            </div>
            <p className="text-white text-xs font-semibold pl-6 italic">
              "{selectedOrderDetails.order_notes}"
            </p>
          </div>
        )}

        <OrderGstBreakdown
          selectedOrderDetails={selectedOrderDetails}
          settingsForm={settingsForm}
        />

        <OrderShiprocketCard
          selectedOrderDetails={selectedOrderDetails}
          setSelectedOrderDetails={setSelectedOrderDetails}
          adminFetch={adminFetch}
          fetchAdminData={fetchAdminData}
          showToast={showToast}
          setCourierInput={setCourierInput}
          setTrackingInput={setTrackingInput}
          setAdminOrderStatusInput={setAdminOrderStatusInput}
        />

        <OrderStatusControl
          selectedOrderDetails={selectedOrderDetails}
          setSelectedOrderDetails={setSelectedOrderDetails}
          adminOrderStatusInput={adminOrderStatusInput}
          setAdminOrderStatusInput={setAdminOrderStatusInput}
          courierInput={courierInput}
          setCourierInput={setCourierInput}
          trackingInput={trackingInput}
          setTrackingInput={setTrackingInput}
          adminCancelReasonInput={adminCancelReasonInput}
          setAdminCancelReasonInput={setAdminCancelReasonInput}
          updatingShippingStatus={updatingShippingStatus}
          handleUpdateOrderShippingAndStatus={handleUpdateOrderShippingAndStatus}
          adminFetch={adminFetch}
          fetchAdminData={fetchAdminData}
          showToast={showToast}
        />

        <OrderItemList
          selectedOrderDetails={selectedOrderDetails}
        />

        <OrderNotesForm
          orderNoteInput={orderNoteInput}
          setOrderNoteInput={setOrderNoteInput}
          savingOrderNote={savingOrderNote}
          handleSaveOrderNotes={handleSaveOrderNotes}
        />
      </div>
    </div>
  );
}

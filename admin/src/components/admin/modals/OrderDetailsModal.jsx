import { DEFAULT_FALLBACK_SVG, getProxyImgUrl } from '../../../utils/resolveImgUrl';
import React, { useState, useEffect } from 'react';
import { 
  XCircle, MessageSquare, Truck, RefreshCw, Printer, Send, 
  MapPin, FileText, Calendar, CheckCircle2, Phone, Mail, Edit3, Save
} from 'lucide-react';
import { resolveImgUrl } from '../../../utils/resolveImgUrl';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

const clean10Phone = (p) => {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  const m = digits.match(/[6-9]\d{9}/);
  if (m) return m[0];
  return digits.length > 10 ? digits.slice(-10) : digits;
};

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

  const [srLoading, setSrLoading] = useState(false);
  const [srActionMsg, setSrActionMsg] = useState('');
  const [couriersList, setCouriersList] = useState([]);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [srTrackingData, setSrTrackingData] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [pickupDateInput, setPickupDateInput] = useState('');
  const [schedulingPickup, setSchedulingPickup] = useState(false);

  // Editable customer & shipping state
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('Maharashtra');
  const [editPincode, setEditPincode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  // Extract 6-digit pincode from shipping address or explicit column
  const extractedPincode = (() => {
    if (selectedOrderDetails?.shipping_pincode) return String(selectedOrderDetails.shipping_pincode);
    if (!selectedOrderDetails?.shipping_address) return '';
    const match = selectedOrderDetails.shipping_address.match(/\b\d{6}\b/);
    return match ? match[0] : '';
  })();
  const [pincodeInput, setPincodeInput] = useState(extractedPincode || '');

  useEffect(() => {
    const rawPin = selectedOrderDetails?.shipping_pincode || (() => {
      if (!selectedOrderDetails?.shipping_address) return '';
      const match = selectedOrderDetails.shipping_address.match(/\b\d{6}\b/);
      return match ? match[0] : '';
    })();
    setPincodeInput(rawPin || '');
    setCouriersList([]);
    setSrTrackingData(null);
    setShowTracking(false);

    if (selectedOrderDetails) {
      setEditName(selectedOrderDetails.customer_name || '');
      setEditPhone(clean10Phone(selectedOrderDetails.customer_phone));
      setEditEmail(selectedOrderDetails.customer_email || '');
      setEditAddress(selectedOrderDetails.shipping_address || '');
      setEditCity(selectedOrderDetails.shipping_city || selectedOrderDetails.city || '');
      setEditState(selectedOrderDetails.shipping_state || selectedOrderDetails.state_name || 'Maharashtra');
      setEditPincode(rawPin || '');
      setIsEditingAddress(false);
    }
  }, [selectedOrderDetails?.id]);

  const handleSaveCustomerDetails = async (e) => {
    if (e) e.preventDefault();
    const cleanDigits = clean10Phone(editPhone);
    if (!cleanDigits || cleanDigits.length !== 10) {
      if (showToast) showToast('warning', '10-Digit Mobile Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    const cleanPin = String(editPincode || '').replace(/\D/g, '').slice(0, 6);
    if (!cleanPin || cleanPin.length !== 6) {
      if (showToast) showToast('warning', '6-Digit Pincode Required', 'Please enter a valid 6-digit delivery pincode.');
      return;
    }
    if (!editAddress.trim()) {
      if (showToast) showToast('warning', 'Address Required', 'Please enter the delivery street / house address.');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrderDetails.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: editName.trim(),
          customer_phone: cleanDigits,
          customer_email: editEmail.trim(),
          shipping_address: editAddress.trim(),
          shipping_city: editCity.trim(),
          shipping_state: editState.trim(),
          shipping_pincode: cleanPin,
          state_name: editState.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update customer & shipping details');
      }

      setSelectedOrderDetails(prev => ({
        ...prev,
        customer_name: editName.trim(),
        customer_phone: cleanDigits,
        customer_email: editEmail.trim(),
        shipping_address: editAddress.trim(),
        shipping_city: editCity.trim(),
        shipping_state: editState.trim(),
        shipping_pincode: cleanPin,
        state_name: editState.trim(),
        ...(data.order || {})
      }));
      setPincodeInput(cleanPin);
      setIsEditingAddress(false);
      if (fetchAdminData) fetchAdminData();
      if (showToast) showToast('success', 'Details Saved! ✅', 'Customer shipping address, state & 10-digit mobile updated.');
    } catch (err) {
      if (showToast) showToast('error', 'Update Failed', err.message);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleCheckCouriers = async () => {
    if (!pincodeInput || pincodeInput.trim().length !== 6) {
      if (showToast) showToast('warning', 'Pincode Required', 'Please enter a valid 6-digit Indian delivery pincode.');
      return;
    }
    setLoadingCouriers(true);
    try {
      const res = await adminFetch('/api/shipping/shiprocket/check-serviceability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_pincode: pincodeInput.trim(),
          cod: selectedOrderDetails?.remaining_amount > 0 ? 1 : 0,
          weight: 0.5
        })
      });
      const data = await res.json();
      if (data.serviceable && data.couriers && data.couriers.length > 0) {
        setCouriersList(data.couriers);
        if (!selectedCourierId) {
          setSelectedCourierId(String(data.couriers[0].id));
        }
        if (showToast) showToast('success', 'Serviceable', `Found ${data.couriers.length} courier options for pincode ${pincodeInput}.`);
      } else {
        setCouriersList([]);
        if (showToast) showToast('error', 'Not Serviceable', data.message || 'Pincode not serviceable by Shiprocket couriers.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Serviceability Check Failed', err.message);
    } finally {
      setLoadingCouriers(false);
    }
  };

  const handleQuickFulfillShiprocket = async () => {
    setSrLoading(true);
    setSrActionMsg('Preparing Shiprocket order...');
    try {
      let shipmentId = selectedOrderDetails?.shiprocket_shipment_id;
      if (!shipmentId) {
        setSrActionMsg('Creating shipment in Shiprocket...');
        const createRes = await adminFetch('/api/shipping/shiprocket/create-shipment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_id: selectedOrderDetails.id })
        });
        const createData = await createRes.json();
        if (!createRes.ok || !createData.success) {
          throw new Error(createData.error || 'Failed to create shipment in Shiprocket');
        }
        shipmentId = createData.shipment_id;
      }

      setSrActionMsg('Assigning courier & generating AWB...');
      const awbRes = await adminFetch('/api/shipping/shiprocket/assign-awb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrderDetails.id,
          shipment_id: shipmentId,
          courier_id: selectedCourierId || undefined
        })
      });
      const awbData = await awbRes.json();
      if (!awbRes.ok || !awbData.success) {
        throw new Error(awbData.error || 'Failed to assign AWB in Shiprocket');
      }

      setSelectedOrderDetails(prev => ({
        ...prev,
        shiprocket_awb: awbData.awb_code,
        shiprocket_courier_name: awbData.courier_name,
        courier_name: awbData.courier_name,
        tracking_number: awbData.awb_code,
        order_status: 'SHIPPED',
        shiprocket_status: 'AWB_ASSIGNED'
      }));
      setAdminOrderStatusInput('SHIPPED');
      setCourierInput(awbData.courier_name || '');
      setTrackingInput(awbData.awb_code || '');

      if (fetchAdminData) fetchAdminData();
      if (showToast) showToast('success', 'Order Dispatched via Shiprocket! 🚀', `AWB #${awbData.awb_code} generated (${awbData.courier_name}). Notification sent to customer.`);
    } catch (err) {
      if (showToast) showToast('error', 'Shiprocket Fulfillment Error', err.message);
    } finally {
      setSrLoading(false);
      setSrActionMsg('');
    }
  };

  const handlePrintLabel = async () => {
    setSrLoading(true);
    setSrActionMsg('Fetching Shipping Label PDF...');
    try {
      const res = await adminFetch('/api/shipping/shiprocket/generate-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: selectedOrderDetails.id })
      });
      const data = await res.json();
      if (data.label_url) {
        window.open(data.label_url, '_blank');
        if (showToast) showToast('success', 'Shipping Label Ready', 'Label opened in a new tab.');
      } else {
        throw new Error(data.message || 'No label URL returned by Shiprocket.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Label Generation Error', err.message);
    } finally {
      setSrLoading(false);
      setSrActionMsg('');
    }
  };

  const handlePrintInvoice = async () => {
    setSrLoading(true);
    setSrActionMsg('Fetching Tax Invoice PDF...');
    try {
      const res = await adminFetch('/api/shipping/shiprocket/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: selectedOrderDetails.id })
      });
      const data = await res.json();
      if (data.invoice_url) {
        window.open(data.invoice_url, '_blank');
        if (showToast) showToast('success', 'Tax Invoice Ready', 'Invoice opened in a new tab.');
      } else {
        throw new Error(data.message || 'No invoice URL returned by Shiprocket.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Invoice Error', err.message);
    } finally {
      setSrLoading(false);
      setSrActionMsg('');
    }
  };

  const handleSchedulePickup = async () => {
    setSchedulingPickup(true);
    try {
      const res = await adminFetch('/api/shipping/shiprocket/request-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrderDetails.id,
          pickup_date: pickupDateInput || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast('success', 'Pickup Scheduled! 📦', data.message || 'Courier pickup scheduled with Shiprocket.');
        if (fetchAdminData) fetchAdminData();
      } else {
        throw new Error(data.error || 'Failed to schedule pickup');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Pickup Schedule Failed', err.message);
    } finally {
      setSchedulingPickup(false);
    }
  };

  const handleFetchTracking = async () => {
    const awb = selectedOrderDetails?.shiprocket_awb || selectedOrderDetails?.tracking_number || selectedOrderDetails?.order_number;
    if (!awb) {
      if (showToast) showToast('warning', 'AWB Required', 'No AWB number assigned to this order yet.');
      return;
    }
    setLoadingTracking(true);
    setShowTracking(true);
    try {
      const res = await adminFetch(`/api/shipping/shiprocket/track/${encodeURIComponent(awb)}`);
      const data = await res.json();
      if (data.success && data.tracking) {
        setSrTrackingData(data.tracking);
      } else {
        throw new Error(data.error || 'Unable to fetch tracking details from Shiprocket.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Tracking Error', err.message);
    } finally {
      setLoadingTracking(false);
    }
  };

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

        <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={13} className="text-emerald-400" /> Customer & Shipping Destination
            </span>
            <button
              type="button"
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {isEditingAddress ? '✕ Close Edit' : '✏️ Edit Shipping / Customer Details'}
            </button>
          </div>

          {!isEditingAddress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="font-extrabold text-white text-sm flex items-center gap-2">
                  <span>{selectedOrderDetails.customer_name || 'Valued Customer'}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    +91 {clean10Phone(selectedOrderDetails.customer_phone)}
                  </span>
                </div>
                <div className="text-emerald-400 font-mono text-[11px] break-all flex items-center gap-1">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span>{selectedOrderDetails.customer_email || 'No email provided'}</span>
                </div>
                
                <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                  <div className="font-medium text-white flex items-start gap-1">
                    <MapPin size={13} className="text-indigo-400 shrink-0 mt-0.5" />
                    <span>{selectedOrderDetails.shipping_address || 'No street address provided'}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] pl-4">
                    {[
                      selectedOrderDetails.shipping_city || selectedOrderDetails.city,
                      selectedOrderDetails.shipping_state || selectedOrderDetails.state_name || 'Maharashtra',
                      selectedOrderDetails.shipping_pincode ? `PIN: ${selectedOrderDetails.shipping_pincode}` : ''
                    ].filter(Boolean).join(', ')}
                  </div>
                  <div className="text-slate-500 text-[10px] pl-4">Country: {selectedOrderDetails.country || 'India'}</div>
                </div>
              </div>

              <div className="space-y-1 text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Payment & Shipping Summary:</span>
                <div className="font-extrabold text-white text-sm">Mode: {selectedOrderDetails.payment_mode}</div>
                <div className="text-emerald-400 font-black text-base">Total: ₹{selectedOrderDetails.total_amount}</div>
                <div className="text-emerald-300 font-bold">Paid Deposit: ₹{selectedOrderDetails.paid_amount}</div>
                <div className="text-amber-400 font-bold">COD Balance Due: ₹{selectedOrderDetails.remaining_amount}</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveCustomerDetails} className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Customer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="Customer Name"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Mobile Number * (10 Digits Only)</label>
                  <div className="flex items-center">
                    <span className="px-2.5 py-1.5 bg-slate-750 border border-r-0 border-slate-700 rounded-l-lg text-slate-400 text-xs font-mono font-bold">
                      +91
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-r-lg text-white font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="customer@email.com"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Delivery Street Address / Flat / Building *</label>
                <textarea
                  rows={2}
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs focus:border-emerald-500 focus:outline-none"
                  placeholder="Flat No, Building, Street, Landmark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">State *</label>
                  <select
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Delivery Pincode * (6 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs font-bold focus:border-emerald-500 focus:outline-none text-center"
                    placeholder="e.g. 400001"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {savingAddress ? <RefreshCw size={12} className="animate-spin" /> : null}
                  💾 Save Customer & Shipping Details
                </button>
              </div>
            </form>
          )}
        </div>

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

        {/* GST TAX INVOICE BREAKDOWN & RETURN REVERSAL CARD */}
        {(() => {
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
        })()}

        {/* SHIPROCKET AUTOMATED LOGISTICS & FULFILLMENT CARD */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 p-4 rounded-xl border border-indigo-700/60 space-y-3.5 text-xs shadow-lg" data-reticle-target="admin-shiprocket-card">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 text-sm">
                🚀
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-widest font-mono">
                  LOGISTICS AUTOMATION (SHIPROCKET API V2)
                </span>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  1-Click Courier Fulfillment & AWB Generation
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {selectedOrderDetails.shiprocket_awb ? (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2.5 py-1 rounded-md font-mono text-[11px] font-black flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-400" /> AWB: {selectedOrderDetails.shiprocket_awb}
                </span>
              ) : (
                <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2.5 py-1 rounded-md text-[11px] font-bold">
                  ⚡ Ready to Dispatch
                </span>
              )}
            </div>
          </div>

          {/* IF AWB NOT YET GENERATED: FULFILLMENT DISPATCH INTERFACE */}
          {!selectedOrderDetails.shiprocket_awb ? (
            <div className="space-y-3">
              <div className="bg-slate-850/90 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-slate-300 text-[11px] flex items-center gap-1">
                    <MapPin size={13} className="text-indigo-400" /> Destination Pincode Serviceability:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 560001"
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                      className="w-24 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs focus:border-indigo-500 focus:outline-none text-center"
                    />
                    <button
                      type="button"
                      onClick={handleCheckCouriers}
                      disabled={loadingCouriers}
                      className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-700/50 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {loadingCouriers ? <RefreshCw size={12} className="animate-spin" /> : '🔍 Check Couriers & Rates'}
                    </button>
                  </div>
                </div>

                {couriersList.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">
                      Select Courier Partner (Ranked by Speed & Cost):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {couriersList.map((c) => (
                        <label
                          key={c.id}
                          className={`p-2 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                            String(selectedCourierId) === String(c.id)
                              ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                              : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="shiprocket_courier"
                              value={c.id}
                              checked={String(selectedCourierId) === String(c.id)}
                              onChange={() => setSelectedCourierId(String(c.id))}
                              className="accent-indigo-500"
                            />
                            <div>
                              <span className="font-bold text-xs block">{c.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {c.etd ? `ETD: ${c.etd}` : `${c.estimated_delivery_days || 3} days`} • ⭐ {c.rating || 4.5}
                              </span>
                            </div>
                          </div>
                          <span className="font-mono font-extrabold text-emerald-400 text-xs">
                            ₹{c.rate}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 1-CLICK FULFILLMENT BUTTON */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-slate-400">
                  Will push to Shiprocket, generate courier AWB, update order to SHIPPED, and email tracking details to customer.
                </span>
                <button
                  type="button"
                  onClick={handleQuickFulfillShiprocket}
                  disabled={srLoading}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all text-xs"
                >
                  {srLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> {srActionMsg || 'Processing...'}
                    </>
                  ) : (
                    <>
                      <span>🚀 1-Click Shiprocket Fulfillment</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* IF AWB ALREADY GENERATED: ACTIONS & LIVE TRACKING */
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-850 p-3 rounded-xl border border-slate-800 text-center font-mono">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <span className="text-[9px] uppercase text-slate-400 block">Courier Partner</span>
                  <span className="font-bold text-indigo-300 text-xs truncate block">
                    {selectedOrderDetails.shiprocket_courier_name || selectedOrderDetails.courier_name || 'Assigned'}
                  </span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg">
                  <span className="text-[9px] uppercase text-slate-400 block">AWB / Tracking #</span>
                  <span className="font-bold text-emerald-400 text-xs truncate block">
                    {selectedOrderDetails.shiprocket_awb || selectedOrderDetails.tracking_number}
                  </span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg">
                  <span className="text-[9px] uppercase text-slate-400 block">Shiprocket Status</span>
                  <span className="font-bold text-blue-400 text-xs truncate block">
                    {selectedOrderDetails.shiprocket_status || 'AWB_ASSIGNED'}
                  </span>
                </div>
                <div className="p-2 bg-slate-800 rounded-lg">
                  <span className="text-[9px] uppercase text-slate-400 block">Pickup Schedule</span>
                  <span className="font-bold text-amber-400 text-xs truncate block">
                    {selectedOrderDetails.pickup_scheduled_date ? `Scheduled (${selectedOrderDetails.pickup_scheduled_date})` : 'Pending'}
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS TOOLBAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={handlePrintLabel}
                  disabled={srLoading}
                  className="bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-700/40 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <FileText size={14} /> Print AWB Label
                </button>

                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  disabled={srLoading}
                  className="bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-700/40 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  <Printer size={14} /> Print Tax Invoice
                </button>

                <button
                  type="button"
                  onClick={handleSchedulePickup}
                  disabled={schedulingPickup}
                  className="bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-700/40 p-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  {schedulingPickup ? <RefreshCw size={14} className="animate-spin" /> : <Calendar size={14} />} Schedule Pickup
                </button>

                <button
                  type="button"
                  onClick={handleFetchTracking}
                  disabled={loadingTracking}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  {loadingTracking ? <RefreshCw size={14} className="animate-spin" /> : <Truck size={14} />} Live Tracking
                </button>
              </div>

              {/* LIVE TRACKING TIMELINE DRAWER */}
              {showTracking && (
                <div className="p-3.5 bg-slate-900 border border-indigo-600/60 rounded-xl space-y-2.5 mt-2 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-extrabold text-indigo-400 flex items-center gap-1.5 text-xs">
                      📡 Real-Time Courier Checkpoints & Scans
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowTracking(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {loadingTracking ? (
                    <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <RefreshCw size={14} className="animate-spin text-indigo-400" /> Fetching live tracking from Shiprocket...
                    </div>
                  ) : srTrackingData ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-mono">Current Status:</span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            {srTrackingData.current_status || 'IN TRANSIT'}
                          </span>
                        </div>
                        {srTrackingData.etd && (
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase block font-mono">Estimated Delivery:</span>
                            <span className="font-bold text-white text-xs">{srTrackingData.etd}</span>
                          </div>
                        )}
                      </div>

                      {srTrackingData.scans && srTrackingData.scans.length > 0 ? (
                        <div className="relative pl-4 space-y-3 pt-2 border-l-2 border-indigo-600/40 ml-2">
                          {srTrackingData.scans.map((scan, sIdx) => (
                            <div key={sIdx} className="relative">
                              <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ${sIdx === 0 ? 'bg-indigo-400 ring-4 ring-indigo-500/30' : 'bg-slate-600'}`}></div>
                              <div className="text-white font-bold text-xs">{scan.activity || scan['sr-status-label']}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span>{scan.date}</span>
                                {scan.location && <span>• 📍 {scan.location}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-xs italic text-center py-2">
                          Order has been booked with courier ({selectedOrderDetails.shiprocket_courier_name || 'Courier'}). Awaiting first transit hub scan.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs text-center py-2">
                      No tracking scans available yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ADMIN SHIPPING & CANCELLATION CONTROL CARD */}
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
                        onClick={async () => {
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
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shadow cursor-pointer transition-colors"
                      >
                        <span>💸 Approve Refund (₹{selectedOrderDetails.paid_amount})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
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
                      }}
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

        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-400 block">Itemized Purchased Products ({selectedOrderDetails.items?.length || 0}):</span>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-850 overflow-hidden">
            {selectedOrderDetails.items?.map((item, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={resolveImgUrl(item.thumbnail || item.image_url)} alt={item.product_title} onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_FALLBACK_SVG; }} className="w-10 h-10 object-cover rounded-lg border border-slate-700" />
                  <div>
                    <div className="font-bold text-white text-sm">{item.product_title}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {item.variant_name ? (
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2.5 py-0.5 rounded-md font-extrabold text-[11px] flex items-center gap-1 shadow-sm">
                          📦 Variant: {item.variant_name}
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md font-bold text-[10px]">
                          Standard Item
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        SKU: <strong className="text-slate-200">{item.variant_sku || item.product_sku}</strong>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white">Qty: {item.quantity}</span>
                  <div className="font-black text-emerald-400">₹{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-black uppercase text-emerald-400 block flex items-center gap-1.5">
            <MessageSquare size={14} /> Order Notes & Customer Delivery Instructions:
          </span>

          <form onSubmit={handleSaveOrderNotes} className="space-y-2">
            <textarea 
              rows={3}
              placeholder="Add delivery instructions, special customer requests, or admin shipping message..."
              value={orderNoteInput}
              onChange={(e) => setOrderNoteInput(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
            ></textarea>

            <div className="flex justify-between items-center">
              <button 
                type="button"
                onClick={() => window.print()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <Printer size={14} /> Print Invoice
              </button>

              <button 
                type="submit"
                disabled={savingOrderNote}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
              >
                {savingOrderNote ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Saving Note...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Save Order Note
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

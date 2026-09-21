import React, { useState, useEffect } from 'react';
import { MapPin, Mail, RefreshCw } from 'lucide-react';

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

export default function OrderCustomerCard({
  selectedOrderDetails,
  setSelectedOrderDetails,
  adminFetch,
  fetchAdminData,
  showToast
}) {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('Maharashtra');
  const [editPincode, setEditPincode] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    const rawPin = selectedOrderDetails?.shipping_pincode || (() => {
      if (!selectedOrderDetails?.shipping_address) return '';
      const match = selectedOrderDetails.shipping_address.match(/\b\d{6}\b/);
      return match ? match[0] : '';
    })();

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
  }, [selectedOrderDetails?.id, selectedOrderDetails]);

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
      setEditPincode(cleanPin);
      setIsEditingAddress(false);
      if (fetchAdminData) fetchAdminData();
      if (showToast) showToast('success', 'Details Saved! ✅', 'Customer shipping address, state & 10-digit mobile updated.');
    } catch (err) {
      if (showToast) showToast('error', 'Update Failed', err.message);
    } finally {
      setSavingAddress(false);
    }
  };

  return (
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
  );
}

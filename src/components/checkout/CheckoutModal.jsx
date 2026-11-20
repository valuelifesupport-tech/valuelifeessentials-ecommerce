import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Plus, MapPin, Home, Briefcase, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { INDIAN_STATES } from '../profile/tabs/ProfileDetailsTab';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl } from '../../config/env';

export default function CheckoutModal({
  isOpen,
  onClose,
  checkoutData,
  cart = [],
  currencySymbol = '₹',
  customerForm,
  setCustomerForm,
  currentUser,
  handleOrderSubmit,
  isSubmittingOrder,
  selectedPaymentGateway,
  setSelectedPaymentGateway,
  orderSuccess,
  setOrderSuccess,
  navigateTo
}) {
  const { updateUser } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    type: 'Home'
  });
  const [addressFormError, setAddressFormError] = useState('');
  const [isSavingNewAddress, setIsSavingNewAddress] = useState(false);

  // Auto-fill logged-in user credentials and address when checkout opens
  useEffect(() => {
    if (isOpen && currentUser) {
      const rawEmail = currentUser.email || '';
      const cleanEmail = (!rawEmail || rawEmail.includes('@valuelifeessentials.com') || rawEmail.includes('@temporary.com')) ? '' : rawEmail;
      const rawName = currentUser.name || '';
      const cleanName = (!rawName || rawName.startsWith('Customer ')) ? '' : rawName;
      const cleanPhone = currentUser.phone ? currentUser.phone.replace(/\D/g, '').slice(-10) : '';

      const defAddr = Array.isArray(currentUser.addresses) && currentUser.addresses.length > 0 
        ? (currentUser.addresses.find(a => a.is_default) || currentUser.addresses[0]) 
        : null;

      if (defAddr) {
        setSelectedAddressId(defAddr.id);
        const fullAddrStr = `${defAddr.address}, ${defAddr.city}, ${defAddr.state} - ${defAddr.pincode}`;
        setCustomerForm(prev => ({
          name: prev?.name || defAddr.name || cleanName || '',
          phone: prev?.phone || defAddr.phone || cleanPhone || '',
          email: prev?.email || cleanEmail || '',
          address: prev?.address || fullAddrStr,
          remark: prev?.remark || ''
        }));
      } else {
        setCustomerForm(prev => ({
          name: prev?.name || cleanName || '',
          phone: prev?.phone || cleanPhone || '',
          email: prev?.email || cleanEmail || '',
          address: prev?.address || currentUser.address || localStorage.getItem('user_last_shipping_address') || '',
          remark: prev?.remark || ''
        }));
      }

      setAddressFormData(prev => ({
        ...prev,
        name: cleanName || prev.name || '',
        phone: cleanPhone || prev.phone || ''
      }));
    }
  }, [isOpen, currentUser, setCustomerForm]);

  const handleOpenAddAddress = () => {
    const rawName = currentUser?.name || customerForm?.name || '';
    const cleanName = (!rawName || rawName.startsWith('Customer ')) ? '' : rawName;
    const rawPhone = currentUser?.phone || customerForm?.phone || '';
    const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '').slice(-10) : '';

    setAddressFormData({
      name: cleanName,
      phone: cleanPhone,
      address: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      type: 'Home'
    });
    setAddressFormError('');
    setShowAddAddressForm(true);
  };

  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    setAddressFormError('');

    const nameTrimmed = (addressFormData.name || '').trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      setAddressFormError('Contact recipient name is required.');
      return;
    }

    const cleanPhone = (addressFormData.phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setAddressFormError('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    const addressTrimmed = (addressFormData.address || '').trim();
    if (!addressTrimmed || addressTrimmed.length < 5) {
      setAddressFormError('Complete delivery street address is required.');
      return;
    }

    const cityTrimmed = (addressFormData.city || '').trim();
    if (!cityTrimmed || cityTrimmed.length < 2) {
      setAddressFormError('City is required.');
      return;
    }

    const cleanPincode = (addressFormData.pincode || '').trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      setAddressFormError('PIN code must be exactly 6 digits (e.g. 400001).');
      return;
    }

    setIsSavingNewAddress(true);
    const newAddressId = 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const newAddrObj = {
      id: newAddressId,
      name: nameTrimmed,
      phone: cleanPhone,
      address: addressTrimmed,
      city: cityTrimmed,
      state: addressFormData.state || 'Maharashtra',
      pincode: cleanPincode,
      type: addressFormData.type || 'Home',
      is_default: (!currentUser?.addresses || currentUser.addresses.length === 0)
    };

    const currentList = Array.isArray(currentUser?.addresses) ? currentUser.addresses : [];
    const updatedList = [...currentList, newAddrObj];
    const fullAddrStr = `${newAddrObj.address}, ${newAddrObj.city}, ${newAddrObj.state} - ${newAddrObj.pincode}`;

    // Update parent customerForm
    setCustomerForm(prev => ({
      ...(prev || {}),
      name: newAddrObj.name,
      phone: newAddrObj.phone,
      address: fullAddrStr
    }));
    setSelectedAddressId(newAddressId);
    setShowAddAddressForm(false);

    // Persist to user profile in backend if user is logged in
    if (currentUser) {
      try {
        if (typeof updateUser === 'function') {
          updateUser({ addresses: updatedList });
        }
        const identifier = currentUser.id || currentUser.email || currentUser.phone;
        const token = currentUser.token || localStorage.getItem('customer_token');
        if (identifier) {
          await fetch(getApiUrl(`/api/users/${encodeURIComponent(identifier)}/profile`), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ addresses: updatedList })
          });
        }
      } catch (err) {
        console.warn('Silent address save warning:', err.message);
      }
    }
    setIsSavingNewAddress(false);
  };

  if (!isOpen && !orderSuccess) return null;

  return (
    <>
      {/* CHECKOUT MODAL */}
      {isOpen && checkoutData && !orderSuccess && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]" data-reticle-target="checkout-modal-backdrop">
          <div className="bg-white border border-gray-200 text-gray-900 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto relative custom-scrollbar" data-reticle-target="checkout-modal-dialog">
            <div className="flex justify-between items-center border-b pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🛍️</span>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 font-['Outfit']">Delivery & Payment</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Verify your shipping address and confirm your order</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-700 font-bold text-lg cursor-pointer p-1 rounded-lg"
                data-reticle-target="checkout-close-btn"
              >
                ✕
              </button>
            </div>

            {/* ORDER PRICE BREAKDOWN SUMMARY */}
            <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/80 text-xs space-y-1.5 shadow-2xs">
              <div className="flex justify-between font-bold text-gray-700 pb-1 border-b border-emerald-200/60">
                <span>Items Subtotal ({cart.length} {cart.length === 1 ? 'item' : 'items'}):</span>
                <span>{currencySymbol}{checkoutData.rawSubtotal || checkoutData.finalTotal}</span>
              </div>

              {Number(checkoutData.discountAmount || 0) > 0 && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Coupon Discount:</span>
                  <span>-{currencySymbol}{checkoutData.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-gray-700">
                <span>Delivery Charges:</span>
                {Number(checkoutData.shippingAmount || 0) > 0 ? (
                  <span>+{currencySymbol}{checkoutData.shippingAmount}</span>
                ) : (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-extrabold">FREE 🚚</span>
                )}
              </div>

              {!checkoutData.isTaxInclusive ? (
                <div className="flex justify-between font-bold text-amber-800">
                  <span>GST Tax (Added at Checkout):</span>
                  <span>+{currencySymbol}{checkoutData.taxAmount || 0}</span>
                </div>
              ) : (
                <div className="flex justify-between font-medium text-emerald-800">
                  <span>Included GST Tax:</span>
                  <span>(Includes {currencySymbol}{checkoutData.taxAmount || 0} GST)</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-gray-900 pt-1.5 border-t border-emerald-300">
                <span className="text-sm">Total Order Amount:</span>
                <span className="text-emerald-800 text-base font-black">{currencySymbol}{checkoutData.finalTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-0.5">
                <span>Payment Mode Selected:</span>
                <span>
                  {checkoutData.paymentMode === 'PARTIAL' 
                    ? '⚡ Partial Deposit (Balance on COD)' 
                    : checkoutData.paymentMode === 'COD' 
                    ? '💵 Cash on Delivery (COD)' 
                    : '💳 Full Online Prepaid'}
                </span>
              </div>
              {checkoutData.paymentMode === 'PARTIAL' && (
                <div className="flex justify-between font-extrabold text-emerald-900 pt-1 border-t border-emerald-300">
                  <span>Pay Deposit Online Now:</span>
                  <span>{currencySymbol}{checkoutData.depositAmount}</span>
                </div>
              )}
              {checkoutData.paymentMode === 'COD' && (
                <div className="flex justify-between font-extrabold text-amber-950 pt-1 border-t border-amber-300">
                  <span>Pay Online Now:</span>
                  <span className="text-emerald-700 font-black">{currencySymbol}0 (Pay full cash on delivery)</span>
                </div>
              )}
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3.5 text-xs" data-reticle-target="checkout-form">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" required placeholder="Enter recipient full name"
                  value={customerForm?.name || ''}
                  onChange={(e) => setCustomerForm(prev => ({ ...(prev || {}), name: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
                  data-reticle-target="checkout-input-name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number *</label>
                  <input 
                    type="tel" required placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    value={customerForm?.phone || ''}
                    onChange={(e) => setCustomerForm(prev => ({ ...(prev || {}), phone: e.target.value.replace(/\D/g, '') }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none font-mono"
                    data-reticle-target="checkout-input-phone"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1 flex items-center justify-between">
                    <span>Email Address (Optional)</span>
                    <span className="text-[10px] text-gray-400 font-normal">For invoice & tracking</span>
                  </label>
                  <input 
                    type="email" placeholder="Enter email address (Optional)"
                    value={customerForm?.email || ''}
                    onChange={(e) => setCustomerForm(prev => ({ ...(prev || {}), email: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
                    data-reticle-target="checkout-input-email"
                  />
                </div>
              </div>

              {/* SAVED DELIVERY ADDRESS SELECTOR & MULTI-ADDRESS MANAGER */}
              <div className="space-y-2 p-3 bg-gray-50/90 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-gray-800 text-xs flex items-center gap-1.5">
                    <span>📍</span>
                    <span>Delivery Address</span>
                    {Array.isArray(currentUser?.addresses) && currentUser.addresses.length > 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full ml-1">
                        {currentUser.addresses.length} saved
                      </span>
                    )}
                  </label>

                  {!showAddAddressForm && (
                    <button
                      type="button"
                      onClick={handleOpenAddAddress}
                      className="text-[11px] font-extrabold text-[#3b6e14] hover:text-[#2d560f] flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs hover:border-[#3b6e14] transition-all"
                      data-reticle-target="checkout-add-new-address-btn"
                    >
                      <Plus size={13} />
                      <span>+ Add New Address</span>
                    </button>
                  )}
                </div>

                {/* INLINE ADD ADDRESS FORM */}
                {showAddAddressForm && (
                  <div className="bg-white border-2 border-emerald-500/50 rounded-xl p-3.5 space-y-3 mt-2 animate-fadeIn shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#3b6e14]" />
                        <span>Add New Delivery Address</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => { setShowAddAddressForm(false); setAddressFormError(''); }}
                        className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {addressFormError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} className="shrink-0 text-red-500" />
                        <span>{addressFormError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-gray-700 font-bold text-[11px] mb-0.5">Recipient Name *</label>
                        <input
                          type="text" required placeholder="Full Name"
                          value={addressFormData.name}
                          onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-[11px] mb-0.5">Phone Number *</label>
                        <input
                          type="text" required maxLength={10} placeholder="10-digit mobile"
                          value={addressFormData.phone}
                          onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value.replace(/\D/g, '') })}
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:bg-white outline-none font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-700 font-bold text-[11px] mb-0.5">House / Flat / Street Address *</label>
                        <textarea
                          rows={2} required placeholder="Flat/House No., Building, Street, Area"
                          value={addressFormData.address}
                          onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-[11px] mb-0.5">City *</label>
                        <input
                          type="text" required placeholder="City"
                          value={addressFormData.city}
                          onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:bg-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-bold text-[11px] mb-0.5">PIN Code (6 Digits) *</label>
                        <input
                          type="text" required maxLength={6} placeholder="e.g. 400001"
                          value={addressFormData.pincode}
                          onChange={(e) => setAddressFormData({ ...addressFormData, pincode: e.target.value.replace(/\D/g, '') })}
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:bg-white outline-none font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-gray-700 font-bold text-[11px] mb-0.5">State *</label>
                        <select
                          value={addressFormData.state}
                          onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                          className="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold focus:border-emerald-600 focus:bg-white outline-none cursor-pointer"
                        >
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center justify-between pt-1">
                        <div className="flex gap-2">
                          {['Home', 'Work'].map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setAddressFormData({ ...addressFormData, type })}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                                addressFormData.type === type 
                                  ? 'bg-[#3b6e14] text-white border-[#3b6e14]' 
                                  : 'bg-white text-gray-700 border-gray-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setShowAddAddressForm(false); setAddressFormError(''); }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-[11px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isSavingNewAddress}
                            onClick={handleSaveNewAddress}
                            className="px-3.5 py-1.5 bg-[#3b6e14] hover:bg-[#2d560f] text-white rounded-lg text-[11px] font-extrabold cursor-pointer shadow-xs disabled:opacity-50"
                          >
                            {isSavingNewAddress ? 'Saving...' : 'Save & Deliver Here'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SAVED ADDRESS LIST (IF EXISTS) */}
                {Array.isArray(currentUser?.addresses) && currentUser.addresses.length > 0 && !showAddAddressForm && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {currentUser.addresses.map((addr) => {
                      const fullAddrStr = `${addr.address}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
                      const isSelected = selectedAddressId === addr.id || (!selectedAddressId && addr.is_default);
                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setCustomerForm(prev => ({
                              ...(prev || {}),
                              name: addr.name || prev?.name || currentUser.name || '',
                              phone: addr.phone || prev?.phone || currentUser.phone || '',
                              address: fullAddrStr
                            }));
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                            isSelected 
                              ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-xs' 
                              : 'border-gray-200 bg-white hover:bg-gray-100/60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="checkout_selected_address"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-0.5 text-emerald-600 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-gray-900">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 border border-gray-200 text-gray-700 font-extrabold">
                                {addr.type || 'Home'}
                              </span>
                              <span>{addr.name || currentUser.name}</span>
                              {addr.is_default && (
                                <span className="text-[9px] bg-[#3b6e14] text-white font-extrabold px-1.5 py-0.5 rounded-full">DEFAULT</span>
                              )}
                            </div>
                            <p className="text-gray-700 truncate mt-0.5 text-[11px] font-medium">{addr.address}, {addr.city}</p>
                            <p className="text-gray-500 text-[10px] font-mono">{addr.state} - {addr.pincode}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CURRENT / MANUAL ADDRESS INPUT */}
                <div>
                  <textarea 
                    rows={2} required placeholder="Enter house no., building, street, area, city, pincode"
                    value={customerForm?.address || ''}
                    onChange={(e) => {
                      setSelectedAddressId(null);
                      setCustomerForm(prev => ({ ...(prev || {}), address: e.target.value }));
                    }}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                    data-reticle-target="checkout-input-address"
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span>📝 Order Remark & Special Instructions (Optional)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="Any special delivery instructions (optional)..."
                  value={customerForm?.remark || ''}
                  onChange={(e) => setCustomerForm(prev => ({ ...(prev || {}), remark: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-medium focus:border-emerald-600 focus:bg-white focus:outline-none text-xs"
                  data-reticle-target="checkout-input-remark"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl border border-gray-200 cursor-pointer text-xs"
                  data-reticle-target="checkout-cancel-btn"
                >
                  Cancel
                </button>

                <button 
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  data-reticle-target="checkout-submit-btn"
                >
                  {isSubmittingOrder ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order ({currencySymbol}{checkoutData.paymentMode === 'PARTIAL' ? checkoutData.depositAmount : checkoutData.finalTotal})</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS CONFIRMATION MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-fade-in" data-reticle-target="order-success-modal">
          <div className="relative bg-slate-900 border border-emerald-500/30 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-emerald-950/80 animate-pop-bounce overflow-hidden">
            
            {/* FLOATING CELEBRATORY SPARKLES & CONFETTI */}
            <div className="absolute top-3 left-4 text-xl animate-float-particle">✨</div>
            <div className="absolute top-6 right-6 text-xl animate-float-particle" style={{ animationDelay: '0.6s' }}>🎉</div>
            <div className="absolute bottom-6 left-6 text-lg animate-float-particle" style={{ animationDelay: '1.2s' }}>📦</div>
            <div className="absolute bottom-4 right-5 text-xl animate-float-particle" style={{ animationDelay: '1.8s' }}>🌱</div>

            {/* GLOWING DOUBLE-RING CHECKMARK AVATAR */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-18 h-18 bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 rounded-full flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-500/50">
                ✓
              </div>
            </div>

            {/* HEADER BADGE & ORDER TITLE */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span>ORDER PLACED SUCCESSFULLY!</span>
              </div>
              <h3 className="font-extrabold text-2xl sm:text-3xl text-white font-['Outfit'] tracking-tight">
                {orderSuccess.order_number || orderSuccess.orderNumber || '#OB-88219'}
              </h3>
            </div>

            {/* CALIBRATED ORDER BREAKDOWN CARD */}
            <div className="bg-slate-850/90 rounded-2xl p-4 border border-slate-700/80 space-y-3 text-xs text-left shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium">Estimated Delivery:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🚚 2-3 Business Days
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium">Payment Mode:</span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                  {orderSuccess.payment_mode || 'Partial COD (20% Paid)'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300 font-extrabold text-sm">Order Total:</span>
                <span className="text-white font-black text-base font-['Outfit']">
                  {currencySymbol} {orderSuccess.total_amount || orderSuccess.totalAmount || '499.00'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Thank you for shopping with ValueLife Essentials (valuelifeessentials.com)! Your order confirmation has been registered and is being processed for express home delivery.
            </p>

            {/* DUAL ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => { 
                  setOrderSuccess(null); 
                  onClose(); 
                  navigateTo('/account', { view: 'account', slug: null, category: null, collection: null }); 
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                data-reticle-target="order-success-view-orders"
              >
                <span>📦 View My Orders</span>
              </button>
              <button 
                onClick={() => { 
                  setOrderSuccess(null); 
                  onClose(); 
                  navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null }); 
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/80 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                data-reticle-target="order-success-continue-shopping"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

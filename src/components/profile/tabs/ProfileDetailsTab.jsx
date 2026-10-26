import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Home, 
  Briefcase, 
  MapPin, 
  Star, 
  AlertCircle,
  X
} from 'lucide-react';

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

export default function ProfileDetailsTab({
  profileForm,
  setProfileForm,
  savingProfile,
  onSubmit
}) {
  // State for adding / editing a specific address
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null); // null means adding new
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    type: 'Home',
    is_default: false
  });
  const [addressFormError, setAddressFormError] = useState('');

  // Normalize addresses array in profileForm
  const addresses = Array.isArray(profileForm.addresses) ? profileForm.addresses : [];

  // If addresses array is empty but legacy single address fields exist, initialize address list
  useEffect(() => {
    if (addresses.length === 0 && (profileForm.address || profileForm.city || profileForm.pincode)) {
      const initialAddr = {
        id: 'addr_' + Date.now(),
        name: profileForm.name || '',
        phone: profileForm.phone || '',
        address: profileForm.address || '',
        landmark: '',
        city: profileForm.city || '',
        state: profileForm.state || 'Maharashtra',
        pincode: profileForm.pincode || '',
        type: 'Home',
        is_default: true
      };
      setProfileForm(prev => ({
        ...prev,
        addresses: [initialAddr]
      }));
    }
  }, [profileForm.address, profileForm.city, profileForm.pincode, addresses.length, setProfileForm]);

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressFormData({
      name: profileForm.name || '',
      phone: profileForm.phone || '',
      address: '',
      landmark: '',
      city: profileForm.city || '',
      state: profileForm.state || 'Maharashtra',
      pincode: '',
      type: 'Home',
      is_default: addresses.length === 0
    });
    setAddressFormError('');
    setIsEditingAddress(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr.id);
    setAddressFormData({
      name: addr.name || profileForm.name || '',
      phone: addr.phone || profileForm.phone || '',
      address: addr.address || '',
      landmark: addr.landmark || '',
      city: addr.city || '',
      state: addr.state || 'Maharashtra',
      pincode: addr.pincode || '',
      type: addr.type || 'Home',
      is_default: Boolean(addr.is_default)
    });
    setAddressFormError('');
    setIsEditingAddress(true);
  };

  const handleCancelAddressForm = () => {
    setIsEditingAddress(false);
    setEditingAddressId(null);
    setAddressFormError('');
  };

  const handleSaveAddressForm = (e) => {
    e.preventDefault();
    setAddressFormError('');

    // --- Strict Field Validations ---
    const nameTrimmed = (addressFormData.name || '').trim();
    if (!nameTrimmed || nameTrimmed.length < 2) {
      setAddressFormError('Contact recipient name is mandatory (minimum 2 characters).');
      return;
    }

    const cleanPhone = (addressFormData.phone || '').replace(/\D/g, '').slice(-10);
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setAddressFormError('Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.');
      return;
    }

    const addressTrimmed = (addressFormData.address || '').trim();
    if (!addressTrimmed || addressTrimmed.length < 5) {
      setAddressFormError('Complete street address is mandatory (minimum 5 characters).');
      return;
    }

    const cityTrimmed = (addressFormData.city || '').trim();
    if (!cityTrimmed || cityTrimmed.length < 2) {
      setAddressFormError('City is mandatory.');
      return;
    }

    if (!addressFormData.state || !INDIAN_STATES.includes(addressFormData.state)) {
      setAddressFormError('Please select a valid Indian State or Union Territory.');
      return;
    }

    const cleanPincode = (addressFormData.pincode || '').trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      setAddressFormError('PIN code is mandatory and must be exactly 6 digits (e.g. 400001, first digit cannot be 0).');
      return;
    }

    let updatedList = [...addresses];

    if (editingAddressId) {
      // Update existing address
      updatedList = updatedList.map(a => {
        if (a.id === editingAddressId) {
          return {
            ...a,
            ...addressFormData,
            name: nameTrimmed,
            phone: cleanPhone,
            address: addressTrimmed,
            city: cityTrimmed,
            pincode: cleanPincode
          };
        }
        return a;
      });
    } else {
      // Add new address
      const newAddress = {
        id: 'addr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        ...addressFormData,
        name: nameTrimmed,
        phone: cleanPhone,
        address: addressTrimmed,
        city: cityTrimmed,
        pincode: cleanPincode
      };
      updatedList.push(newAddress);
    }

    // Handle is_default logic
    if (addressFormData.is_default || updatedList.length === 1) {
      const activeId = editingAddressId || updatedList[updatedList.length - 1].id;
      updatedList = updatedList.map(a => ({
        ...a,
        is_default: a.id === activeId
      }));
    } else {
      // Ensure at least one default
      const hasDefault = updatedList.some(a => a.is_default);
      if (!hasDefault && updatedList.length > 0) {
        updatedList[0].is_default = true;
      }
    }

    // Sync default address to primary profileForm fields for instant checkout backward compatibility
    const defaultAddr = updatedList.find(a => a.is_default) || updatedList[0];

    setProfileForm(prev => ({
      ...prev,
      addresses: updatedList,
      address: defaultAddr?.address || prev.address,
      city: defaultAddr?.city || prev.city,
      state: defaultAddr?.state || prev.state,
      pincode: defaultAddr?.pincode || prev.pincode,
      phone: defaultAddr?.phone || prev.phone
    }));

    setIsEditingAddress(false);
    setEditingAddressId(null);
  };

  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map(a => ({
      ...a,
      is_default: a.id === id
    }));
    const defaultAddr = updated.find(a => a.id === id);

    setProfileForm(prev => ({
      ...prev,
      addresses: updated,
      address: defaultAddr?.address || prev.address,
      city: defaultAddr?.city || prev.city,
      state: defaultAddr?.state || prev.state,
      pincode: defaultAddr?.pincode || prev.pincode,
      phone: defaultAddr?.phone || prev.phone
    }));
  };

  const handleDeleteAddress = (id) => {
    if (addresses.length <= 1) {
      alert('You must keep at least one saved delivery address.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    let updated = addresses.filter(a => a.id !== id);
    const hadDefault = addresses.find(a => a.id === id)?.is_default;
    if (hadDefault && updated.length > 0) {
      updated[0].is_default = true;
    }

    const defaultAddr = updated.find(a => a.is_default) || updated[0];

    setProfileForm(prev => ({
      ...prev,
      addresses: updated,
      address: defaultAddr?.address || prev.address,
      city: defaultAddr?.city || prev.city,
      state: defaultAddr?.state || prev.state,
      pincode: defaultAddr?.pincode || prev.pincode,
      phone: defaultAddr?.phone || prev.phone
    }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Work':
        return <Briefcase size={14} className="text-purple-600" />;
      case 'Other':
        return <MapPin size={14} className="text-amber-600" />;
      default:
        return <Home size={14} className="text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6" data-reticle-target="user-profile-details-container">
      {/* 1. PERSONAL INFORMATION CARD */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="border-b pb-3">
          <h2 className="text-base font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
            <span>👤</span>
            <span>Personal Information</span>
          </h2>
          <p className="text-xs text-gray-500">Your account identity and primary phone number.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-gray-700 font-extrabold mb-1">Full Name *</label>
            <input 
              type="text" required
              placeholder="Enter your full name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
              data-reticle-target="user-profile-name-input"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-extrabold mb-1">Primary Phone Number *</label>
            <input 
              type="text" required maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value.replace(/\D/g, '') })}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all font-mono"
              data-reticle-target="user-profile-phone-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-gray-700 font-extrabold mb-1">Email Address (Registered Account)</label>
            <input 
              type="email" disabled
              placeholder="Enter your email address"
              value={profileForm.email}
              className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
              data-reticle-target="user-profile-email-disabled"
            />
          </div>
        </div>
      </div>

      {/* 2. SAVED DELIVERY ADDRESSES (MULTIPLE ADDRESS SUPPORT) */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-5" data-reticle-target="user-addresses-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
              <span>📍</span>
              <span>Saved Delivery Addresses</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {addresses.length} {addresses.length === 1 ? 'Address' : 'Addresses'}
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage one or more delivery addresses. Set your preferred default address for 1-click checkout.
            </p>
          </div>

          {!isEditingAddress && (
            <button
              type="button"
              onClick={handleOpenAddAddress}
              className="inline-flex items-center gap-1.5 bg-[#3b6e14]/10 hover:bg-[#3b6e14]/20 text-[#3b6e14] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-[#3b6e14]/30"
              data-reticle-target="add-new-address-btn"
            >
              <Plus size={16} />
              <span>+ Add New Address</span>
            </button>
          )}
        </div>

        {/* INLINE ADD / EDIT ADDRESS FORM */}
        {isEditingAddress && (
          <form onSubmit={handleSaveAddressForm} className="bg-gray-50 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-[#3b6e14]" />
                <span>{editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}</span>
              </h3>
              <button
                type="button"
                onClick={handleCancelAddressForm}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {addressFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-500" />
                <span>{addressFormError}</span>
              </div>
            )}

            {/* Address Type Selector */}
            <div>
              <label className="block text-gray-700 font-extrabold text-xs mb-1.5">Address Type</label>
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map(typeOption => (
                  <button
                    key={typeOption}
                    type="button"
                    onClick={() => setAddressFormData({ ...addressFormData, type: typeOption })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      addressFormData.type === typeOption
                        ? 'bg-[#3b6e14] text-white border-[#3b6e14] shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {getTypeIcon(typeOption)}
                    <span>{typeOption}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-extrabold mb-1">Contact Recipient Name *</label>
                <input
                  type="text" required
                  placeholder="e.g. John Doe"
                  value={addressFormData.name}
                  onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:border-[#3b6e14] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-extrabold mb-1">Contact Phone Number (10 Digits) *</label>
                <input
                  type="text" required maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={addressFormData.phone}
                  onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900 focus:border-[#3b6e14] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-extrabold mb-1">Complete House / Flat / Street Address *</label>
                <textarea
                  rows={2} required
                  placeholder="Flat/House No., Building Name, Street, Area"
                  value={addressFormData.address}
                  onChange={(e) => setAddressFormData({ ...addressFormData, address: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#3b6e14] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-extrabold mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near Metro Station / Behind City Hospital"
                  value={addressFormData.landmark}
                  onChange={(e) => setAddressFormData({ ...addressFormData, landmark: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-[#3b6e14] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-extrabold mb-1">City *</label>
                <input
                  type="text" required
                  placeholder="Enter city"
                  value={addressFormData.city}
                  onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:border-[#3b6e14] outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-extrabold mb-1">PIN Code (6 Digits) *</label>
                <input
                  type="text" required maxLength={6}
                  placeholder="e.g. 400001"
                  value={addressFormData.pincode}
                  onChange={(e) => setAddressFormData({ ...addressFormData, pincode: e.target.value.replace(/\D/g, '') })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900 focus:border-[#3b6e14] outline-none"
                />
                <span className="text-[10px] text-gray-500 font-medium mt-0.5 block">Indian PIN code (cannot start with 0)</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-extrabold mb-1">State / Union Territory *</label>
                <select
                  value={addressFormData.state}
                  onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg font-bold text-gray-900 focus:border-[#3b6e14] outline-none cursor-pointer"
                >
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={addressFormData.is_default}
                    onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                    className="w-4 h-4 text-[#3b6e14] border-gray-300 rounded focus:ring-[#3b6e14]"
                  />
                  <span className="text-xs font-bold text-gray-800">Set as my default shipping address</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancelAddressForm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#3b6e14] hover:bg-[#2d560f] text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>{editingAddressId ? 'Update Address' : 'Add Address'}</span>
              </button>
            </div>
          </form>
        )}

        {/* LIST OF SAVED ADDRESSES */}
        {addresses.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-2">
            <MapPin size={32} className="mx-auto text-gray-400" />
            <p className="text-xs font-bold text-gray-700">No delivery addresses saved yet.</p>
            <p className="text-[11px] text-gray-500">Click &ldquo;+ Add New Address&rdquo; above to save your home or work delivery address.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div 
                key={addr.id}
                className={`p-4 rounded-2xl border transition-all relative flex flex-col justify-between ${
                  addr.is_default 
                    ? 'border-[#3b6e14] bg-emerald-50/30 ring-1 ring-[#3b6e14]/40 shadow-xs' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                data-reticle-target={`address-card-${addr.id}`}
              >
                <div className="space-y-2">
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-md bg-white border border-gray-200 shadow-2xs">
                        {getTypeIcon(addr.type)}
                      </span>
                      <span className="text-xs font-black text-gray-900 tracking-tight">
                        {addr.type || 'Home'}
                      </span>
                    </div>

                    {addr.is_default && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-[#3b6e14] text-white px-2 py-0.5 rounded-full shadow-2xs">
                        <CheckCircle2 size={11} />
                        <span>DEFAULT</span>
                      </span>
                    )}
                  </div>

                  {/* Recipient Details */}
                  <div className="text-xs space-y-0.5 pt-1">
                    <p className="font-extrabold text-gray-900">{addr.name || profileForm.name || 'Recipient'}</p>
                    <p className="text-gray-600 font-mono text-[11px]">📞 +91 {addr.phone || profileForm.phone || ''}</p>
                    <p className="text-gray-700 font-medium leading-relaxed pt-1 text-[11px]">
                      {addr.address}
                    </p>
                    {addr.landmark && (
                      <p className="text-[10px] text-gray-500 italic">Landmark: {addr.landmark}</p>
                    )}
                    <p className="text-gray-900 font-bold pt-1">
                      {addr.city}, {addr.state} - <span className="font-mono text-emerald-800">{addr.pincode}</span>
                    </p>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4 text-xs">
                  <div>
                    {!addr.is_default ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className="text-[11px] font-bold text-gray-600 hover:text-[#3b6e14] flex items-center gap-1 cursor-pointer transition-colors"
                        title="Set this address as default"
                      >
                        <Star size={13} />
                        <span>Set Default</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-[#3b6e14] flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Primary Address</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditAddress(addr)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                      title="Edit this address"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Delete this address"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PRIMARY SAVE PROFILE BUTTON */}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-900">Save all changes</p>
          <p className="text-[11px] text-gray-500">Persist your contact info and all saved delivery addresses permanently.</p>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={savingProfile}
          className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-extrabold text-xs px-8 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shrink-0"
          data-reticle-target="user-profile-save-btn"
        >
          <Save size={16} />
          <span>{savingProfile ? 'Saving All Changes...' : 'Save Profile & Addresses'}</span>
        </button>
      </div>
    </div>
  );
}

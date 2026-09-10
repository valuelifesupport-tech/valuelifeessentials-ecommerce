import React from 'react';
import { Save } from 'lucide-react';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

export default function ProfileDetailsTab({
  profileForm,
  setProfileForm,
  savingProfile,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6" data-reticle-target="user-profile-details-form">
      <div className="border-b pb-4">
        <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
          👤 Profile & Saved Shipping Address
        </h2>
        <p className="text-xs text-gray-500">Update your personal contact information and default delivery address for instant checkout.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-gray-700 font-extrabold mb-1">Full Name *</label>
          <input 
            type="text" required
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
            data-reticle-target="user-profile-name-input"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-extrabold mb-1">Phone Number *</label>
          <input 
            type="text" required
            placeholder="+91 98765 43210"
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
            data-reticle-target="user-profile-phone-input"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-extrabold mb-1">Email Address (Account ID)</label>
          <input 
            type="email" disabled
            value={profileForm.email}
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
            data-reticle-target="user-profile-email-disabled"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-extrabold mb-1">Complete Street / Flat Address *</label>
          <textarea 
            rows={2} required
            placeholder="House No, Apartment/Building, Street Name, Landmark"
            value={profileForm.address}
            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
            data-reticle-target="user-profile-address-textarea"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-extrabold mb-1">City *</label>
          <input 
            type="text" required
            placeholder="e.g. Mumbai / Delhi / Bengaluru"
            value={profileForm.city}
            onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
            data-reticle-target="user-profile-city-input"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-extrabold mb-1">Pincode *</label>
          <input 
            type="text" required maxLength={6}
            placeholder="6-digit Pincode"
            value={profileForm.pincode}
            onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
            data-reticle-target="user-profile-pincode-input"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-extrabold mb-1">State *</label>
          <select 
            value={profileForm.state}
            onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 cursor-pointer focus:bg-white focus:border-[#3b6e14]"
            data-reticle-target="user-profile-state-select"
          >
            {INDIAN_STATES.map(stName => (
              <option key={stName} value={stName}>{stName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-3 border-t flex justify-end">
        <button
          type="submit"
          disabled={savingProfile}
          className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          data-reticle-target="user-profile-save-btn"
        >
          <Save size={16} />
          <span>{savingProfile ? 'Saving Details...' : 'Save Profile & Address'}</span>
        </button>
      </div>
    </form>
  );
}

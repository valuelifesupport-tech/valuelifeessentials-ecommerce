import React from 'react';
import { Save } from 'lucide-react';

export default function ProfileGstinTab({
  profileForm,
  setProfileForm,
  savingProfile,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6" data-reticle-target="user-profile-gstin-form">
      <div className="border-b pb-4">
        <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
          🏛️ GSTIN & B2B Business Tax Invoice Details
        </h2>
        <p className="text-xs text-gray-500">Save your registered GSTIN for automatic GST tax invoice generation & input tax credit claims.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="block text-gray-700 font-extrabold mb-1">Registered Business / Legal Name</label>
          <input 
            type="text"
            placeholder="e.g. VALUELIFE ESSENTIALS Retail Pvt Ltd"
            value={profileForm.business_name}
            onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
            data-reticle-target="user-gstin-business-name"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-extrabold mb-1">GSTIN Identification Number</label>
          <input 
            type="text"
            placeholder="e.g. 27AAAAA0000A1Z5"
            value={profileForm.gstin_number}
            onChange={(e) => setProfileForm({ ...profileForm, gstin_number: e.target.value.toUpperCase() })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-[#3b6e14] focus:bg-white focus:border-[#3b6e14]"
            data-reticle-target="user-gstin-number"
          />
        </div>
      </div>

      <div className="pt-3 border-t flex justify-end">
        <button
          type="submit"
          disabled={savingProfile}
          className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          data-reticle-target="user-gstin-submit-btn"
        >
          <Save size={16} />
          <span>{savingProfile ? 'Saving Details...' : 'Save GSTIN Details'}</span>
        </button>
      </div>
    </form>
  );
}

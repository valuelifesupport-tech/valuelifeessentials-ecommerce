import React from 'react';
import { LogOut } from 'lucide-react';

export default function ProfileHeaderBanner({
  profileForm,
  currentUser,
  onLogout
}) {
  const initial = (profileForm?.name || currentUser?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-reticle-target="user-profile-header-banner">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#3b6e14] text-white text-2xl font-black flex items-center justify-center shadow-md font-['Outfit']">
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 font-['Outfit']">
              {profileForm?.name || currentUser?.name || 'Customer Account'}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              VERIFIED MEMBER
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">{currentUser?.email}</p>
          {profileForm?.phone && <p className="text-xs text-gray-400 font-medium">📞 {profileForm.phone}</p>}
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-colors cursor-pointer"
        data-reticle-target="user-profile-signout-btn"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  );
}

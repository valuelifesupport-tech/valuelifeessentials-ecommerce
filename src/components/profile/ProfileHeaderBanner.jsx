import React from 'react';
import { LogOut } from 'lucide-react';

export default function ProfileHeaderBanner({
  profileForm,
  currentUser,
  onLogout
}) {
  const rawName = profileForm?.name || currentUser?.name || '';
  const validName = (!rawName || rawName.startsWith('Customer ')) ? '' : rawName;
  const rawPhone = profileForm?.phone || currentUser?.phone || '';
  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '').slice(-10) : '';

  const displayName = validName || (cleanPhone ? `+91 ${cleanPhone}` : 'My Account');
  const initial = validName 
    ? validName.charAt(0).toUpperCase() 
    : (cleanPhone ? cleanPhone.slice(-2) : '👤');

  const rawEmail = currentUser?.email || profileForm?.email || '';
  const cleanEmail = (!rawEmail || rawEmail.includes('@valuelifeessentials.com') || rawEmail.includes('@temporary.com')) ? '' : rawEmail;

  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" data-reticle-target="user-profile-header-banner">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#3b6e14] text-white text-2xl font-black flex items-center justify-center shadow-md font-['Outfit']">
          {initial}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-gray-900 font-['Outfit']">
              {displayName}
            </h1>
          </div>
          {cleanEmail && <p className="text-xs text-gray-500 font-medium">{cleanEmail}</p>}
          {cleanPhone && <p className="text-xs text-gray-400 font-medium">📞 +91 {cleanPhone}</p>}
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

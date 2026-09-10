import React from 'react';
import { Lock } from 'lucide-react';

export default function ProfileSecurityTab({
  passwordForm,
  setPasswordForm,
  changingPassword,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6" data-reticle-target="user-profile-security-form">
      <div className="border-b pb-4">
        <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
          🔐 Change Account Password & Security
        </h2>
        <p className="text-xs text-gray-500">Update your login credentials to keep your ValueLife Essentials account secure.</p>
      </div>

      <div className="space-y-4 max-w-md text-xs">
        <div>
          <label className="block text-gray-700 font-extrabold mb-1">Current Password *</label>
          <input 
            type="password" required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
            data-reticle-target="user-security-current-password"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-extrabold mb-1">New Password *</label>
          <input 
            type="password" required minLength={6}
            placeholder="At least 6 characters"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
            data-reticle-target="user-security-new-password"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-extrabold mb-1">Confirm New Password *</label>
          <input 
            type="password" required minLength={6}
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
            data-reticle-target="user-security-confirm-password"
          />
        </div>
      </div>

      <div className="pt-3 border-t flex justify-end">
        <button
          type="submit"
          disabled={changingPassword}
          className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          data-reticle-target="user-security-submit-btn"
        >
          <Lock size={16} />
          <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
        </button>
      </div>
    </form>
  );
}

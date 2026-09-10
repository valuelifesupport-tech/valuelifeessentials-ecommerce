import React from 'react';
import { ToggleRight, ToggleLeft } from 'lucide-react';

export default function SettingsTab({
  adminProfileForm = {},
  setAdminProfileForm,
  settingsForm = {},
  setSettingsForm,
  updateAndSaveSettingToggle,
  adminFetch,
  setSettings,
  onUpdateSettings,
  showToast
}) {
  return (
    <div className="space-y-6 w-full max-w-5xl" data-reticle-target="admin-settings-tab">
      <div>
        <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block">ADMIN PROFILE & ACCOUNT SECURITY</span>
        <h3 className="text-xl font-black text-white font-['Outfit']">⚙️ Admin Profile, Security & Store Currency Settings</h3>
        <p className="text-xs text-slate-400">Manage administrator credentials, change master password, and toggle global storefront settings.</p>
      </div>

      {/* 1. SINGLE MASTER ADMIN PROFILE & SECURITY CARD */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <span className="font-extrabold text-sm text-white block">👤 Admin Profile & Account Security</span>
            <p className="text-slate-400 text-xs">Update your administrative credentials, email, and password security.</p>
          </div>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase">
            SUPER ADMIN OWNER
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Admin Display Name</label>
            <input 
              type="text"
              value={adminProfileForm.name || ''}
              onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Admin Email Address</label>
            <input 
              type="email"
              value={adminProfileForm.email || ''}
              onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
              className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>
        </div>

        {/* PASSWORD CHANGE FORM */}
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-3">
          <span className="font-extrabold text-xs text-amber-400 block uppercase tracking-wider">
            🔒 Change Master Admin Password:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Current Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={adminProfileForm.currentPass || ''}
                onChange={(e) => setAdminProfileForm({ ...adminProfileForm, currentPass: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">New Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={adminProfileForm.newPass || ''}
                onChange={(e) => setAdminProfileForm({ ...adminProfileForm, newPass: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Confirm Password</label>
              <input 
                type="password"
                placeholder="••••••••"
                value={adminProfileForm.confirmPass || ''}
                onChange={(e) => setAdminProfileForm({ ...adminProfileForm, confirmPass: e.target.value })}
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* MULTI CURRENCY TOGGLE */}
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-extrabold text-sm text-white block">🌐 Multi-Currency (USD $) Switcher Flag</span>
              <p className="text-slate-400 text-xs">Enable or disable the USD ($) currency switcher on storefront header.</p>
            </div>

            <button 
              type="button"
              onClick={() => {
                const newVal = Number(settingsForm.enable_multi_currency) === 1 ? 0 : 1;
                if (typeof updateAndSaveSettingToggle === 'function') {
                  updateAndSaveSettingToggle('enable_multi_currency', newVal);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                Number(settingsForm.enable_multi_currency) === 1 
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {Number(settingsForm.enable_multi_currency) === 1 ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
              <span>{Number(settingsForm.enable_multi_currency) === 1 ? 'MULTI-CURRENCY ON' : 'INR ONLY (OFF)'}</span>
            </button>
          </div>
        </div>

        <button 
          type="button"
          onClick={async () => {
            try {
              const res = await adminFetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsForm)
              });
              if (res.ok) {
                const savedData = await res.json();
                const finalSettings = {
                  ...settingsForm,
                  ...(savedData && typeof savedData === 'object' ? savedData : {}),
                  enable_multi_currency: Number(settingsForm.enable_multi_currency) === 1 ? 1 : 0
                };
                if (typeof setSettings === 'function') setSettings(finalSettings);
                if (typeof setSettingsForm === 'function') setSettingsForm(finalSettings);
                if (typeof onUpdateSettings === 'function') {
                  onUpdateSettings(finalSettings);
                }
              }
              // Password update if new password supplied
              if (adminProfileForm.newPass) {
                if (adminProfileForm.newPass !== adminProfileForm.confirmPass) {
                  if (showToast) showToast('error', 'Password Mismatch', 'New password and confirm password do not match');
                  return;
                }
                const passRes = await adminFetch('/api/auth/change-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: adminProfileForm.email || 'support@valuelifeessentials.com',
                    current_password: adminProfileForm.currentPass,
                    new_password: adminProfileForm.newPass
                  })
                });
                const passData = await passRes.json();
                if (!passRes.ok) {
                  if (showToast) showToast('error', 'Password Error', passData.error || 'Failed to update password');
                  return;
                }
              }
              if (showToast) showToast('success', 'Profile & Settings Saved', 'Master Admin credentials and store settings saved successfully!');
              setAdminProfileForm({ ...adminProfileForm, currentPass: '', newPass: '', confirmPass: '' });
            } catch (err) {
              if (showToast) showToast('error', 'Save Failed', err.message || 'Failed to save settings');
            }
          }}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl text-xs tracking-wider shadow-lg uppercase cursor-pointer"
        >
          Save Admin Profile & Security Credentials
        </button>
      </div>
    </div>
  );
}

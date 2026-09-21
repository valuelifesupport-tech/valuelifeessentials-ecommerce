import React from 'react';
import { ToggleRight, ToggleLeft, Truck } from 'lucide-react';

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

      {/* 2. STORE DELIVERY & SHIPPING CHARGES CONFIGURATION CARD */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md space-y-6" data-reticle-target="admin-shipping-settings-card">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Truck size={22} />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white block">🚚 Store Delivery & Shipping Charges Configuration</span>
              <p className="text-slate-400 text-xs">Set flat standard shipping fee, free delivery limitation threshold, and toggle free shipping rules.</p>
            </div>
          </div>
          <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
            SHIPPING ENGINE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block font-bold text-slate-200">
              📦 Standard Delivery / Shipping Fee (₹)
            </label>
            <p className="text-[11px] text-slate-400">
              Flat shipping fee applied when cart subtotal does not qualify for free shipping.
            </p>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-black text-sm">₹</span>
              <input 
                type="number"
                min="0"
                step="1"
                placeholder="50"
                value={settingsForm.shipping_fee !== undefined ? settingsForm.shipping_fee : 50}
                onChange={(e) => setSettingsForm({ ...settingsForm, shipping_fee: e.target.value })}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2">
            <label className="block font-bold text-slate-200">
              🎁 Free Delivery Minimum Order Limit / Threshold (₹)
            </label>
            <p className="text-[11px] text-slate-400">
              Minimum cart subtotal required to automatically qualify for 100% Free Shipping.
            </p>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-black text-sm">₹</span>
              <input 
                type="number"
                min="0"
                step="1"
                placeholder="499"
                value={settingsForm.free_shipping_threshold !== undefined ? settingsForm.free_shipping_threshold : 499}
                onChange={(e) => setSettingsForm({ ...settingsForm, free_shipping_threshold: e.target.value })}
                className="w-full pl-8 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-black text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* FREE SHIPPING TOGGLE */}
        <div className="p-4 bg-slate-850 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <span className="font-extrabold text-sm text-white block">✨ Enable Free Shipping on Qualifying Orders</span>
            <p className="text-slate-400 text-xs">
              When ON, orders with subtotal equal or above ₹{settingsForm.free_shipping_threshold || 499} automatically get ₹0 delivery fee.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => {
              const currentVal = settingsForm.enable_free_shipping !== undefined ? Number(settingsForm.enable_free_shipping) : 1;
              const newVal = currentVal === 1 ? 0 : 1;
              if (typeof updateAndSaveSettingToggle === 'function') {
                updateAndSaveSettingToggle('enable_free_shipping', newVal);
              } else {
                setSettingsForm({ ...settingsForm, enable_free_shipping: newVal });
              }
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              (settingsForm.enable_free_shipping === undefined || Number(settingsForm.enable_free_shipping) === 1)
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {(settingsForm.enable_free_shipping === undefined || Number(settingsForm.enable_free_shipping) === 1) ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
            <span>{(settingsForm.enable_free_shipping === undefined || Number(settingsForm.enable_free_shipping) === 1) ? 'FREE SHIPPING ACTIVE' : 'FREE SHIPPING OFF'}</span>
          </button>
        </div>

        {/* LIVE PREVIEW HELPER BANNER */}
        <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs flex items-center justify-between text-blue-200">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>Customer Delivery Rule:</strong> Orders under <strong>₹{settingsForm.free_shipping_threshold || 499}</strong> pay <strong>₹{settingsForm.shipping_fee || 50}</strong> delivery. Orders <strong>₹{settingsForm.free_shipping_threshold || 499}+</strong> get <strong>100% Free Shipping</strong>.
            </span>
          </div>
        </div>

        <button 
          type="button"
          onClick={async () => {
            try {
              const res = await adminFetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...settingsForm,
                  shipping_fee: Number(settingsForm.shipping_fee) || 0,
                  free_shipping_threshold: Number(settingsForm.free_shipping_threshold) || 0,
                  enable_free_shipping: (settingsForm.enable_free_shipping === undefined || Number(settingsForm.enable_free_shipping) === 1) ? 1 : 0
                })
              });
              if (res.ok) {
                const savedData = await res.json();
                const finalSettings = {
                  ...settingsForm,
                  ...(savedData && typeof savedData === 'object' ? savedData : {})
                };
                if (typeof setSettings === 'function') setSettings(finalSettings);
                if (typeof setSettingsForm === 'function') setSettingsForm(finalSettings);
                if (typeof onUpdateSettings === 'function') onUpdateSettings(finalSettings);
                if (showToast) showToast('success', 'Shipping Settings Saved!', 'Standard delivery fee & limitation threshold updated live on storefront.');
              } else {
                if (showToast) showToast('error', 'Update Failed', 'Could not save shipping configuration.');
              }
            } catch (err) {
              if (showToast) showToast('error', 'Save Error', err.message || 'Failed to save shipping settings');
            }
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-3 rounded-xl text-xs tracking-wider shadow-lg uppercase cursor-pointer"
        >
          Save Delivery & Shipping Settings
        </button>
      </div>
    </div>
  );
}

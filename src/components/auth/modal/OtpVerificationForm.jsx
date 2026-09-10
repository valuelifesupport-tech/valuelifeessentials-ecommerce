import React from 'react';
import { CheckCircle } from 'lucide-react';

export default function OtpVerificationForm({
  pendingEmail,
  email,
  regOtp,
  setRegOtp,
  loading,
  onSubmit,
  onResendOtp,
  onEditInfo
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs" data-reticle-target="user-auth-otp-form">
      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-900">
        <div className="font-extrabold text-sm text-[#3b6e14] mb-1">📧 Enter Email Verification Code</div>
        <p className="text-[11px] text-gray-600">
          We sent a 6-digit OTP code to: <strong>{pendingEmail || email}</strong>
        </p>
        <p className="text-[10px] text-emerald-700 mt-1 font-bold">⏱️ Code is valid for 10 minutes</p>
      </div>

      <div>
        <label className="block font-bold text-gray-700 mb-1 text-center">6-Digit Verification OTP Code *</label>
        <input
          type="text"
          required
          maxLength={6}
          placeholder="e.g. 849201"
          value={regOtp}
          onChange={(e) => setRegOtp(e.target.value)}
          className="w-full text-center tracking-widest text-xl font-black py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:border-[#3b6e14] focus:outline-none font-mono"
          data-reticle-target="user-auth-otp-input"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        data-reticle-target="user-auth-otp-submit"
      >
        <span>{loading ? 'Activating Account...' : 'Verify OTP & Activate Account'}</span>
        <CheckCircle size={16} />
      </button>

      <div className="flex justify-between items-center text-[11px] pt-1">
        <button
          type="button"
          onClick={onResendOtp}
          disabled={loading}
          className="text-[#3b6e14] hover:underline font-bold cursor-pointer disabled:opacity-50"
          data-reticle-target="user-auth-otp-resend"
        >
          🔄 Resend OTP Code
        </button>
        <button
          type="button"
          onClick={onEditInfo}
          className="text-gray-500 hover:text-gray-800 font-bold underline cursor-pointer"
          data-reticle-target="user-auth-otp-edit-info"
        >
          ← Edit Registration Info
        </button>
      </div>
    </form>
  );
}

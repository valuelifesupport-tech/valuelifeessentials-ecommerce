import React from 'react';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForgotPasswordForm({
  forgotStep,
  forgotInput,
  setForgotInput,
  forgotOtp,
  setForgotOtp,
  forgotNewPassword,
  setForgotNewPassword,
  loading,
  onSendForgotOtp,
  onResetPasswordSubmit,
  onBackToLogin,
  onResendOtp
}) {
  return (
    <div className="space-y-4 text-xs" data-reticle-target="user-auth-forgot-password-container">
      <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
        <h3 className="font-extrabold text-[#3b6e14] text-xs">🔑 Password Reset & Recovery</h3>
        <p className="text-[11px] text-gray-600">Enter your registered email or phone number to receive a 6-digit verification OTP code.</p>
      </div>

      {forgotStep === 1 ? (
        <form onSubmit={onSendForgotOtp} className="space-y-4" data-reticle-target="user-auth-forgot-step1-form">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Registered Email or Phone Number *</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g. rohan@gmail.com or +919988776655"
                value={forgotInput}
                onChange={(e) => setForgotInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                data-reticle-target="user-auth-forgot-identifier"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            data-reticle-target="user-auth-forgot-send-otp-btn"
          >
            <span>{loading ? 'Generating OTP...' : 'Send Password Reset OTP'}</span>
            <ArrowRight size={16} />
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-gray-600 hover:text-gray-900 font-bold text-xs underline cursor-pointer"
              data-reticle-target="user-auth-forgot-back-to-login"
            >
              ← Back to Login
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={onResetPasswordSubmit} className="space-y-3.5" data-reticle-target="user-auth-forgot-step2-form">
          <div>
            <label className="block font-bold text-gray-700 mb-1">6-Digit Verification OTP Code *</label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="Enter 6-digit OTP code (e.g. 123456)"
              value={forgotOtp}
              onChange={(e) => setForgotOtp(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono font-bold text-center tracking-widest text-base focus:border-[#3b6e14] focus:outline-none"
              data-reticle-target="user-auth-forgot-otp-input"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">New Password (Min 6 chars) *</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                data-reticle-target="user-auth-forgot-new-password-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            data-reticle-target="user-auth-reset-password-submit"
          >
            <span>{loading ? 'Resetting Password...' : 'Reset Password & Proceed to Login'}</span>
            <CheckCircle size={16} />
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onResendOtp}
              className="text-gray-500 hover:text-gray-800 font-bold text-xs underline cursor-pointer"
              data-reticle-target="user-auth-forgot-edit-input"
            >
              ← Re-send OTP or Change Input
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import React from 'react';
import { Phone, Lock, ArrowRight, ShieldCheck, RefreshCw, Mail, Smartphone, ArrowLeft } from 'lucide-react';

export default function LoginForm({
  phone,
  email,
  password,
  setPhone,
  setEmail,
  setPassword,
  loading,
  onSubmit,
  onForgotPassword,
  // Dual-channel OTP Login props
  loginMode = 'OTP', // 'OTP' | 'PASSWORD'
  setLoginMode,
  loginOtpStep = 1, // 1 = Enter Phone/Email, 2 = Enter OTP
  setLoginOtpStep,
  loginOtp = '',
  setLoginOtp,
  loginOtpTarget = '',
  loginOtpChannel = 'SMS',
  onSendLoginOtp,
  onVerifyLoginOtp,
  onResendLoginOtp
}) {
  const identifier = phone || email || '';

  const isNumericPhone = identifier.replace(/\D/g, '').length >= 10 && !identifier.includes('@');

  return (
    <div className="space-y-4 text-xs" data-reticle-target="user-auth-login-container">
      {/* LOGIN MODE TOGGLE: OTP (Default) vs PASSWORD */}
      <div className="flex bg-emerald-50/70 p-1 rounded-xl border border-emerald-100 text-[11px] font-black">
        <button
          type="button"
          onClick={() => {
            if (setLoginMode) setLoginMode('OTP');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMode === 'OTP'
              ? 'bg-[#3b6e14] text-white shadow-sm font-extrabold'
              : 'text-[#20440b] hover:text-[#3b6e14]'
          }`}
          data-reticle-target="login-mode-otp-btn"
        >
          <Smartphone size={14} />
          <span>Login via OTP (SMS / Email)</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (setLoginMode) setLoginMode('PASSWORD');
          }}
          className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            loginMode === 'PASSWORD'
              ? 'bg-[#3b6e14] text-white shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-reticle-target="login-mode-password-btn"
        >
          <Lock size={13} />
          <span>Password</span>
        </button>
      </div>

      {/* 1. OTP-BASED LOGIN FLOW (DUAL CHANNEL: SMS FOR PHONE, EMAIL FOR GMAIL) */}
      {loginMode === 'OTP' && (
        <>
          {loginOtpStep === 1 ? (
            <form onSubmit={onSendLoginOtp} className="space-y-4" data-reticle-target="user-auth-login-otp-step1">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Mobile Phone Number or Email *
                </label>
                <div className="relative">
                  {isNumericPhone ? (
                    <Smartphone size={16} className="absolute left-3 top-3 text-[#3b6e14]" />
                  ) : (
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  )}
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Enter your phone or email"
                    value={identifier}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setEmail(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none tracking-wide text-sm"
                    data-reticle-target="user-auth-login-otp-identifier"
                  />
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500 font-medium">
                  <span className="text-[#3b6e14] font-bold">●</span>
                  {identifier.includes('@') ? (
                    <span className="text-emerald-700 font-semibold">Email detected: OTP will be sent to your Gmail inbox.</span>
                  ) : isNumericPhone ? (
                    <span className="text-[#3b6e14] font-semibold">Mobile detected: 6-digit OTP will be sent via SMS directly to your phone.</span>
                  ) : (
                    <span>Enter 10-digit mobile number for SMS OTP, or email for Email OTP.</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                data-reticle-target="user-auth-send-otp-submit"
              >
                <span>{loading ? 'Sending OTP Code...' : 'Get Login OTP'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[11px] text-gray-600 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#3b6e14] shrink-0" />
                <span>Zero hassle: No password required. Instant login via verified OTP.</span>
              </div>
            </form>
          ) : (
            <form onSubmit={onVerifyLoginOtp} className="space-y-4" data-reticle-target="user-auth-login-otp-step2">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-950">
                <div className="font-extrabold text-xs text-[#3b6e14] mb-1 flex items-center justify-center gap-1.5">
                  {loginOtpChannel === 'SMS' ? <Smartphone size={16} /> : <Mail size={16} />}
                  <span>Verification Code Dispatched!</span>
                </div>
                <p className="text-[11px] text-gray-700">
                  Enter the 6-digit code sent to: <strong className="text-gray-900">{loginOtpTarget || identifier}</strong>
                </p>
                <p className="text-[10px] text-[#3b6e14] mt-1 font-bold">⏱️ Valid for 10 minutes</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 text-center">
                  Enter 6-Digit OTP Code *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={loginOtp}
                  onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:border-[#3b6e14] focus:outline-none font-mono"
                  data-reticle-target="user-auth-login-otp-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (loginOtp || '').trim().length < 4}
                className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                data-reticle-target="user-auth-verify-otp-submit"
              >
                <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                <ArrowRight size={16} />
              </button>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <button
                  type="button"
                  onClick={onResendLoginOtp}
                  disabled={loading}
                  className="text-[#3b6e14] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  data-reticle-target="user-auth-login-resend-otp"
                >
                  <RefreshCw size={12} />
                  <span>Resend OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (setLoginOtpStep) setLoginOtpStep(1);
                  }}
                  className="text-gray-500 hover:text-gray-800 font-bold flex items-center gap-1 cursor-pointer"
                  data-reticle-target="user-auth-login-change-target"
                >
                  <ArrowLeft size={12} />
                  <span>Change Number / Email</span>
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* 2. PASSWORD-BASED LOGIN FLOW */}
      {loginMode === 'PASSWORD' && (
        <form onSubmit={onSubmit} className="space-y-4" data-reticle-target="user-auth-login-form">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number or Email *</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Enter your phone or email"
                value={identifier}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setEmail(e.target.value);
                }}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                data-reticle-target="user-auth-login-identifier"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-gray-700">Password *</label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-[#3b6e14] font-extrabold hover:underline text-[11px] cursor-pointer"
                data-reticle-target="user-auth-forgot-password-link"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                data-reticle-target="user-auth-login-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            data-reticle-target="user-auth-login-submit"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
            <ArrowRight size={16} />
          </button>

          <p className="text-[10px] text-gray-500 text-center font-medium">
            🔒 Fast & Secure Login using Mobile Phone or Email.
          </p>
        </form>
      )}
    </div>
  );
}

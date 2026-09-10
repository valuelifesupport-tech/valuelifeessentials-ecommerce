import React from 'react';
import { Phone, Lock, ArrowRight } from 'lucide-react';

export default function LoginForm({
  phone,
  email,
  password,
  setPhone,
  setEmail,
  setPassword,
  loading,
  onSubmit,
  onForgotPassword
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 text-xs" data-reticle-target="user-auth-login-form">
      <div>
        <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number or Email *</label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            required
            placeholder="e.g. +91 98123 45678 / rajesh@gmail.com"
            value={phone || email}
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
  );
}

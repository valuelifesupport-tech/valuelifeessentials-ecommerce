import React from 'react';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export default function SignupForm({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  loading,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-3.5 text-xs" data-reticle-target="user-auth-signup-form">
      <div>
        <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            required
            placeholder="e.g. Vikram Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
            data-reticle-target="user-auth-signup-name"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-gray-700 mb-1">Email Address * (Mandatory for Verification)</label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            required
            placeholder="e.g. vikram@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
            data-reticle-target="user-auth-signup-email"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number *</label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="tel"
            required
            placeholder="e.g. +91 98123 45678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
            data-reticle-target="user-auth-signup-phone"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-gray-700 mb-1">Password *</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
            data-reticle-target="user-auth-signup-password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        data-reticle-target="user-auth-signup-submit"
      >
        <span>{loading ? 'Creating Account...' : 'Create Account & Send Verification Code'}</span>
        <ArrowRight size={16} />
      </button>
    </form>
  );
}

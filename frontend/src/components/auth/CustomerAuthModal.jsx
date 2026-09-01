import { getApiUrl } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Phone, Package, LogOut, ShieldCheck, ArrowRight, CheckCircle } from 'lucide-react';

export default function CustomerAuthModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onLoginSuccess, 
  onLogout 
}) {
  const [activeTab, setActiveTab] = useState(currentUser ? 'PROFILE' : 'LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [regStep, setRegStep] = useState(1); // 1 = Form, 2 = Verify OTP
  const [regOtp, setRegOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  const [forgotInput, setForgotInput] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerifyRegistrationOtp = async (e) => {
    e.preventDefault();
    if (!regOtp || !regOtp.trim()) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(getApiUrl('/api/auth/verify-registration-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail || email.trim(), otp: regOtp.trim() })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setSuccessMsg(data.message || 'Email Verified Successfully! Account Activated.');
        onLoginSuccess(data.user);
        fetchMyOrders(data.user.email);
        setTimeout(() => {
          setActiveTab('PROFILE');
          setRegStep(1);
        }, 600);
      } else {
        setErrorMsg(data.error || 'Invalid 6-digit verification code.');
      }
    } catch (err) {
      setErrorMsg('Network error verifying code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendRegistrationOtp = async () => {
    const targetEmail = pendingEmail || email.trim();
    if (!targetEmail) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(getApiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Fresh verification code sent to your email! (Valid for 10 mins).');
        if (data.otp) setRegOtp(data.otp);
      } else {
        setErrorMsg(data.error || 'Could not resend OTP code.');
      }
    } catch (err) {
      setErrorMsg('Network error resending OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!forgotInput || !forgotInput.trim()) {
      setErrorMsg('Please enter your registered Email or Mobile number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(getApiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_phone: forgotInput })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message);
        if (data.otp) setForgotOtp(data.otp);
        setForgotStep(2);
      } else {
        setErrorMsg(data.error || 'Failed to process request.');
      }
    } catch (err) {
      setErrorMsg('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !forgotOtp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(getApiUrl('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_or_phone: forgotInput,
          otp: forgotOtp,
          new_password: forgotNewPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || 'Password reset successfully!');
        setTimeout(() => {
          setActiveTab('LOGIN');
          setPassword(forgotNewPassword);
          setForgotStep(1);
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Password reset failed.');
      }
    } catch (err) {
      setErrorMsg('Network error while resetting password.');
    } finally {
      setLoading(false);
    }
  };
  
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderToCancel) return;
    setCancellingOrder(true);

    try {
      const res = await fetch(getApiUrl(`/api/orders/${selectedOrderToCancel.id}/cancel`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason,
          notes: cancelNotes,
          customer_email: currentUser?.email
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Order ${selectedOrderToCancel.order_number} cancelled successfully.`);
        setSelectedOrderToCancel(null);
        setCancelReason('Ordered by mistake');
        setCancelNotes('');
        fetchMyOrders(currentUser.email);
      } else {
        setErrorMsg(data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      setErrorMsg('Network error. Failed to cancel order.');
    } finally {
      setCancellingOrder(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setActiveTab('PROFILE');
      fetchMyOrders(currentUser.email);
    } else {
      setActiveTab('LOGIN');
    }
  }, [currentUser, isOpen]);

  const fetchMyOrders = async (userEmail) => {
    if (!userEmail) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(getApiUrl(`/api/users/${encodeURIComponent(userEmail)}/orders`));
      if (res.ok) {
        const text = await res.text();
        if (!text || !text.trim()) {
          setMyOrders([]);
          return;
        }
        try {
          const data = JSON.parse(text);
          setMyOrders(Array.isArray(data) ? data : []);
        } catch (e) {
          setMyOrders([]);
        }
      } else {
        setMyOrders([]);
      }
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      setMyOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const loginVal = (phone || email || '').trim();
    if (!loginVal) {
      setErrorMsg('Please enter your mobile phone number or email address.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginVal, phone: loginVal, password })
      });
      const data = await res.json();

      if (res.ok && data.requireOtp) {
        setPendingEmail(data.email || loginVal);
        setSuccessMsg(data.message || 'Email verification code sent! (Valid for 10 mins).');
        if (data.otp) setRegOtp(data.otp);
        setActiveTab('REGISTER');
        setRegStep(2);
      } else if (res.ok && data.user) {
        setSuccessMsg(data.message || 'Login successful!');
        onLoginSuccess(data.user);
        fetchMyOrders(data.user.email);
        setTimeout(() => {
          setActiveTab('PROFILE');
        }, 600);
      } else {
        setErrorMsg(data.error || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.trim() || !email.includes('@')) {
      setErrorMsg('Valid Email Address is mandatory to receive your 6-digit verification code.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name ? name.trim() : '', email: email.trim(), phone: phone ? phone.trim() : '', password })
      });
      const data = await res.json();

      if (res.ok && data.requireOtp) {
        setPendingEmail(data.email || email.trim());
        setSuccessMsg(data.message || 'Account created! Verification OTP sent to your email address (Valid for 10 mins).');
        if (data.otp) setRegOtp(data.otp);
        setRegStep(2);
      } else if (res.ok && data.user) {
        setSuccessMsg(data.message || 'Registration successful!');
        onLoginSuccess(data.user);
        fetchMyOrders(data.user.email);
        setTimeout(() => {
          setActiveTab('PROFILE');
        }, 600);
      } else {
        setErrorMsg(data.error || 'Registration failed.');
      }
    } catch (err) {
      setErrorMsg('Network connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
      <div className="bg-white border border-gray-200 text-gray-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto relative">
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#3b6e14] flex items-center justify-center font-bold">
              👤
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900 font-['Outfit']">
                {currentUser ? `My Account (${currentUser.name})` : 'Customer Portal'}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                {currentUser ? 'Manage your orders, profile, and delivery details' : 'Login or Create an Account for Fast Checkout'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 font-bold">
            <X size={20} />
          </button>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#3b6e14] text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* TABS SELECTOR (When not logged in) */}
        {!currentUser && (
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-extrabold gap-1">
            <button
              onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setRegStep(1); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                activeTab === 'LOGIN' ? 'bg-[#3b6e14] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('REGISTER'); setErrorMsg(''); setRegStep(1); }}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                activeTab === 'REGISTER' ? 'bg-[#3b6e14] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {!currentUser && activeTab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number or Email *</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text" required
                  placeholder="e.g. +91 98123 45678 / rajesh@gmail.com"
                  value={phone || email}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setEmail(e.target.value);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-gray-700">Password *</label>
                <button
                  type="button"
                  onClick={() => { setActiveTab('FORGOT'); setErrorMsg(''); setSuccessMsg(''); setForgotStep(1); }}
                  className="text-[#3b6e14] font-extrabold hover:underline text-[11px] cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="password" required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRight size={16} />
            </button>

            <p className="text-[10px] text-gray-500 text-center font-medium">
              🔒 Fast & Secure Login using Mobile Phone or Email.
            </p>
          </form>
        )}

        {/* 3. FORGOT PASSWORD FORM */}
        {!currentUser && activeTab === 'FORGOT' && (
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200">
              <h3 className="font-extrabold text-[#3b6e14] text-xs">🔑 Password Reset & Recovery</h3>
              <p className="text-[11px] text-gray-600">Enter your registered email or phone number to receive a 6-digit verification OTP code.</p>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Registered Email or Phone Number *</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text" required
                      placeholder="e.g. rohan@gmail.com or +919988776655"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'Generating OTP...' : 'Send Password Reset OTP'}</span>
                  <ArrowRight size={16} />
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-gray-600 hover:text-gray-900 font-bold text-xs underline cursor-pointer"
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">6-Digit Verification OTP Code *</label>
                  <input
                    type="text" required maxLength={6}
                    placeholder="Enter 6-digit OTP code (e.g. 123456)"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-mono font-bold text-center tracking-widest text-base focus:border-[#3b6e14] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">New Password (Min 6 chars) *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password" required minLength={6}
                      placeholder="••••••••"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'Resetting Password...' : 'Reset Password & Proceed to Login'}</span>
                  <CheckCircle size={16} />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-gray-500 hover:text-gray-800 font-bold text-xs underline cursor-pointer"
                  >
                    ← Re-send OTP or Change Input
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 2. REGISTER FORM WITH INTEGRATED EMAIL OTP */}
        {!currentUser && activeTab === 'REGISTER' && (
          <div>
            {regStep === 1 ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text" required
                      placeholder="e.g. Vikram Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address * (Mandatory for Verification)</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email" required
                      placeholder="e.g. vikram@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number *</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel" required
                      placeholder="e.g. +91 98123 45678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="password" required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:border-[#3b6e14] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'Creating Account...' : 'Create Account & Send Verification Code'}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyRegistrationOtp} className="space-y-4 text-xs">
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
                    type="text" required maxLength={6}
                    placeholder="e.g. 849201"
                    value={regOtp}
                    onChange={(e) => setRegOtp(e.target.value)}
                    className="w-full text-center tracking-widest text-xl font-black py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:border-[#3b6e14] focus:outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold py-3 rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'Activating Account...' : 'Verify OTP & Activate Account'}</span>
                  <CheckCircle size={16} />
                </button>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={handleResendRegistrationOtp}
                    disabled={loading}
                    className="text-[#3b6e14] hover:underline font-bold cursor-pointer"
                  >
                    🔄 Resend OTP Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRegStep(1); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-gray-500 hover:text-gray-800 font-bold underline cursor-pointer"
                  >
                    ← Edit Registration Info
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 3. LOGGED-IN CUSTOMER PROFILE & ORDER HISTORY */}
        {currentUser && (
          <div className="space-y-4 text-xs">
            {/* PROFILE BANNER */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#3b6e14] text-white font-extrabold text-lg flex items-center justify-center shadow-md font-mono">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-gray-900">{currentUser.name}</h4>
                  <p className="text-emerald-800 font-mono text-[11px] font-bold">{currentUser.email}</p>
                  {currentUser.phone && <p className="text-gray-500 text-[10px]">{currentUser.phone}</p>}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>

            {/* MY ORDER HISTORY SECTION */}
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-black text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5 font-['Outfit']">
                  <Package size={16} className="text-[#3b6e14]" /> My Order History ({myOrders.length})
                </span>
                <span className="text-[10px] text-gray-500 font-bold">Real-time status</span>
              </div>

              {loadingOrders ? (
                <div className="text-center py-6 text-gray-400 text-xs font-bold">Loading order history...</div>
              ) : myOrders.length === 0 ? (
                <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-2">
                  <div className="text-3xl">🌱</div>
                  <p className="font-bold text-gray-700 text-xs">No orders placed yet!</p>
                  <p className="text-[11px] text-gray-500">Your recent orders will appear here automatically.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {myOrders.map((order) => {
                    const status = (order.order_status || 'PROCESSING').toUpperCase();
                    const isPreShipping = status === 'PROCESSING' || status === 'PENDING';
                    const isCancelled = status === 'CANCELLED';
                    const isShipped = status === 'SHIPPED';

                    return (
                      <div key={order.id} className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2.5 hover:border-emerald-500 transition-all">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-xs text-[#1b4332] font-mono">{order.order_number}</span>
                          <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                            isCancelled ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            isShipped ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {isCancelled ? '❌ CANCELLED' : isShipped ? '🚚 SHIPPED' : status === 'DELIVERED' ? '✅ DELIVERED' : '⏳ PROCESSING'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-[11px] font-medium text-gray-700">
                          <span>Total: <strong className="text-gray-900">₹{order.total_amount}</strong> ({order.payment_mode})</span>
                          <span className="text-gray-400 font-mono text-[10px]">{new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}</span>
                        </div>

                        {/* COURIER / TRACKING DETAILS IF SHIPPED */}
                        {isShipped && (order.courier_name || order.tracking_number) && (
                          <div className="bg-blue-50 p-2 rounded-xl text-[10px] text-blue-900 border border-blue-200 font-bold flex items-center justify-between">
                            <span>🚚 Courier: {order.courier_name || 'Standard Shipping'}</span>
                            {order.tracking_number && (
                              <span className="font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                                AWB: #{order.tracking_number}
                              </span>
                            )}
                          </div>
                        )}

                        {/* CANCELLATION REASON IF CANCELLED */}
                        {isCancelled && order.cancellation_reason && (
                          <div className="bg-rose-50 p-2 rounded-xl text-[10px] text-rose-900 border border-rose-200 font-bold space-y-0.5">
                            <div>🚫 Reason: "{order.cancellation_reason}"</div>
                            {order.cancellation_notes && <div className="text-rose-700 font-normal">Note: {order.cancellation_notes}</div>}
                          </div>
                        )}

                        {order.order_notes && !isCancelled && (
                          <div className="bg-amber-50/70 p-2 rounded-xl text-[10px] text-amber-900 border border-amber-200/80 font-bold truncate">
                            📝 Remark: "{order.order_notes}"
                          </div>
                        )}

                        {/* CANCEL ORDER BUTTON (BEFORE SHIPPING ONLY) */}
                        {isPreShipping && (
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOrderToCancel(order);
                                setCancelReason('Ordered by mistake');
                                setCancelNotes('');
                              }}
                              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              🚫 Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CUSTOMER ORDER CANCELLATION MODAL */}
      {selectedOrderToCancel && (
        <div className="fixed inset-0 z-[100000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleUp text-gray-900">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider block">PRE-SHIPPING CANCELLATION</span>
                <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">Cancel Order #{selectedOrderToCancel.order_number}</h3>
              </div>
              <button 
                onClick={() => setSelectedOrderToCancel(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4 text-xs">
              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-rose-900 text-[11px] font-medium leading-relaxed">
                ⚠️ Order cancellation is available before dispatch. Once cancelled, your refund/payment will be updated.
              </div>

              <div className="space-y-1">
                <label className="block font-extrabold text-gray-800">Select Cancellation Reason *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 font-bold focus:outline-none focus:border-rose-500 text-xs cursor-pointer"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Want to change shipping address or phone">Want to change shipping address or phone</option>
                  <option value="Want to add/remove items from order">Want to add/remove items from order</option>
                  <option value="Delivery takes too long">Delivery takes too long</option>
                  <option value="Want to change payment mode">Want to change payment mode</option>
                  <option value="Other / Changed my mind">Other / Changed my mind</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-extrabold text-gray-800">Additional Comments / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Provide any additional context or instructions..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 text-xs focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedOrderToCancel(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Keep My Order
                </button>
                <button
                  type="submit"
                  disabled={cancellingOrder}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  {cancellingOrder ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

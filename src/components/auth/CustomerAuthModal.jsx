import { getApiUrl } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import LoginForm from './modal/LoginForm';
import ForgotPasswordForm from './modal/ForgotPasswordForm';
import SignupForm from './modal/SignupForm';
import OtpVerificationForm from './modal/OtpVerificationForm';
import ProfileSummaryView from './modal/ProfileSummaryView';

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

  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[99999]" data-reticle-target="user-auth-modal">
      <div className="bg-white border border-gray-200 text-gray-900 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto relative custom-scrollbar">
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 font-bold cursor-pointer" data-reticle-target="user-auth-close-btn">
            <X size={20} />
          </button>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center" data-reticle-target="user-auth-error-msg">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#3b6e14] text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5" data-reticle-target="user-auth-success-msg">
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {/* TABS SELECTOR (When not logged in) */}
        {!currentUser && (
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 text-xs font-extrabold gap-1">
            <button
              onClick={() => { setActiveTab('LOGIN'); setErrorMsg(''); setRegStep(1); }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'LOGIN' ? 'bg-[#3b6e14] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
              data-reticle-target="user-auth-tab-login"
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('REGISTER'); setErrorMsg(''); setRegStep(1); }}
              className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'REGISTER' ? 'bg-[#3b6e14] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
              }`}
              data-reticle-target="user-auth-tab-register"
            >
              Create Account
            </button>
          </div>
        )}

        {/* 1. LOGIN FORM */}
        {!currentUser && activeTab === 'LOGIN' && (
          <LoginForm
            phone={phone}
            email={email}
            password={password}
            setPhone={setPhone}
            setEmail={setEmail}
            setPassword={setPassword}
            loading={loading}
            onSubmit={handleLoginSubmit}
            onForgotPassword={() => { setActiveTab('FORGOT'); setErrorMsg(''); setSuccessMsg(''); setForgotStep(1); }}
          />
        )}

        {/* 2. FORGOT PASSWORD FORM */}
        {!currentUser && activeTab === 'FORGOT' && (
          <ForgotPasswordForm
            forgotStep={forgotStep}
            forgotInput={forgotInput}
            setForgotInput={setForgotInput}
            forgotOtp={forgotOtp}
            setForgotOtp={setForgotOtp}
            forgotNewPassword={forgotNewPassword}
            setForgotNewPassword={setForgotNewPassword}
            loading={loading}
            onSendForgotOtp={handleSendForgotOtp}
            onResetPasswordSubmit={handleResetPasswordSubmit}
            onBackToLogin={() => { setActiveTab('LOGIN'); setErrorMsg(''); setSuccessMsg(''); }}
            onResendOtp={() => { setForgotStep(1); setErrorMsg(''); setSuccessMsg(''); }}
          />
        )}

        {/* 3. REGISTER FORM & OTP VERIFICATION */}
        {!currentUser && activeTab === 'REGISTER' && (
          regStep === 1 ? (
            <SignupForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              password={password}
              setPassword={setPassword}
              loading={loading}
              onSubmit={handleRegisterSubmit}
            />
          ) : (
            <OtpVerificationForm
              pendingEmail={pendingEmail}
              email={email}
              regOtp={regOtp}
              setRegOtp={setRegOtp}
              loading={loading}
              onSubmit={handleVerifyRegistrationOtp}
              onResendOtp={handleResendRegistrationOtp}
              onEditInfo={() => { setRegStep(1); setErrorMsg(''); setSuccessMsg(''); }}
            />
          )
        )}

        {/* 4. LOGGED-IN CUSTOMER PROFILE & ORDER HISTORY */}
        {currentUser && (
          <ProfileSummaryView
            currentUser={currentUser}
            onLogout={onLogout}
            myOrders={myOrders}
            loadingOrders={loadingOrders}
            selectedOrderToCancel={selectedOrderToCancel}
            setSelectedOrderToCancel={setSelectedOrderToCancel}
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            cancelNotes={cancelNotes}
            setCancelNotes={setCancelNotes}
            cancellingOrder={cancellingOrder}
            onCancelOrderSubmit={handleCancelOrderSubmit}
          />
        )}
      </div>
    </div>
  );
}

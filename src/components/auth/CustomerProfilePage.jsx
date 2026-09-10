import { getApiUrl } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { Package, User, Lock, FileText, ArrowLeft } from 'lucide-react';
import ProfileHeaderBanner from '../profile/ProfileHeaderBanner';
import ProfileOrdersTab from '../profile/tabs/ProfileOrdersTab';
import ProfileDetailsTab from '../profile/tabs/ProfileDetailsTab';
import ProfileSecurityTab from '../profile/tabs/ProfileSecurityTab';
import ProfileGstinTab from '../profile/tabs/ProfileGstinTab';
import CancelOrderModal from '../profile/modals/CancelOrderModal';

export default function CustomerProfilePage({ 
  currentUser, 
  onLogout, 
  onUpdateUser,
  showToast,
  onGoHome,
  onSelectProduct
}) {
  const [activeTab, setActiveTab] = useState('ORDERS'); // 'ORDERS', 'PROFILE', 'SECURITY', 'GSTIN'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [customerOrderStatusFilter, setCustomerOrderStatusFilter] = useState('ALL');
  const [customerOrderPage, setCustomerOrderPage] = useState(1);
  const ordersPerPage = 10;

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    gstin_number: '',
    business_name: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Cancellation Modal State
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
      fetchProfile();
    } else {
      setLoadingOrders(false);
    }
  }, [currentUser?.email, currentUser?.phone]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const identifier = currentUser?.email || currentUser?.phone || currentUser?.id || '';
      if (!identifier) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }
      const queryParams = new URLSearchParams();
      if (currentUser?.email) queryParams.set('email', currentUser.email);
      if (currentUser?.phone) queryParams.set('phone', currentUser.phone);
      if (currentUser?.id) queryParams.set('user_id', currentUser.id);

      const res = await fetch(getApiUrl(`/api/users/${encodeURIComponent(identifier)}/orders?${queryParams.toString()}`));
      if (res.ok) {
        const text = await res.text();
        if (!text || !text.trim()) {
          setOrders([]);
          return;
        }
        try {
          const data = JSON.parse(text);
          setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const identifier = currentUser?.email || currentUser?.phone || '';
      if (!identifier) return;
      const res = await fetch(getApiUrl(`/api/users/${encodeURIComponent(identifier)}/profile`));
      if (res.ok) {
        const data = await res.json();
        setProfileForm({
          name: data.name || currentUser?.name || '',
          email: data.email || currentUser?.email || '',
          phone: data.phone || currentUser?.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || 'Maharashtra',
          pincode: data.pincode || '',
          gstin_number: data.gstin_number || '',
          business_name: data.business_name || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // 1. GSTIN TAB VALIDATION: Prevent sending request if both GST fields are empty
    if (activeTab === 'GSTIN') {
      const hasBusinessName = profileForm.business_name && profileForm.business_name.trim();
      const hasGstin = profileForm.gstin_number && profileForm.gstin_number.trim();

      if (!hasBusinessName && !hasGstin) {
        if (showToast) showToast('error', 'Empty GST Details', 'Please fill in Registered Business Name or GSTIN Identification Number before saving.');
        return;
      }

      if (hasGstin && profileForm.gstin_number.trim().length < 15) {
        if (showToast) showToast('error', 'Invalid GSTIN Format', 'GSTIN Identification Number must be 15 alphanumeric characters (e.g. 27AAAAA0000A1Z5).');
        return;
      }
    }

    // 2. PROFILE TAB VALIDATION: Prevent sending request if mandatory fields are empty
    if (activeTab === 'PROFILE') {
      if (!profileForm.name || !profileForm.name.trim()) {
        if (showToast) showToast('error', 'Validation Error', 'Full Name is mandatory and required.');
        return;
      }
      if (!profileForm.phone || !profileForm.phone.trim()) {
        if (showToast) showToast('error', 'Validation Error', 'Phone number is mandatory and required.');
        return;
      }
      if (!profileForm.address || !profileForm.address.trim()) {
        if (showToast) showToast('error', 'Validation Error', 'Shipping Delivery Address is mandatory and required.');
        return;
      }
    }

    setSavingProfile(true);
    try {
      const identifier = currentUser?.email || currentUser?.phone || '';
      const res = await fetch(getApiUrl(`/api/users/${encodeURIComponent(identifier)}/profile`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUserObj = {
          ...currentUser,
          ...(data.user || {}),
          name: profileForm.name,
          phone: profileForm.phone,
          address: profileForm.address,
          city: profileForm.city,
          state: profileForm.state,
          pincode: profileForm.pincode,
          gstin_number: profileForm.gstin_number,
          business_name: profileForm.business_name
        };

        try {
          localStorage.setItem('customerUser', JSON.stringify(updatedUserObj));
        } catch (e) {}

        if (typeof onUpdateUser === 'function') {
          onUpdateUser(updatedUserObj);
        }

        if (showToast) showToast('success', 'Profile Saved', 'Your account and address details have been permanently updated!');
        fetchProfile();
      } else {
        if (showToast) showToast('error', 'Update Failed', data.error || 'Failed to update profile.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Network Error', 'Could not save profile details.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.currentPassword.trim()) {
      if (showToast) showToast('error', 'Validation Error', 'Please enter your Current Password.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      if (showToast) showToast('error', 'Mismatch Error', 'New password and confirm password do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      if (showToast) showToast('error', 'Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(getApiUrl('/api/auth/change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: currentUser.email,
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        if (showToast) showToast('success', 'Password Updated', 'Your password has been changed successfully!');
      } else {
        if (showToast) showToast('error', 'Password Error', data.error || 'Failed to change password.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Network Error', 'Could not update password.');
    } finally {
      setChangingPassword(false);
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
          customer_email: currentUser.email
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (showToast) showToast('success', 'Order Cancelled', `Order ${selectedOrderToCancel.order_number} has been cancelled.`);
        setSelectedOrderToCancel(null);
        setCancelNotes('');
        fetchOrders();
      } else {
        if (showToast) showToast('error', 'Cancellation Error', data.error || 'Failed to cancel order.');
      }
    } catch (err) {
      if (showToast) showToast('error', 'Network Error', 'Failed to submit cancellation request.');
    } finally {
      setCancellingOrder(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4" data-reticle-target="user-profile-login-required">
        <div className="text-5xl">🌱</div>
        <h2 className="text-2xl font-extrabold text-gray-900 font-['Outfit']">Customer Portal Access Required</h2>
        <p className="text-gray-600 text-sm max-w-md">Please sign in to view your orders, live shipment tracking, saved addresses, and profile settings.</p>
        <button 
          onClick={onGoHome}
          className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors text-sm cursor-pointer"
          data-reticle-target="user-profile-return-home-btn"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/20 py-8 px-4 sm:px-6 lg:px-8" data-reticle-target="user-profile-page">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP NAVIGATION BREADCRUMB & BACK BUTTON */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onGoHome}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#3b6e14] transition-colors cursor-pointer"
            data-reticle-target="user-profile-back-link"
          >
            <ArrowLeft size={16} /> Return to Shop
          </button>
          <span className="text-xs font-bold text-gray-400 font-mono">My Account Hub</span>
        </div>

        {/* CUSTOMER HEADER PROFILE BANNER */}
        <ProfileHeaderBanner 
          profileForm={profileForm}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        {/* MAIN DASHBOARD CONTAINER WITH SIDEBAR TABS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* SIDEBAR NAVIGATION TABS */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-sm space-y-1">
              <button
                onClick={() => setActiveTab('ORDERS')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ORDERS' 
                    ? 'bg-[#3b6e14] text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                data-reticle-target="user-tab-orders"
              >
                <div className="flex items-center gap-2.5">
                  <Package size={17} />
                  <span>My Orders</span>
                </div>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md font-black">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('PROFILE')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'PROFILE' 
                    ? 'bg-[#3b6e14] text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                data-reticle-target="user-tab-profile"
              >
                <User size={17} />
                <span>Profile & Delivery Address</span>
              </button>

              <button
                onClick={() => setActiveTab('SECURITY')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'SECURITY' 
                    ? 'bg-[#3b6e14] text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                data-reticle-target="user-tab-security"
              >
                <Lock size={17} />
                <span>Change Password</span>
              </button>

              <button
                onClick={() => setActiveTab('GSTIN')}
                className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'GSTIN' 
                    ? 'bg-[#3b6e14] text-white shadow-md' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                data-reticle-target="user-tab-gstin"
              >
                <FileText size={17} />
                <span>GSTIN & Business Profile</span>
              </button>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="lg:col-span-3">
            {activeTab === 'ORDERS' && (
              <ProfileOrdersTab
                orders={orders}
                loadingOrders={loadingOrders}
                fetchOrders={fetchOrders}
                customerOrderStatusFilter={customerOrderStatusFilter}
                setCustomerOrderStatusFilter={setCustomerOrderStatusFilter}
                customerOrderPage={customerOrderPage}
                setCustomerOrderPage={setCustomerOrderPage}
                ordersPerPage={ordersPerPage}
                onGoHome={onGoHome}
                onSelectOrderToCancel={(order) => {
                  setSelectedOrderToCancel(order);
                  setCancelReason('Ordered by mistake');
                  setCancelNotes('');
                }}
              />
            )}

            {activeTab === 'PROFILE' && (
              <ProfileDetailsTab
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                savingProfile={savingProfile}
                onSubmit={handleSaveProfile}
              />
            )}

            {activeTab === 'SECURITY' && (
              <ProfileSecurityTab
                passwordForm={passwordForm}
                setPasswordForm={setPasswordForm}
                changingPassword={changingPassword}
                onSubmit={handleChangePassword}
              />
            )}

            {activeTab === 'GSTIN' && (
              <ProfileGstinTab
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                savingProfile={savingProfile}
                onSubmit={handleSaveProfile}
              />
            )}
          </div>
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      <CancelOrderModal
        selectedOrderToCancel={selectedOrderToCancel}
        onClose={() => setSelectedOrderToCancel(null)}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelNotes={cancelNotes}
        setCancelNotes={setCancelNotes}
        cancellingOrder={cancellingOrder}
        onSubmit={handleCancelOrderSubmit}
      />
    </div>
  );
}

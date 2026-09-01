import { getApiUrl } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { 
  User, Package, MapPin, Lock, FileText, LogOut, ShieldCheck, 
  CheckCircle, Truck, RefreshCw, ChevronRight, X, AlertCircle, Save, ArrowLeft
} from 'lucide-react';

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
    state: '',
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
      const identifier = currentUser?.email || currentUser?.phone || '';
      if (!identifier) {
        setOrders([]);
        setLoadingOrders(false);
        return;
      }
      const res = await fetch(getApiUrl(`/api/users/${encodeURIComponent(identifier)}/orders`));
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
    if (activeTab === 'profile') {
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="text-5xl">🌱</div>
        <h2 className="text-2xl font-extrabold text-gray-900 font-['Outfit']">Customer Portal Access Required</h2>
        <p className="text-gray-600 text-sm max-w-md">Please sign in to view your orders, live shipment tracking, saved addresses, and profile settings.</p>
        <button 
          onClick={onGoHome}
          className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-bold px-6 py-3 rounded-xl shadow-md transition-colors text-sm"
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP NAVIGATION BREADCRUMB & BACK BUTTON */}
        <div className="flex justify-between items-center">
          <button 
            onClick={onGoHome}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#3b6e14] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to Shop
          </button>
          <span className="text-xs font-bold text-gray-400 font-mono">My Account Hub</span>
        </div>

        {/* CUSTOMER HEADER PROFILE BANNER */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#3b6e14] text-white text-2xl font-black flex items-center justify-center shadow-md font-['Outfit']">
              {(profileForm.name || currentUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-gray-900 font-['Outfit']">
                  {profileForm.name || currentUser.name || 'Customer Account'}
                </h1>
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  VERIFIED MEMBER
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">{currentUser.email}</p>
              {profileForm.phone && <p className="text-xs text-gray-400 font-medium">📞 {profileForm.phone}</p>}
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

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
              >
                <FileText size={17} />
                <span>GSTIN & Business Profile</span>
              </button>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="lg:col-span-3">

            {/* TAB 1: MY ORDERS & LIVE SHIPMENT TRACKING */}
            {activeTab === 'ORDERS' && (
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
                      📦 My Orders & Live Courier Tracking
                    </h2>
                    <p className="text-xs text-gray-500">Track real-time shipment status, courier AWB numbers, and manage pre-shipping self-cancellations.</p>
                  </div>
                  <button 
                    onClick={fetchOrders} 
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors cursor-pointer"
                    title="Refresh Orders"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                {/* STATUS FILTER PILLS & COUNT BAR */}
                {orders.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                    {[
                      { id: 'ALL', label: `📋 All Orders (${orders.length})` },
                      { id: 'PROCESSING', label: `⏳ Processing (${orders.filter(o => { const s = (o.order_status || 'PROCESSING').toUpperCase(); return s === 'PROCESSING' || s === 'PENDING'; }).length})` },
                      { id: 'SHIPPED', label: `🚚 Shipped (${orders.filter(o => (o.order_status || '').toUpperCase() === 'SHIPPED').length})` },
                      { id: 'DELIVERED', label: `✅ Delivered (${orders.filter(o => (o.order_status || '').toUpperCase() === 'DELIVERED').length})` },
                      { id: 'CANCELLED', label: `❌ Cancelled (${orders.filter(o => (o.order_status || '').toUpperCase() === 'CANCELLED').length})` }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => { setCustomerOrderStatusFilter(tab.id); setCustomerOrderPage(1); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                          customerOrderStatusFilter === tab.id
                            ? 'bg-[#3b6e14] text-white border-[#2d560f] shadow-md'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}

                {loadingOrders ? (
                  <div className="py-12 text-center text-gray-400 font-bold text-xs space-y-2">
                    <RefreshCw size={24} className="animate-spin mx-auto text-[#3b6e14]" />
                    <p>Loading your order history...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center space-y-3 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="text-4xl">🌱</div>
                    <h3 className="font-bold text-gray-800 text-sm">No orders placed yet!</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">Explore our 100% certified organic fertilizers, seeds, and gardening supplies to place your first order.</p>
                    <button 
                      onClick={onGoHome}
                      className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md cursor-pointer"
                    >
                      Browse Organic Catalog
                    </button>
                  </div>
                ) : (() => {
                  const filteredOrders = orders.filter(order => {
                    if (customerOrderStatusFilter === 'ALL') return true;
                    const status = (order.order_status || 'PROCESSING').toUpperCase();
                    if (customerOrderStatusFilter === 'PROCESSING') return status === 'PROCESSING' || status === 'PENDING';
                    return status === customerOrderStatusFilter;
                  });

                  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
                  const paginatedOrders = filteredOrders.slice((customerOrderPage - 1) * ordersPerPage, customerOrderPage * ordersPerPage);

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="py-10 text-center space-y-2 bg-gray-50 rounded-2xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-600">No {customerOrderStatusFilter.toLowerCase()} orders found.</p>
                        <button 
                          type="button" 
                          onClick={() => setCustomerOrderStatusFilter('ALL')}
                          className="text-xs font-bold text-[#3b6e14] underline cursor-pointer"
                        >
                          View All Orders
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {paginatedOrders.map((order) => {
                        const status = (order.order_status || 'PROCESSING').toUpperCase();
                        const isPreShipping = status === 'PROCESSING' || status === 'PENDING';
                        const isCancelled = status === 'CANCELLED';
                        const isShipped = status === 'SHIPPED';
                        const isDelivered = status === 'DELIVERED';

                        return (
                          <div key={order.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3 hover:border-gray-300 transition-all">
                            {/* ORDER HEADER */}
                            <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-gray-900 font-mono">{order.order_number}</span>
                                  <span className="text-[10px] text-gray-400 font-bold">
                                    {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}
                                  </span>
                                </div>
                                <p className="text-xs font-bold text-gray-600 mt-0.5">
                                  Total: <span className="text-[#3b6e14] font-black">₹{(order.total_amount || 0).toLocaleString('en-IN')}</span> 
                                  <span className="text-[10px] text-gray-400 ml-1.5 uppercase">({order.payment_mode || 'FULL'})</span>
                                </p>
                              </div>

                              {/* STATUS BADGE */}
                              <div className="flex items-center gap-2">
                                {isCancelled && (
                                  <span className="bg-rose-100 text-rose-700 border border-rose-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                                    ❌ CANCELLED
                                  </span>
                                )}
                                {isShipped && (
                                  <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                                    🚚 SHIPPED
                                  </span>
                                )}
                                {isDelivered && (
                                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                                    ✅ DELIVERED
                                  </span>
                                )}
                                {isPreShipping && (
                                  <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                                    ⏳ PROCESSING
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* ITEMIZED PRODUCTS DETAILS LIST */}
                            {order.items && order.items.length > 0 && (
                              <div className="divide-y divide-gray-100 bg-gray-50/80 rounded-xl border border-gray-200 overflow-hidden my-2">
                                {order.items.map((item, itemIdx) => {
                                  const imgUrl = resolveImgUrl(item.item_image || item.thumbnail || item.primary_image || item.image_url);
                                  const title = item.product_title || item.title || item.name || 'Organic Product';
                                  const variant = item.variant_name || item.variant_title || null;
                                  const qty = item.quantity || 1;
                                  const unitPrice = item.price || item.price_inr || 0;

                                  return (
                                    <div key={item.id || itemIdx} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-100/60 transition-colors">
                                      <div className="flex items-center gap-3 min-w-0">
                                        {imgUrl ? (
                                          <img 
                                            src={imgUrl} 
                                            alt={title} 
                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 bg-white shrink-0 shadow-sm" 
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold shrink-0">
                                            Product
                                          </div>
                                        )}
                                        <div className="min-w-0 space-y-0.5">
                                          <h4 className="text-xs font-extrabold text-gray-900 truncate tracking-tight">{title}</h4>
                                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                            {variant && (
                                              <span className="bg-emerald-100 text-[#3b6e14] border border-emerald-200 font-extrabold px-2 py-0.5 rounded-md text-[10px]">
                                                {variant}
                                              </span>
                                            )}
                                            <span className="text-gray-500 font-semibold">Qty: <strong className="text-gray-800 font-extrabold">{qty}</strong></span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <span className="text-xs font-black text-[#3b6e14] block">₹{(unitPrice * qty).toLocaleString('en-IN')}</span>
                                        {qty > 1 && (
                                          <span className="text-[10px] text-gray-400 font-bold block">₹{unitPrice}/ea</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* LIVE COURIER TRACKING BOX */}
                            {order.courier_name && (
                              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex flex-wrap justify-between items-center text-xs gap-2">
                                <div className="flex items-center gap-2">
                                  <Truck size={16} className="text-blue-600" />
                                  <span className="font-extrabold text-blue-950">Courier: {order.courier_name}</span>
                                  {order.tracking_number && (
                                    <span className="font-mono bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold">
                                      AWB: #{order.tracking_number}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-bold text-blue-700">Out for delivery soon</span>
                              </div>
                            )}

                            {/* CANCELLATION REASON DISPLAY */}
                            {isCancelled && (
                              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-1">
                                <span className="font-bold block">🚫 Status: Cancelled</span>
                                {order.cancellation_reason && (
                                  <span className="font-semibold block text-rose-700">Reason: "{order.cancellation_reason}"</span>
                                )}
                                {order.cancellation_notes && <p className="text-[11px] text-rose-600">Note: {order.cancellation_notes}</p>}
                              </div>
                            )}

                            {/* CANCEL ORDER ACTION BUTTON */}
                            {isPreShipping && (
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderToCancel(order)}
                                  className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-colors cursor-pointer"
                                >
                                  ✕ Cancel Order (Pre-shipping)
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* PAGINATION CONTROLS */}
                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4 text-xs font-bold text-gray-700">
                          <span>
                            Showing {Math.min((customerOrderPage - 1) * ordersPerPage + 1, filteredOrders.length)} - {Math.min(customerOrderPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} Orders
                          </span>

                          <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full py-1">
                            <button
                              type="button"
                              disabled={customerOrderPage === 1}
                              onClick={() => setCustomerOrderPage(prev => Math.max(1, prev - 1))}
                              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs cursor-pointer shrink-0"
                            >
                              ← Previous
                            </button>

                            {(() => {
                              const pages = [];
                              if (totalPages <= 7) {
                                for (let i = 1; i <= totalPages; i++) pages.push(i);
                              } else {
                                pages.push(1);
                                if (customerOrderPage > 3) pages.push('...');
                                const start = Math.max(2, customerOrderPage - 1);
                                const end = Math.min(totalPages - 1, customerOrderPage + 1);
                                for (let i = start; i <= end; i++) {
                                  if (i > 1 && i < totalPages) pages.push(i);
                                }
                                if (customerOrderPage < totalPages - 2) pages.push('...');
                                pages.push(totalPages);
                              }

                              return pages.map((pNum, pIdx) => {
                                if (pNum === '...') {
                                  return <span key={`dots-${pIdx}`} className="px-1.5 text-gray-400 font-extrabold text-xs select-none">...</span>;
                                }
                                return (
                                  <button
                                    key={pNum}
                                    type="button"
                                    onClick={() => setCustomerOrderPage(pNum)}
                                    className={`w-8 h-8 rounded-xl font-black text-xs transition-all cursor-pointer shrink-0 ${
                                      customerOrderPage === pNum
                                        ? 'bg-[#3b6e14] text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {pNum}
                                  </button>
                                );
                              });
                            })()}

                            <button
                              type="button"
                              disabled={customerOrderPage === totalPages}
                              onClick={() => setCustomerOrderPage(prev => Math.min(totalPages, prev + 1))}
                              className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs cursor-pointer shrink-0"
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 2: PROFILE & ADDRESS DETAILS */}
            {activeTab === 'PROFILE' && (
              <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
                    👤 Profile & Saved Shipping Address
                  </h2>
                  <p className="text-xs text-gray-500">Update your personal contact information and default delivery address for instant checkout.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">Full Name *</label>
                    <input 
                      type="text" required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">Phone Number *</label>
                    <input 
                      type="text" required
                      placeholder="+91 98765 43210"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 font-extrabold mb-1">Email Address (Account ID)</label>
                    <input 
                      type="email" disabled
                      value={profileForm.email}
                      className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-700 font-extrabold mb-1">Complete Street / Flat Address *</label>
                    <textarea 
                      rows={2} required
                      placeholder="House No, Apartment/Building, Street Name, Landmark"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">City *</label>
                    <input 
                      type="text" required
                      placeholder="e.g. Mumbai / Delhi / Bengaluru"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">Pincode *</label>
                    <input 
                      type="text" required maxLength={6}
                      placeholder="6-digit Pincode"
                      value={profileForm.pincode}
                      onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">State *</label>
                    <select 
                      value={profileForm.state}
                      onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 cursor-pointer focus:bg-white focus:border-[#3b6e14]"
                    >
                      {[
                        "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
                        "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
                        "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
                        "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
                        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
                        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
                        "Uttarakhand", "West Bengal"
                      ].map(stName => (
                        <option key={stName} value={stName}>{stName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={16} />
                    <span>{savingProfile ? 'Saving Details...' : 'Save Profile & Address'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: CHANGE PASSWORD */}
            {activeTab === 'SECURITY' && (
              <form onSubmit={handleChangePassword} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
                    🔐 Change Account Password & Security
                  </h2>
                  <p className="text-xs text-gray-500">Update your login credentials to keep your ValueLife Essentials account secure.</p>
                </div>

                <div className="space-y-4 max-w-md text-xs">
                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">Current Password *</label>
                    <input 
                      type="password" required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">New Password *</label>
                    <input 
                      type="password" required minLength={6}
                      placeholder="At least 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">Confirm New Password *</label>
                    <input 
                      type="password" required minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Lock size={16} />
                    <span>{changingPassword ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 4: GSTIN & B2B BUSINESS DETAILS */}
            {activeTab === 'GSTIN' && (
              <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-lg font-extrabold text-gray-900 font-['Outfit'] flex items-center gap-2">
                    🏛️ GSTIN & B2B Business Tax Invoice Details
                  </h2>
                  <p className="text-xs text-gray-500">Save your registered GSTIN for automatic GST tax invoice generation & input tax credit claims.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">Registered Business / Legal Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. VALUELIFE ESSENTIALS Retail Pvt Ltd"
                      value={profileForm.business_name}
                      onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:bg-white focus:border-[#3b6e14]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-extrabold mb-1">GSTIN Identification Number</label>
                    <input 
                      type="text"
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      value={profileForm.gstin_number}
                      onChange={(e) => setProfileForm({ ...profileForm, gstin_number: e.target.value.toUpperCase() })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-[#3b6e14] focus:bg-white focus:border-[#3b6e14]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-[#3b6e14] hover:bg-[#2d560f] text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <Save size={16} />
                    <span>{savingProfile ? 'Saving Details...' : 'Save GSTIN Details'}</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      {selectedOrderToCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">
                  Cancel Order #{selectedOrderToCancel.order_number}
                </h3>
                <p className="text-xs text-gray-500">Select reason for pre-shipping cancellation</p>
              </div>
              <button 
                onClick={() => setSelectedOrderToCancel(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCancelOrderSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Reason for Cancellation *</label>
                <select 
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 cursor-pointer"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found better price elsewhere">Found better price elsewhere</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Changed mind / Don't need anymore">Changed mind / Don't need anymore</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Additional Notes / Details</label>
                <textarea 
                  rows={2}
                  placeholder="Optional comments for customer support"
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setSelectedOrderToCancel(null)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Keep Order
                </button>
                <button 
                  type="submit"
                  disabled={cancellingOrder}
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  {cancellingOrder ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

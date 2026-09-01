import { getApiUrl } from '../../api/config';
import React, { useState } from 'react';
import { Home, Bookmark, User, UserCheck, ShoppingBag, PhoneCall, X, Search, PackageCheck, Truck } from 'lucide-react';

export default function MobileBottomNav({ 
  cartCount = 0, 
  navigateTo, 
  onOpenCart,
  currentUser,
  onOpenAuth
}) {
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackInput, setTrackInput] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackError, setTrackError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleAccountOrProfileClick = () => {
    if (currentUser) {
      if (navigateTo) navigateTo('/account', { view: 'account', slug: null, category: null, collection: null });
    } else {
      if (onOpenAuth) onOpenAuth();
      else if (navigateTo) navigateTo('/auth', { view: 'auth' });
    }
  };

  const handleTrackSearch = async (e) => {
    e.preventDefault();
    if (!trackInput.trim()) return;
    setIsSearching(true);
    setTrackError('');
    setTrackedOrder(null);

    try {
      const res = await fetch(getApiUrl('/api/orders'));
      const allOrders = await res.json();
      const found = allOrders.find(o => 
        o.order_number?.toLowerCase() === trackInput.trim().toLowerCase() ||
        o.customer_phone?.includes(trackInput.trim()) ||
        o.id?.toString() === trackInput.trim()
      );

      if (found) {
        setTrackedOrder(found);
      } else {
        setTrackError(`No order found matching "${trackInput}". Please check your order number (e.g. OB-2026-1026).`);
      }
    } catch (err) {
      setTrackError('Error tracking order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* STICKY BOTTOM MOBILE DOCK (Matching User Screenshot 1-to-1) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 py-1.5 px-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {/* 1. HOME */}
        <button
          type="button"
          onClick={() => navigateTo('/', { view: 'store', slug: null, category: null, collection: null })}
          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#3b6e14] transition-colors py-1"
        >
          <Home size={19} className="stroke-[2.2]" />
          <span className="text-[10px] font-extrabold tracking-tight font-['Outfit']">Home</span>
        </button>

        {/* 2. COLLECTIONS */}
        <button
          type="button"
          onClick={() => navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null })}
          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#3b6e14] transition-colors py-1"
        >
          <Bookmark size={19} className="stroke-[2.2]" />
          <span className="text-[10px] font-extrabold tracking-tight font-['Outfit']">Collections</span>
        </button>

        {/* 3. ACCOUNT / PROFILE (DYNAMICALLY CHANGED BASED ON AUTH STATUS) */}
        <button
          type="button"
          onClick={handleAccountOrProfileClick}
          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#3b6e14] transition-colors py-1 relative"
        >
          {currentUser ? (
            <>
              <UserCheck size={19} className="stroke-[2.2] text-[#3b6e14]" />
              <span className="text-[10px] font-extrabold tracking-tight font-['Outfit'] text-[#3b6e14]">
                {currentUser.name ? currentUser.name.split(' ')[0] : 'Profile'}
              </span>
            </>
          ) : (
            <>
              <User size={19} className="stroke-[2.2]" />
              <span className="text-[10px] font-extrabold tracking-tight font-['Outfit']">Account</span>
            </>
          )}
        </button>

        {/* 4. CART WITH BADGE */}
        <button
          type="button"
          onClick={onOpenCart}
          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#3b6e14] transition-colors py-1 relative"
        >
          <div className="relative">
            <ShoppingBag size={19} className="stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-extrabold tracking-tight font-['Outfit']">Cart</span>
        </button>

        {/* 5. CONTACT */}
        <button
          type="button"
          onClick={() => navigateTo('/pages/contact-us', { view: 'page', slug: 'contact-us', category: null, collection: null })}
          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#3b6e14] transition-colors py-1"
        >
          <PhoneCall size={19} className="stroke-[2.2]" />
          <span className="text-[10px] font-extrabold tracking-tight font-['Outfit']">Contact</span>
        </button>
      </div>

      {/* TRACK ORDER MODAL */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white border border-gray-200 text-gray-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-scaleIn relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#3b6e14] flex items-center justify-center font-bold">
                  📍
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 font-['Outfit']">Track Shipment Status</h3>
                  <p className="text-[11px] text-gray-500 font-medium">Enter your Order Number or Registered Mobile</p>
                </div>
              </div>
              <button 
                onClick={() => { setShowTrackModal(false); setTrackedOrder(null); setTrackError(''); }}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* TRACK SEARCH FORM */}
            <form onSubmit={handleTrackSearch} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="e.g. OB-2026-1026 or 9876543210"
                value={trackInput}
                onChange={(e) => setTrackInput(e.target.value)}
                className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold focus:border-[#3b6e14] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="bg-[#3b6e14] hover:bg-[#2e5710] text-white font-extrabold px-4 py-3 rounded-xl text-xs flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Search size={14} /> Track
              </button>
            </form>

            {trackError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center">
                {trackError}
              </div>
            )}

            {/* TRACKED ORDER RESULT CARD */}
            {trackedOrder && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-200/80 pb-2">
                  <span className="font-black text-sm text-[#1b4332] font-mono">{trackedOrder.order_number}</span>
                  <span className="bg-[#3b6e14] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    {trackedOrder.order_status || 'PROCESSING'}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-gray-700 font-medium">
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <strong className="text-gray-900">{trackedOrder.customer_name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Amount:</span>
                    <strong className="text-[#3b6e14]">₹{trackedOrder.total_amount} ({trackedOrder.payment_mode})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Address:</span>
                    <span className="text-gray-600 line-clamp-1">{trackedOrder.shipping_address}</span>
                  </div>
                </div>

                {/* PROGRESS STEPPER */}
                <div className="pt-2 border-t border-emerald-200/80 space-y-2">
                  <span className="text-[10px] font-black text-emerald-900 uppercase block">Shipment Timeline:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300">
                      ✓ Order Placed
                    </div>
                    <div className="p-2 bg-emerald-700 text-white rounded-lg shadow-sm">
                      📦 Processing
                    </div>
                    <div className="p-2 bg-white text-gray-400 rounded-lg border border-gray-200">
                      🚚 Out for Delivery
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

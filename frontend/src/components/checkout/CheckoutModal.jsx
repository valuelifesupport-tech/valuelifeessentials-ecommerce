import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal"
];

const clean10Phone = (p) => {
  if (!p) return '';
  const digits = String(p).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  const m = digits.match(/[6-9]\d{9}/);
  if (m) return m[0];
  return digits.length > 10 ? digits.slice(-10) : digits;
};

export default function CheckoutModal({
  isOpen,
  onClose,
  checkoutData,
  cart = [],
  currencySymbol = '₹',
  customerForm,
  setCustomerForm,
  currentUser,
  handleOrderSubmit,
  isSubmittingOrder,
  selectedPaymentGateway,
  setSelectedPaymentGateway,
  orderSuccess,
  setOrderSuccess,
  navigateTo
}) {
  if (!isOpen && !orderSuccess) return null;

  // Auto-fill logged-in user credentials and structured address when checkout opens (once per open)
  const wasOpenRef = React.useRef(false);
  React.useEffect(() => {
    if (isOpen && !wasOpenRef.current && currentUser) {
      const uPhone = clean10Phone(customerForm?.phone || currentUser.phone);
      setCustomerForm(prev => ({
        ...prev,
        name: prev?.name || currentUser.name || '',
        phone: prev?.phone || uPhone || '',
        email: prev?.email || currentUser.email || '',
        street: prev?.street || currentUser.address || localStorage.getItem('user_last_shipping_address') || '',
        address: prev?.address || currentUser.address || localStorage.getItem('user_last_shipping_address') || '',
        city: prev?.city || currentUser.city || '',
        state: prev?.state || currentUser.state || 'Maharashtra',
        pincode: prev?.pincode || currentUser.pincode || '',
        remark: prev?.remark || ''
      }));
    }
    wasOpenRef.current = isOpen;
  }, [isOpen]);

  return (
    <>
      {/* CHECKOUT MODAL */}
      {isOpen && checkoutData && !orderSuccess && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]" data-reticle-target="checkout-modal-backdrop">
          <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto relative" data-reticle-target="checkout-modal-dialog">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <h3 className="font-extrabold text-lg text-gray-900 font-['Outfit']">Customer Order Checkout</h3>
              </div>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-gray-700 font-bold text-lg cursor-pointer"
                data-reticle-target="checkout-close-btn"
              >
                ✕
              </button>
            </div>

            {/* AUTO-FILLED USER BANNER */}
            {currentUser && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-xl text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>
                    Logged in as: <strong className="font-bold text-emerald-900">{currentUser.name || currentUser.phone || currentUser.email}</strong>
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
                  Details Auto-Filled
                </span>
              </div>
            )}

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-gray-700 pb-1 border-b border-emerald-200/60">
                <span>Items Subtotal ({cart.length} items):</span>
                <span>{currencySymbol}{checkoutData.rawSubtotal || checkoutData.finalTotal}</span>
              </div>

              {checkoutData.discountAmount > 0 && (
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Coupon Discount:</span>
                  <span>-{currencySymbol}{checkoutData.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-gray-700">
                <span>Delivery / Shipping:</span>
                {checkoutData.isFreeShipping || checkoutData.shippingAmount === 0 ? (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-black">FREE 🚚</span>
                ) : (
                  <span className="text-gray-900">+{currencySymbol}{checkoutData.shippingAmount}</span>
                )}
              </div>

              {!checkoutData.isTaxInclusive ? (
                <div className="flex justify-between font-bold text-amber-800">
                  <span>GST Tax (Added at Checkout):</span>
                  <span>+{currencySymbol}{checkoutData.taxAmount || 0}</span>
                </div>
              ) : (
                <div className="flex justify-between font-medium text-emerald-800">
                  <span>Included GST Tax (Inclusive):</span>
                  <span>(Includes {currencySymbol}{checkoutData.taxAmount || 0} GST)</span>
                </div>
              )}

              <div className="flex justify-between font-extrabold text-gray-900 pt-1 border-t border-emerald-300">
                <span>Total Order Amount:</span>
                <span className="text-emerald-800 text-sm font-black">{currencySymbol}{checkoutData.finalTotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold pt-0.5">
                <span>Payment Mode Selected:</span>
                <span>
                  {checkoutData.paymentMode === 'PARTIAL' 
                    ? '⚡ Partial Deposit (Balance Rest on COD)' 
                    : checkoutData.paymentMode === 'COD' 
                    ? '💵 100% Cash on Delivery (COD)' 
                    : '💳 100% Full Online Prepaid'}
                </span>
              </div>
              {checkoutData.paymentMode === 'PARTIAL' && (
                <div className="flex justify-between font-extrabold text-emerald-900 pt-1 border-t border-emerald-300">
                  <span>Pay Deposit Online Now:</span>
                  <span>{currencySymbol}{checkoutData.depositAmount}</span>
                </div>
              )}
              {checkoutData.paymentMode === 'COD' && (
                <div className="flex justify-between font-extrabold text-amber-950 pt-1 border-t border-amber-300">
                  <span>Pay Online Now:</span>
                  <span className="text-emerald-700 font-black">{currencySymbol}0 (Pay full cash on delivery)</span>
                </div>
              )}

              {/* PAYMENT GATEWAY DISPLAY FOR ONLINE PAYMENTS (RAZORPAY ONLY) */}
              {checkoutData.paymentMode !== 'COD' && (
                <div className="pt-2 border-t border-emerald-300/80 flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <span className="text-emerald-600 text-sm">🔒</span> Secure Payment Partner:
                  </span>
                  <div className="flex items-center gap-2 bg-white border border-emerald-300 px-3 py-1.5 rounded-lg shadow-xs">
                    <span className="font-black text-emerald-950 text-xs tracking-tight">Razorpay</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">UPI / Cards / NetBanking</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs" data-reticle-target="checkout-form">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" required placeholder="e.g. Rajesh Gupta"
                  value={customerForm?.name || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none"
                  data-reticle-target="checkout-input-name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number * (10 Digits)</label>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-xs font-mono font-bold">
                      +91
                    </span>
                    <input 
                      type="tel" 
                      required 
                      maxLength={10}
                      placeholder="9812345678"
                      value={customerForm?.phone || ''}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setCustomerForm(prev => ({ ...prev, phone: val }));
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-r-lg text-gray-900 font-mono font-bold focus:border-emerald-600 focus:outline-none text-xs"
                      data-reticle-target="checkout-input-phone"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                  <input 
                    type="email" placeholder="e.g. rajesh@gmail.com (Optional)"
                    value={customerForm?.email || ''}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                    data-reticle-target="checkout-input-email"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">House / Flat No., Building, Street Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Flat 302, Palm Heights, Main Link Road"
                  value={customerForm?.street || customerForm?.address || ''}
                  onChange={(e) => {
                    const stVal = e.target.value;
                    setCustomerForm(prev => ({ 
                      ...prev, 
                      street: stVal,
                      address: stVal 
                    }));
                  }}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                  data-reticle-target="checkout-input-address"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">City / Town *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Mumbai"
                    value={customerForm?.city || ''}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                    data-reticle-target="checkout-input-city"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">State *</label>
                  <select
                    required
                    value={customerForm?.state || 'Maharashtra'}
                    onChange={(e) => setCustomerForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs cursor-pointer"
                    data-reticle-target="checkout-select-state"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Pincode * (6 Digits)</label>
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    placeholder="e.g. 400001"
                    value={customerForm?.pincode || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCustomerForm(prev => ({ ...prev, pincode: val }));
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-mono font-bold focus:border-emerald-600 focus:outline-none text-xs text-center"
                    data-reticle-target="checkout-input-pincode"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span>📝 Order Remark & Special Instructions (Optional)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Please call before delivery, leave with security guard, pack in eco-friendly box..."
                  value={customerForm?.remark || ''}
                  onChange={(e) => setCustomerForm(prev => ({ ...prev, remark: e.target.value }))}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                  data-reticle-target="checkout-input-remark"
                ></textarea>
                <p className="text-[10px] text-gray-500 font-medium mt-0.5">
                  💡 This remark will be attached to your order for the seller/admin to view in Admin Panel.
                </p>
              </div>

              <div className="flex gap-3 pt-3 border-t">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl border cursor-pointer"
                  data-reticle-target="checkout-cancel-btn"
                >
                  Cancel
                </button>

                <button 
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  data-reticle-target="checkout-submit-btn"
                >
                  {isSubmittingOrder ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      <span>{checkoutData.paymentMode === 'COD' ? 'Placing Order...' : 'Connecting to Razorpay...'}</span>
                    </span>
                  ) : (
                    <>
                      <span>
                        {checkoutData.paymentMode === 'COD' ? 'Confirm & Place COD Order' : 'Proceed to Pay with Razorpay'} ({currencySymbol}{checkoutData.paymentMode === 'PARTIAL' ? checkoutData.depositAmount : checkoutData.finalTotal})
                      </span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER SUCCESS CONFIRMATION MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-fade-in" data-reticle-target="order-success-modal">
          <div className="relative bg-slate-900 border border-emerald-500/30 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl shadow-emerald-950/80 animate-pop-bounce overflow-hidden">
            
            {/* FLOATING CELEBRATORY SPARKLES & CONFETTI */}
            <div className="absolute top-3 left-4 text-xl animate-float-particle">✨</div>
            <div className="absolute top-6 right-6 text-xl animate-float-particle" style={{ animationDelay: '0.6s' }}>🎉</div>
            <div className="absolute bottom-6 left-6 text-lg animate-float-particle" style={{ animationDelay: '1.2s' }}>📦</div>
            <div className="absolute bottom-4 right-5 text-xl animate-float-particle" style={{ animationDelay: '1.8s' }}>🌱</div>

            {/* GLOWING DOUBLE-RING CHECKMARK AVATAR */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-18 h-18 bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 rounded-full flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-500/50">
                ✓
              </div>
            </div>

            {/* HEADER BADGE & ORDER TITLE */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                <Sparkles size={14} className="text-amber-400 animate-pulse" />
                <span>ORDER PLACED SUCCESSFULLY!</span>
              </div>
              <h3 className="font-extrabold text-2xl sm:text-3xl text-white font-['Outfit'] tracking-tight">
                {orderSuccess.order_number || orderSuccess.orderNumber || '#OB-88219'}
              </h3>
            </div>

            {/* CALIBRATED ORDER BREAKDOWN CARD */}
            <div className="bg-slate-850/90 rounded-2xl p-4 border border-slate-700/80 space-y-3 text-xs text-left shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium">Estimated Delivery:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  🚚 2-3 Business Days
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
                <span className="text-slate-400 font-medium">Payment Mode:</span>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-mono font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                  {orderSuccess.payment_mode || 'Partial COD (20% Paid)'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-300 font-extrabold text-sm">Order Total:</span>
                <span className="text-white font-black text-base font-['Outfit']">
                  {currencySymbol} {orderSuccess.total_amount || orderSuccess.totalAmount || '499.00'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Thank you for shopping with ValueLife Essentials (valuelifeessentials.com)! Your order confirmation has been registered and is being processed for express home delivery.
            </p>

            {/* DUAL ACTION BUTTONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => { 
                  setOrderSuccess(null); 
                  onClose(); 
                  navigateTo('/account', { view: 'account', slug: null, category: null, collection: null }); 
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                data-reticle-target="order-success-view-orders"
              >
                <span>📦 View My Orders</span>
              </button>
              <button 
                onClick={() => { 
                  setOrderSuccess(null); 
                  onClose(); 
                  navigateTo('/products', { view: 'all_products', slug: null, category: null, collection: null }); 
                }}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-950/80 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
                data-reticle-target="order-success-continue-shopping"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

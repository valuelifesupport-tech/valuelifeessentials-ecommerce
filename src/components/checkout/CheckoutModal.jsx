import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CheckoutModal({
  isOpen,
  onClose,
  checkoutData,
  cart = [],
  currencySymbol = '₹',
  customerForm,
  setCustomerForm,
  handleOrderSubmit,
  isSubmittingOrder,
  selectedPaymentGateway,
  setSelectedPaymentGateway,
  orderSuccess,
  setOrderSuccess,
  navigateTo
}) {
  if (!isOpen && !orderSuccess) return null;

  return (
    <>
      {/* CHECKOUT MODAL */}
      {isOpen && checkoutData && !orderSuccess && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-[9999]" data-reticle-target="checkout-modal-backdrop">
          <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto relative" data-reticle-target="checkout-modal-dialog">
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

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-gray-700 pb-1 border-b border-emerald-200/60">
                <span>Items Subtotal ({cart.length} items):</span>
                <span>{currencySymbol}{checkoutData.rawSubtotal || checkoutData.finalTotal}</span>
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

              {/* PAYMENT GATEWAY SELECTION FOR ONLINE PAYMENTS */}
              {checkoutData.paymentMode !== 'COD' && (
                <div className="pt-2 border-t border-emerald-300/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                      <span>⚡</span> Gateway Provider:
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">
                      {selectedPaymentGateway} (Test Mode)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'razorpay', label: 'Razorpay', badge: 'Active' },
                      { id: 'phonepe', label: 'PhonePe', badge: 'Ready' },
                      { id: 'paytm', label: 'Paytm', badge: 'Ready' }
                    ].map(gw => (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => setSelectedPaymentGateway(gw.id)}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                          selectedPaymentGateway === gw.id
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm ring-1 ring-emerald-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50'
                        }`}
                        data-reticle-target={`checkout-gw-${gw.id}`}
                      >
                        <div className="font-extrabold text-[11px] leading-tight">{gw.label}</div>
                        <div className={`text-[8px] font-bold ${selectedPaymentGateway === gw.id ? 'text-emerald-200' : 'text-gray-400'}`}>{gw.badge}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs" data-reticle-target="checkout-form">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" required placeholder="e.g. Rajesh Gupta"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none"
                  data-reticle-target="checkout-input-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Phone Number * (Mandatory)</label>
                  <input 
                    type="tel" required placeholder="e.g. +91 98123 45678"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none"
                    data-reticle-target="checkout-input-phone"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                  <input 
                    type="email" placeholder="e.g. rajesh@gmail.com (Optional)"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none"
                    data-reticle-target="checkout-input-email"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Shipping Home Address *</label>
                <textarea 
                  rows={2} required placeholder="Flat No., Street, Area, City, Pincode"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium focus:border-emerald-600 focus:outline-none text-xs"
                  data-reticle-target="checkout-input-address"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <span>📝 Order Remark & Special Instructions (Optional)</span>
                </label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Please call before delivery, leave with security guard, pack in eco-friendly box..."
                  value={customerForm.remark || ''}
                  onChange={(e) => setCustomerForm({ ...customerForm, remark: e.target.value })}
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
                  className="flex-1 bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-50 text-white font-extrabold py-3 rounded-xl shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  data-reticle-target="checkout-submit-btn"
                >
                  {isSubmittingOrder ? (
                    <span>Placing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order ({currencySymbol}{checkoutData.paymentMode === 'PARTIAL' ? checkoutData.depositAmount : checkoutData.finalTotal})</span>
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

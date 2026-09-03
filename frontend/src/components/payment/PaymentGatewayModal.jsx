import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CheckCircle, AlertCircle, X, CreditCard, 
  Smartphone, Building2, Wallet, ArrowRight, RefreshCw, Lock
} from 'lucide-react';

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  orderData,
  payableAmount = 0,
  currency = 'INR',
  currencySymbol = '₹',
  customerInfo = {},
  activeGateway = 'razorpay',
  availableGateways = [],
  onPaymentSuccess,
  onPaymentFailure
}) {
  const [selectedGateway, setSelectedGateway] = useState(activeGateway || 'razorpay');
  const [selectedMethod, setSelectedMethod] = useState('UPI'); // 'UPI', 'CARD', 'NETBANKING', 'WALLET'
  const [upiId, setUpiId] = useState(customerInfo?.phone ? `${customerInfo.phone}@upi` : 'valuelife@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  
  // Card Form State
  const [cardForm, setCardForm] = useState({
    number: '4111 2222 3333 4444',
    expiry: '12/28',
    cvv: '888',
    name: customerInfo?.name || 'Authorized Buyer'
  });

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState(''); // 'authorizing', 'verifying', 'success', 'failed'

  useEffect(() => {
    if (activeGateway) setSelectedGateway(activeGateway);
  }, [activeGateway]);

  if (!isOpen) return null;

  const orderNum = orderData?.orderNumber || orderData?.order_number || `OB-${Date.now().toString().slice(-5)}`;
  const displayAmount = Number(payableAmount || orderData?.paidAmount || orderData?.paid_amount || orderData?.total_amount || 0);

  const handleSimulatePayment = async (forceSuccess = true) => {
    setIsProcessing(true);
    setProcessStatus('authorizing');

    setTimeout(async () => {
      if (!forceSuccess) {
        setProcessStatus('failed');
        setIsProcessing(false);
        if (onPaymentFailure) {
          onPaymentFailure({ error: 'Payment declined by test bank simulator' });
        }
        return;
      }

      setProcessStatus('verifying');
      const timestamp = Date.now();
      const dummyPaymentId = `pay_test_${selectedGateway}_${timestamp}`;
      const dummyOrderId = orderData?.gateway_order_id || `order_test_${timestamp}`;
      const dummySignature = `sig_test_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;

      setTimeout(() => {
        setIsProcessing(false);
        setProcessStatus('success');

        if (onPaymentSuccess) {
          onPaymentSuccess({
            gateway: selectedGateway,
            razorpay_payment_id: dummyPaymentId,
            razorpay_order_id: dummyOrderId,
            razorpay_signature: dummySignature,
            payment_id: dummyPaymentId,
            transaction_id: dummyPaymentId,
            order_id: orderData?.orderId || orderData?.order_id
          });
        }
      }, 700);
    }, 900);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[99999] animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]">
        
        {/* GATEWAY TOP BRAND HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0c2340] to-[#0284c7] text-white p-5 relative">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all disabled:opacity-30"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 font-black text-lg shadow-inner">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight font-['Outfit']">
                  {selectedGateway === 'razorpay' ? 'Razorpay Secure Checkout' :
                   selectedGateway === 'phonepe' ? 'PhonePe Payment Gateway' :
                   selectedGateway === 'cashfree' ? 'Cashfree Payments' :
                   selectedGateway === 'paytm' ? 'Paytm Gateway' : 'ValueLife Secure Payment'}
                </h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  TEST / SANDBOX
                </span>
              </div>
              <p className="text-[11px] text-blue-100/70 flex items-center gap-1 mt-0.5">
                <Lock size={10} /> 256-Bit SSL Encrypted • Test Gateway Simulator
              </p>
            </div>
          </div>

          {/* ORDER AMOUNT SUMMARY STRIP */}
          <div className="mt-4 p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Order Reference</span>
              <span className="font-mono text-xs font-bold text-white">{orderNum}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Payable Amount</span>
              <span className="font-black text-xl text-emerald-300 font-['Outfit']">
                {currencySymbol}{displayAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* EXTENSIBLE GATEWAY SWITCHER (WHEN MULTIPLE GATEWAYS ENABLED) */}
        {availableGateways && availableGateways.length > 1 && (
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[10px] font-extrabold uppercase text-gray-500 shrink-0">Gateway:</span>
            {availableGateways.map(gw => (
              <button
                key={gw.id}
                type="button"
                onClick={() => setSelectedGateway(gw.id)}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  selectedGateway === gw.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {gw.name}
              </button>
            ))}
          </div>
        )}

        {/* PAYMENT METHODS TAB BAR */}
        <div className="grid grid-cols-4 border-b border-gray-200 text-xs font-bold text-gray-600 bg-gray-50/50">
          <button 
            type="button"
            onClick={() => setSelectedMethod('UPI')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
              selectedMethod === 'UPI' 
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold' 
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Smartphone size={16} />
            <span className="text-[11px]">UPI / QR</span>
          </button>

          <button 
            type="button"
            onClick={() => setSelectedMethod('CARD')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
              selectedMethod === 'CARD' 
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold' 
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <CreditCard size={16} />
            <span className="text-[11px]">Cards</span>
          </button>

          <button 
            type="button"
            onClick={() => setSelectedMethod('NETBANKING')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
              selectedMethod === 'NETBANKING' 
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold' 
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Building2 size={16} />
            <span className="text-[11px]">Netbanking</span>
          </button>

          <button 
            type="button"
            onClick={() => setSelectedMethod('WALLET')}
            className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
              selectedMethod === 'WALLET' 
                ? 'border-blue-600 text-blue-600 bg-white font-extrabold' 
                : 'border-transparent hover:text-gray-900'
            }`}
          >
            <Wallet size={16} />
            <span className="text-[11px]">Wallets</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* 1. UPI / QR TAB */}
          {selectedMethod === 'UPI' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gpay', name: 'Google Pay', icon: '🟢 GPay' },
                  { id: 'phonepe', name: 'PhonePe', icon: '🟣 PhonePe' },
                  { id: 'paytm', name: 'Paytm UPI', icon: '🔵 Paytm' },
                  { id: 'bhim', name: 'BHIM UPI', icon: '🟠 BHIM' }
                ].map(app => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedUpiApp(app.id)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedUpiApp === app.id
                        ? 'border-blue-600 bg-blue-50/80 font-black text-blue-900 shadow-sm ring-1 ring-blue-500'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="block font-bold text-[11px]">{app.icon}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Enter Virtual Payment Address (VPA / UPI ID)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="mobile@upi or username@okhdfcbank"
                    className="flex-1 p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                  <button 
                    type="button"
                    onClick={() => setUpiId('success@razorpay')}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-[11px] cursor-pointer"
                  >
                    Use Sample VPA
                  </button>
                </div>
              </div>

              {/* SIMULATED QR CODE SECTION */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl border border-blue-200/80 flex items-center gap-3">
                <div className="w-16 h-16 bg-white rounded-xl border border-gray-300 p-1 flex items-center justify-center font-mono text-[9px] text-center shadow-sm shrink-0">
                  <div className="space-y-0.5">
                    <span className="block font-black text-xs text-blue-900">QR SCAN</span>
                    <span className="block text-[8px] text-emerald-600 font-bold">READY</span>
                  </div>
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="font-extrabold text-xs text-gray-900">Scan & Pay using any UPI App</h4>
                  <p className="text-[10px] text-gray-600 leading-tight">
                    Open Google Pay, PhonePe, Paytm or BHIM on your smartphone to scan and approve.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. CARDS TAB */}
          {selectedMethod === 'CARD' && (
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-1">
                <span className="font-bold text-gray-700">Enter Card Details</span>
                <button 
                  type="button"
                  onClick={() => setCardForm({ number: '4111 2222 3333 4444', expiry: '12/28', cvv: '999', name: 'Authorized Test User' })}
                  className="text-[10px] font-black text-blue-600 hover:underline cursor-pointer"
                >
                  ⚡ Fill Sample Test Card
                </button>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">Card Number</label>
                <input 
                  type="text" 
                  value={cardForm.number}
                  onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                  placeholder="4111 2222 3333 4444"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">Expiry Date (MM/YY)</label>
                  <input 
                    type="text" 
                    value={cardForm.expiry}
                    onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                    placeholder="12/28"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">CVV / CVC</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    value={cardForm.cvv}
                    onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                    placeholder="888"
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">Cardholder Name</label>
                <input 
                  type="text" 
                  value={cardForm.name}
                  onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  placeholder="Cardholder Name"
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* 3. NETBANKING TAB */}
          {selectedMethod === 'NETBANKING' && (
            <div className="space-y-3 text-xs">
              <span className="font-bold text-gray-700 block mb-1">Select Bank</span>
              <div className="grid grid-cols-3 gap-2">
                {['HDFC', 'ICICI', 'SBI', 'Axis Bank', 'Kotak', 'PNB'].map(bank => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer font-bold ${
                      selectedBank === bank
                        ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-500'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    🏛️ {bank}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-500 pt-1">
                You will be redirected to {selectedBank} secure test banking portal for OTP authorization.
              </p>
            </div>
          )}

          {/* 4. WALLETS TAB */}
          {selectedMethod === 'WALLET' && (
            <div className="space-y-2 text-xs">
              <span className="font-bold text-gray-700 block mb-1">Select Digital Wallet</span>
              <div className="space-y-2">
                {[
                  { name: 'Paytm Wallet', balance: '₹1,500.00' },
                  { name: 'PhonePe Wallet', balance: '₹850.00' },
                  { name: 'Amazon Pay Balance', balance: '₹2,400.00' },
                  { name: 'MobiKwik', balance: '₹400.00' }
                ].map(w => (
                  <div 
                    key={w.name}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between hover:bg-blue-50/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>👛</span>
                      <span className="font-bold text-gray-900">{w.name}</span>
                    </div>
                    <span className="text-emerald-700 font-mono font-bold text-[11px]">{w.balance}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS & SIMULATION BUTTONS */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2.5">
          {isProcessing ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center space-y-1.5 animate-pulse">
              <RefreshCw className="animate-spin text-blue-600 mx-auto" size={20} />
              <p className="font-extrabold text-xs text-blue-900">
                {processStatus === 'authorizing' ? 'Contacting Payment Gateway Simulator...' :
                 processStatus === 'verifying' ? 'Verifying HMAC Signature & Updating Order...' :
                 'Confirming transaction...'}
              </p>
              <p className="text-[10px] text-blue-700">Please do not refresh or press back button</p>
            </div>
          ) : (
            <>
              {/* PRIMARY PAY NOW BUTTON (SIMULATE SUCCESS) */}
              <button
                type="button"
                onClick={() => handleSimulatePayment(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-[#2d6a4f] hover:from-emerald-500 hover:to-[#1b4332] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-950/20 text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <ShieldCheck size={18} />
                <span>Pay {currencySymbol}{displayAmount.toFixed(2)} with {selectedGateway.toUpperCase()}</span>
                <ArrowRight size={16} />
              </button>

              {/* DUAL SECONDARY ACTIONS: SIMULATE FAILURE & CANCEL */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulatePayment(false)}
                  className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-[11px] cursor-pointer transition-colors"
                  title="Test how your system handles bank failure"
                >
                  ⚠️ Simulate Failed Payment
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-bold text-[11px] cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1 pt-1">
            <span>🛡️</span> Encrypted & Verified by ValueLife Essentials Multi-Gateway Engine
          </p>
        </div>

      </div>
    </div>
  );
}

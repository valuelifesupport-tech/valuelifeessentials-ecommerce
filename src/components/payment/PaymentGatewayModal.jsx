import React, { useState, useEffect } from 'react';
import { Smartphone, CreditCard, Building2, Wallet } from 'lucide-react';
import PaymentGatewayHeader from './modal/PaymentGatewayHeader';
import UpiPaymentTab from './modal/UpiPaymentTab';
import CardPaymentTab from './modal/CardPaymentTab';
import NetbankingTab from './modal/NetbankingTab';
import WalletsTab from './modal/WalletsTab';
import PaymentSimulatorFooter from './modal/PaymentSimulatorFooter';

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
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[99999] animate-fade-in" data-reticle-target="payment-gateway-modal">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]">
        
        {/* GATEWAY TOP BRAND HEADER */}
        <PaymentGatewayHeader
          selectedGateway={selectedGateway}
          orderNum={orderNum}
          displayAmount={displayAmount}
          currencySymbol={currencySymbol}
          isProcessing={isProcessing}
          onClose={onClose}
        />

        {/* EXTENSIBLE GATEWAY SWITCHER */}
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
                data-reticle-target={`gateway-btn-${gw.id}`}
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
            data-reticle-target="method-upi-btn"
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
            data-reticle-target="method-card-btn"
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
            data-reticle-target="method-netbanking-btn"
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
            data-reticle-target="method-wallet-btn"
          >
            <Wallet size={16} />
            <span className="text-[11px]">Wallets</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {selectedMethod === 'UPI' && (
            <UpiPaymentTab
              selectedUpiApp={selectedUpiApp}
              setSelectedUpiApp={setSelectedUpiApp}
              upiId={upiId}
              setUpiId={setUpiId}
            />
          )}

          {selectedMethod === 'CARD' && (
            <CardPaymentTab
              cardForm={cardForm}
              setCardForm={setCardForm}
            />
          )}

          {selectedMethod === 'NETBANKING' && (
            <NetbankingTab
              selectedBank={selectedBank}
              setSelectedBank={setSelectedBank}
            />
          )}

          {selectedMethod === 'WALLET' && (
            <WalletsTab />
          )}
        </div>

        {/* FOOTER ACTIONS & SIMULATION BUTTONS */}
        <PaymentSimulatorFooter
          isProcessing={isProcessing}
          processStatus={processStatus}
          displayAmount={displayAmount}
          currencySymbol={currencySymbol}
          selectedGateway={selectedGateway}
          onSimulatePayment={handleSimulatePayment}
          onClose={onClose}
        />

      </div>
    </div>
  );
}

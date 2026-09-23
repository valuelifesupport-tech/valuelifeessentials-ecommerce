import React, { useState, useEffect } from 'react';
import { Smartphone, CreditCard, Building2, Wallet } from 'lucide-react';
import PaymentGatewayHeader from './modal/PaymentGatewayHeader';
import UpiPaymentTab from './modal/UpiPaymentTab';
import CardPaymentTab from './modal/CardPaymentTab';
import NetbankingTab from './modal/NetbankingTab';
import WalletsTab from './modal/WalletsTab';
import PaymentSimulatorFooter from './modal/PaymentSimulatorFooter';
import { getApiUrl } from '../../api/config';

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayLiveCheckout = async () => {
    setIsProcessing(true);
    setProcessStatus('authorizing');
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Razorpay checkout script failed to load. Falling back to test simulator.');
      }

      // 1. Create order on backend (strictly validated with server pricing)
      const createRes = await fetch(getApiUrl('/api/payment/razorpay/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: displayAmount,
          currency,
          order_id: orderData?.orderId || orderData?.order_id || orderData?.id,
          receipt: `rcpt_${orderNum}`
        })
      });

      const rzpOrder = await createRes.json().catch(() => ({}));
      if (!createRes.ok || !rzpOrder?.id) {
        throw new Error(rzpOrder?.error || `Failed to initialize payment gateway (Status ${createRes.status})`);
      }

      const keyId = rzpOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: 'ValueLife Essentials',
        description: `Payment for Order #${orderNum}`,
        order_id: rzpOrder.id,
        prefill: {
          name: customerInfo?.name || orderData?.customer_name || '',
          email: customerInfo?.email || orderData?.customer_email || '',
          contact: customerInfo?.phone || orderData?.customer_phone || ''
        },
        theme: {
          color: '#164e3f'
        },
        handler: async function (response) {
          setIsProcessing(true);
          setProcessStatus('verifying');
          try {
            const verifyRes = await fetch(getApiUrl('/api/payment/razorpay/verify'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transaction_id: rzpOrder.transaction_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData?.orderId || orderData?.order_id || orderData?.id
              })
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData?.verified) {
              throw new Error(verifyData?.message || verifyData?.error || 'Payment signature verification failed');
            }

            setIsProcessing(false);
            setProcessStatus('success');

            if (onPaymentSuccess) {
              onPaymentSuccess({
                gateway: 'razorpay',
                transaction_id: rzpOrder.transaction_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                payment_id: response.razorpay_payment_id,
                order_id: orderData?.orderId || orderData?.order_id || orderData?.id
              });
            }
          } catch (verErr) {
            setIsProcessing(false);
            setProcessStatus('failed');
            if (onPaymentFailure) onPaymentFailure({ error: verErr.message });
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setProcessStatus('');
            // Log modal cancellation to database
            fetch(getApiUrl('/api/payment/razorpay/failure'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transaction_id: rzpOrder.transaction_id,
                gateway_order_id: rzpOrder.id,
                error_code: 'MODAL_DISMISSED',
                error_description: 'User dismissed Razorpay checkout window',
                order_id: orderData?.orderId || orderData?.order_id || orderData?.id
              })
            }).catch(() => {});
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        setIsProcessing(false);
        setProcessStatus('failed');

        // Log payment failure to database
        fetch(getApiUrl('/api/payment/razorpay/failure'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: rzpOrder.transaction_id,
            gateway_order_id: rzpOrder.id,
            gateway_payment_id: response.error?.metadata?.payment_id,
            error_code: response.error?.code || 'PAYMENT_FAILED',
            error_description: response.error?.description || 'Payment declined by gateway',
            order_id: orderData?.orderId || orderData?.order_id || orderData?.id
          })
        }).catch(() => {});

        if (onPaymentFailure) onPaymentFailure({ error: response.error?.description || 'Payment Failed' });
      });
      rzpInstance.open();
    } catch (err) {
      console.warn('Razorpay live checkout error, running simulator fallback:', err.message);
      handleSimulatePayment(true);
    }
  };

  const handlePayNow = async () => {
    if (selectedGateway === 'razorpay') {
      await handleRazorpayLiveCheckout();
    } else {
      await handleSimulatePayment(true);
    }
  };

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
            order_id: orderData?.orderId || orderData?.order_id || orderData?.id
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
          onPayNow={handlePayNow}
          onSimulatePayment={handleSimulatePayment}
          onClose={onClose}
        />

      </div>
    </div>
  );
}

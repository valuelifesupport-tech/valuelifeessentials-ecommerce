import { useState } from 'react';
import { getApiUrl } from '../api/config';

export function useCheckout({ currentUser, setCurrentUser, customerForm, setCustomerForm, cart, setCart, setIsCartOpen, setIsAuthOpen, currency, showToast }) {
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState('razorpay');
  const [availableGateways, setAvailableGateways] = useState(['razorpay']);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [paymentPayableAmount, setPaymentPayableAmount] = useState(0);

  const handleProceedToCheckout = (data) => {
    if (!currentUser) {
      showToast('info', 'Login Required', 'Please login to proceed with order placement.');
      setIsAuthOpen(true);
      return;
    }
    setCustomerForm(prev => ({
      name: currentUser.name || prev?.name || '',
      phone: currentUser.phone || prev?.phone || '',
      email: currentUser.email || prev?.email || '',
      address: currentUser.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
      remark: prev?.remark || ''
    }));
    setCheckoutData(data);
    setIsCartOpen(false);
    setShowCheckoutModal(true);
  };

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

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingOrder) return;
    if (!currentUser) {
      showToast('error', 'Login Required', 'Please sign in to place order.');
      setShowCheckoutModal(false);
      setIsAuthOpen(true);
      return;
    }

    const rawPhone = customerForm.phone || currentUser?.phone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    const streetAddr = (customerForm.street || customerForm.address || '').trim();
    const city = (customerForm.city || currentUser?.city || '').trim();
    const state = (customerForm.state || currentUser?.state || 'Maharashtra').trim();
    const pincode = String(customerForm.pincode || currentUser?.pincode || '').replace(/\D/g, '').slice(0, 6);

    if (!cleanPhone || cleanPhone.length !== 10) {
      showToast('error', '10-Digit Mobile Required', 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!streetAddr) {
      showToast('error', 'Address Required', 'Please enter your street / flat address.');
      return;
    }
    if (!city) {
      showToast('error', 'City Required', 'Please enter your delivery city.');
      return;
    }
    if (!pincode || pincode.length !== 6) {
      showToast('error', '6-Digit Pincode Required', 'Please enter a valid 6-digit delivery pincode.');
      return;
    }

    const formattedFullAddress = `${streetAddr}, ${city}, ${state} - ${pincode}`;

    setIsSubmittingOrder(true);
    try {
      const mode = checkoutData?.paymentMode || 'FULL';
      const isCOD = mode === 'COD';
      const isPartial = mode === 'PARTIAL';
      const totalAmount = Number(checkoutData?.finalTotal || 0);
      const depositAmount = isPartial 
        ? Number(checkoutData?.depositAmount || Math.round(totalAmount * 0.2)) 
        : totalAmount;
      const payableAmount = isCOD ? 0 : depositAmount;

      const orderRes = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          customer_name: (customerForm.name || currentUser.name || 'Customer').trim(),
          customer_email: customerForm.email || currentUser.email,
          customer_phone: cleanPhone,
          shipping_address: formattedFullAddress,
          shipping_city: city,
          shipping_state: state,
          shipping_pincode: pincode,
          state_name: state,
          order_notes: customerForm.remark || '',
          country: currency === 'INR' ? 'India' : 'International',
          currency,
          total_amount: totalAmount,
          paid_amount: 0,
          remaining_amount: totalAmount,
          payable_amount: payableAmount,
          payment_mode: mode,
          payment_gateway: 'razorpay',
          coupon_code: checkoutData?.appliedCoupon?.code || null,
          items: cart.map(i => ({ product_id: i.id, variant_id: i.variant_id, quantity: i.quantity, price: i.price }))
        })
      });

      const orderData = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok || !orderData?.order_id) {
        throw new Error(orderData.error || `Failed to create order (Server returned status ${orderRes.status})`);
      }

      try { localStorage.setItem('user_last_shipping_address', streetAddr); } catch (e) {}
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: (customerForm.name || currentUser.name || '').trim(),
          phone: cleanPhone,
          address: streetAddr,
          city,
          state,
          pincode
        };
        setCurrentUser(updatedUser);
        try { localStorage.setItem('customerUser', JSON.stringify(updatedUser)); } catch (e) {}
      }

      if (isCOD) {
        setShowCheckoutModal(false);
        setOrderSuccess(orderData);
        setCart([]);
        showToast('success', 'Order Confirmed!', `COD Order #${orderData.order_number || orderData.orderNumber} placed successfully!`);
        setIsSubmittingOrder(false);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window.Razorpay !== 'function') {
        throw new Error('Razorpay checkout SDK failed to load. Please check your internet connection.');
      }

      const rzpRes = await fetch(getApiUrl('/api/payment/razorpay/create-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: payableAmount,
          currency,
          order_id: orderData.order_id,
          receipt: `rcpt_${orderData.order_number || orderData.orderNumber}`
        })
      });

      const rzpOrder = await rzpRes.json().catch(() => ({}));
      if (!rzpRes.ok || !rzpOrder?.id) {
        throw new Error(rzpOrder?.error || 'Failed to initialize payment gateway.');
      }

      const keyId = rzpOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TcG0EYPMH8tl5L';

      const options = {
        key: keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: 'ValueLife Essentials',
        description: `Order #${orderData.order_number || orderData.orderNumber} (${isPartial ? 'Partial 20% Deposit' : 'Prepaid Full'})`,
        order_id: rzpOrder.id,
        prefill: {
          name: customerForm.name || currentUser.name || '',
          email: customerForm.email || currentUser.email || '',
          contact: cleanPhone ? `+91${cleanPhone}` : ''
        },
        theme: {
          color: '#164e3f'
        },
        handler: async function (response) {
          try {
            setIsSubmittingOrder(true);
            const verifyRes = await fetch(getApiUrl('/api/payment/razorpay/verify'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transaction_id: rzpOrder.transaction_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.order_id,
                email: customerForm.email || currentUser.email
              })
            });

            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData?.verified) {
              throw new Error(verifyData?.message || 'Payment signature verification failed.');
            }

            setShowCheckoutModal(false);
            setOrderSuccess(verifyData.order || orderData);
            setCart([]);
            showToast('success', 'Payment Successful!', `Order #${orderData.order_number || orderData.orderNumber} confirmed! Confirmation email dispatched.`);
          } catch (verErr) {
            showToast('error', 'Payment Verification Error', verErr.message);
          } finally {
            setIsSubmittingOrder(false);
          }
        },
        modal: {
          ondismiss: async function () {
            setIsSubmittingOrder(false);
            try {
              await fetch(getApiUrl('/api/payment/razorpay/failure'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transaction_id: rzpOrder.transaction_id,
                  gateway_order_id: rzpOrder.id,
                  error_code: 'MODAL_DISMISSED',
                  error_description: 'Payment checkout window closed before completion',
                  order_id: orderData.order_id
                })
              });
            } catch (e) {}

            showToast('info', 'Payment Cancelled', 'Payment window was closed. Your order was not placed and no amount was charged. Cancellation email dispatched.');
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', async function (response) {
        setIsSubmittingOrder(false);
        try {
          await fetch(getApiUrl('/api/payment/razorpay/failure'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transaction_id: rzpOrder.transaction_id,
              gateway_order_id: rzpOrder.id,
              gateway_payment_id: response.error?.metadata?.payment_id,
              error_code: response.error?.code || 'PAYMENT_FAILED',
              error_description: response.error?.description || 'Payment declined by bank',
              order_id: orderData.order_id
            })
          });
        } catch (e) {}

        showToast('error', 'Payment Failed', response.error?.description || 'Payment was declined by your bank.');
      });

      rzpInstance.open();

    } catch (err) {
      showToast('error', 'Checkout Error', err.message);
      setIsSubmittingOrder(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    setShowPaymentModal(false);
    setOrderSuccess(pendingPaymentOrder);
    setCart([]);
    showToast('success', 'Payment Received!', 'Order successfully paid and confirmed.');
  };

  return {
    showCheckoutModal,
    setShowCheckoutModal,
    checkoutData,
    isSubmittingOrder,
    orderSuccess,
    setOrderSuccess,
    selectedPaymentGateway,
    setSelectedPaymentGateway,
    availableGateways,
    showPaymentModal,
    setShowPaymentModal,
    pendingPaymentOrder,
    paymentPayableAmount,
    handleProceedToCheckout,
    handleOrderSubmit,
    handlePaymentSuccess
  };
}

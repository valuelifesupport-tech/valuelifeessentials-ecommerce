import React, { createContext, useContext, useState, useCallback } from 'react';
import { getApiUrl } from '../config/env';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useShop } from './ShopContext';
import { loadRazorpayScript } from '../utils/razorpay';

const CheckoutContext = createContext(null);

export function CheckoutProvider({ children }) {
  const { showToast } = useToast();
  const { currentUser, customerForm, setCustomerForm, openAuthModal, updateUser } = useAuth();
  const { cart, clearCart } = useCart();
  const { currency } = useShop();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState('razorpay');
  const [availableGateways] = useState(['razorpay']);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);
  const [paymentPayableAmount, setPaymentPayableAmount] = useState(0);

  const proceedToCheckout = useCallback((data) => {
    if (!currentUser) {
      showToast('info', 'Login Required', 'Please login to proceed with order placement.');
      openAuthModal();
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
    setShowCheckoutModal(true);
  }, [currentUser, openAuthModal, setCustomerForm, showToast]);

  const submitOrder = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (isSubmittingOrder) return;

    if (!currentUser) {
      showToast('error', 'Login Required', 'Please sign in to place order.');
      setShowCheckoutModal(false);
      openAuthModal();
      return;
    }

    const finalPhone = currentUser?.phone || customerForm.phone;
    if (!finalPhone || !customerForm.address) {
      showToast('error', 'Required Fields', 'Phone number and shipping address are required.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const isOnlinePay = checkoutData?.paymentMode === 'PREPAID' || checkoutData?.paymentMode === 'PARTIAL' || checkoutData?.paymentMode === 'FULL';
      const payableAmount = checkoutData?.paymentMode === 'PARTIAL' ? checkoutData?.depositAmount : checkoutData?.finalTotal;

      const token = currentUser?.token || localStorage.getItem('customer_token');
      const orderRes = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          customer_name: currentUser.name || customerForm.name || 'Customer',
          customer_email: currentUser.email || customerForm.email,
          customer_phone: finalPhone,
          shipping_address: customerForm.address,
          order_notes: customerForm.remark || '',
          country: currency === 'INR' ? 'India' : 'International',
          currency,
          total_amount: checkoutData?.finalTotal || 0,
          paid_amount: isOnlinePay ? payableAmount : 0,
          remaining_amount: isOnlinePay ? Math.max(0, (checkoutData?.finalTotal || 0) - payableAmount) : (checkoutData?.finalTotal || 0),
          payment_mode: checkoutData?.paymentMode || 'COD',
          payment_gateway: isOnlinePay ? 'razorpay' : 'cod',
          coupon_code: checkoutData?.appliedCoupon?.code || null,
          coupon_discount: checkoutData?.discountAmount || 0,
          shipping_amount: checkoutData?.shippingAmount || 0,
          items: cart.map(i => ({ product_id: i.id, variant_id: i.variant_id, quantity: i.quantity, price: i.price }))
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order');

      if (customerForm.address) {
        try { localStorage.setItem('user_last_shipping_address', customerForm.address); } catch (e) {}
      }

      if (currentUser && customerForm.address) {
        updateUser({
          name: customerForm.name || currentUser.name,
          phone: finalPhone,
          address: customerForm.address
        });
      }

      const orderNum = orderData.order_number || orderData.orderNumber || orderData.order_id || orderData.id;

      // CASH ON DELIVERY (COD) OR NON-INR ORDERS -> Directly Confirm
      if (!isOnlinePay || currency !== 'INR') {
        setShowCheckoutModal(false);
        setOrderSuccess(orderData);
        clearCart();
        showToast('success', 'Order Confirmed!', `Order #${orderNum} confirmed!`);
        setIsSubmittingOrder(false);
        return;
      }

      // DIRECT ONLINE PAYMENT (RAZORPAY) -> Open Razorpay Standard Checkout Directly
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || typeof window.Razorpay === 'undefined') {
        throw new Error('Payment gateway script failed to initialize. Please check your internet connection.');
      }

      // Initialize Razorpay order on server
      const createRes = await fetch(getApiUrl('/api/payment/razorpay/create-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          amount: payableAmount,
          currency,
          order_id: orderData.order_id || orderData.id,
          receipt: `rcpt_${orderNum}`,
          customer_name: currentUser?.name || customerForm.name,
          customer_email: currentUser?.email || customerForm.email,
          customer_phone: finalPhone
        })
      });

      const rzpOrder = await createRes.json();
      if (!createRes.ok || !rzpOrder.id) {
        throw new Error(rzpOrder.error || 'Failed to initialize payment gateway.');
      }

      const keyId = rzpOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_Tf0pnP0D2dQz4M';

      const options = {
        key: keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || 'INR',
        name: 'ValueLife Essentials',
        description: `Payment for Order #${orderNum}`,
        order_id: rzpOrder.id,
        prefill: {
          name: currentUser?.name || customerForm.name || '',
          email: currentUser?.email || customerForm.email || '',
          contact: finalPhone || ''
        },
        theme: {
          color: '#2d6a4f'
        },
        handler: async function (response) {
          try {
            const verifyToken = currentUser?.token || localStorage.getItem('customer_token');
            const verifyRes = await fetch(getApiUrl('/api/payment/razorpay/verify'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(verifyToken ? { 'Authorization': `Bearer ${verifyToken}` } : {})
              },
              body: JSON.stringify({
                transaction_id: rzpOrder.transaction_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.order_id || orderData.id,
                customer_email: currentUser?.email || customerForm.email,
                user_id: currentUser?.id
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(verifyData.message || 'Payment signature verification failed.');
            }

            setShowCheckoutModal(false);
            setOrderSuccess(verifyData.order || { ...orderData, payment_status: 'PAID', paid_amount: payableAmount });
            clearCart();
            showToast('success', 'Payment Successful!', `Order #${orderNum} confirmed successfully!`);
          } catch (verErr) {
            showToast('error', 'Payment Verification Failed', verErr.message || 'Could not verify payment.');
          } finally {
            setIsSubmittingOrder(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmittingOrder(false);
            showToast('info', 'Payment Incomplete', 'Payment window was closed. Your order was saved.');
            fetch(getApiUrl('/api/payment/razorpay/failure'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                transaction_id: rzpOrder.transaction_id,
                gateway_order_id: rzpOrder.id,
                error_code: 'MODAL_DISMISSED',
                error_description: 'User dismissed Razorpay checkout window',
                order_id: orderData.order_id || orderData.id
              })
            }).catch(() => {});
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (res) {
        setIsSubmittingOrder(false);
        showToast('error', 'Payment Failed', res?.error?.description || 'Payment was declined.');
        fetch(getApiUrl('/api/payment/razorpay/failure'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaction_id: rzpOrder.transaction_id,
            gateway_order_id: rzpOrder.id,
            gateway_payment_id: res.error?.metadata?.payment_id,
            error_code: res.error?.code || 'PAYMENT_FAILED',
            error_description: res.error?.description || 'Payment declined by gateway',
            order_id: orderData.order_id || orderData.id
          })
        }).catch(() => {});
      });

      // Close checkout modal immediately and open direct Razorpay popup
      setShowCheckoutModal(false);
      rzpInstance.open();
      setIsSubmittingOrder(false);
    } catch (err) {
      showToast('error', 'Order Error', err.message);
      setIsSubmittingOrder(false);
    }
  }, [isSubmittingOrder, currentUser, customerForm, checkoutData, currency, cart, updateUser, clearCart, showToast, openAuthModal]);

  const handlePaymentSuccess = useCallback((paymentResult) => {
    setShowPaymentModal(false);
    setOrderSuccess(pendingPaymentOrder);
    clearCart();
    showToast('success', 'Payment Received!', 'Order successfully paid and confirmed.');
  }, [pendingPaymentOrder, clearCart, showToast]);

  const handlePaymentFailure = useCallback((err) => {
    showToast('error', 'Payment Failed', err?.error || 'Payment declined.');
  }, [showToast]);

  return (
    <CheckoutContext.Provider
      value={{
        showCheckoutModal,
        setShowCheckoutModal,
        checkoutData,
        setCheckoutData,
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
        proceedToCheckout,
        submitOrder,
        handlePaymentSuccess,
        handlePaymentFailure
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return ctx;
}

export default CheckoutContext;

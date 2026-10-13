import React, { createContext, useContext, useState, useCallback } from 'react';
import { getApiUrl } from '../config/env';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useShop } from './ShopContext';

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
  const [availableGateways] = useState(['razorpay', 'phonepe', 'cod']);
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

      const orderRes = await fetch(getApiUrl('/api/orders'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
          payment_gateway: selectedPaymentGateway,
          coupon_code: checkoutData?.appliedCoupon?.code || null,
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

      if (!isOnlinePay || currency !== 'INR') {
        setShowCheckoutModal(false);
        setOrderSuccess(orderData);
        clearCart();
        showToast('success', 'Order Confirmed!', `Order #${orderData.orderNumber || orderData.order_number} confirmed!`);
      } else {
        setShowCheckoutModal(false);
        setPendingPaymentOrder(orderData);
        setPaymentPayableAmount(payableAmount);
        setShowPaymentModal(true);
      }
    } catch (err) {
      showToast('error', 'Order Error', err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [isSubmittingOrder, currentUser, customerForm, checkoutData, currency, selectedPaymentGateway, cart, updateUser, clearCart, showToast, openAuthModal]);

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

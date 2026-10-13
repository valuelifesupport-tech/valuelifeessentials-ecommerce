import { apiClient } from './apiClient';

/**
 * Order & Checkout Data Service
 * Encapsulates order creation, payment initiation, coupon verification, and order tracking.
 */
export const orderService = {
  createOrder: (orderPayload) => {
    return apiClient('/api/orders', {
      method: 'POST',
      body: orderPayload
    });
  },

  getOrderById: (orderId) => {
    return apiClient(`/api/orders/${orderId}`);
  },

  getUserOrders: (userId) => {
    return apiClient(`/api/orders/user/${userId}`);
  },

  validateCoupon: (code, total) => {
    return apiClient('/api/coupons/validate', {
      method: 'POST',
      body: { code, total }
    });
  },

  createRazorpayOrder: (amount, currency = 'INR', receipt = '') => {
    return apiClient('/api/payment/razorpay/create-order', {
      method: 'POST',
      body: { amount, currency, receipt }
    });
  },

  verifyRazorpayPayment: (paymentData) => {
    return apiClient('/api/payment/razorpay/verify', {
      method: 'POST',
      body: paymentData
    });
  }
};

export default orderService;

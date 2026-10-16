/**
 * Helper to dynamically load the Razorpay checkout.js script
 * Ensures Razorpay SDK is available before triggering checkout
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      return resolve(true);
    }
    if (typeof document === 'undefined') {
      return resolve(false);
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      if (window.Razorpay) return resolve(true);
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

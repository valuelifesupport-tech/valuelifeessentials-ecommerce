import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastNotification from '../components/common/ToastNotification';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, title, message) => {
    setToast({ type, title, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toast }}>
      {children}
      <ToastNotification toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Return safe fallback so components can call showToast even if outside provider
    return {
      showToast: (type, title, message) => console.log(`[Toast ${type}] ${title}: ${message}`),
      hideToast: () => {},
      toast: null
    };
  }
  return ctx;
}

export default ToastContext;

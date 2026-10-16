import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/env';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('customerUser'));
      const token = localStorage.getItem('customer_token');
      if (u) {
        return { ...u, token: u.token || token || null };
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [customerForm, setCustomerForm] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('customerUser'));
      const savedAddr = localStorage.getItem('user_last_shipping_address') || '';
      return {
        name: u?.name || '',
        phone: u?.phone || '',
        email: u?.email || '',
        address: u?.address || savedAddr || '',
        remark: ''
      };
    } catch (e) {
      return { name: '', phone: '', email: '', address: '', remark: '' };
    }
  });

  // Sync customerForm whenever currentUser updates and acquire token if missing
  useEffect(() => {
    if (currentUser) {
      setCustomerForm(prev => ({
        name: currentUser.name || prev?.name || '',
        phone: currentUser.phone || prev?.phone || '',
        email: currentUser.email || prev?.email || '',
        address: currentUser.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
        remark: prev?.remark || ''
      }));

      // Fetch user profile and session token if missing
      const needsTokenFetch = !currentUser.token;
      const needsProfileFetch = currentUser.email && (!currentUser.phone || !currentUser.address || !currentUser.city || !currentUser.pincode);

      if (needsTokenFetch || needsProfileFetch) {
        fetch(getApiUrl('/api/auth/token'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUser.id, email: currentUser.email, phone: currentUser.phone })
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data && data.token) {
              const updated = {
                ...currentUser,
                token: data.token,
                name: data.user?.name || currentUser.name,
                phone: data.user?.phone || currentUser.phone,
                address: data.user?.address || currentUser.address,
                city: data.user?.city || currentUser.city,
                state: data.user?.state || currentUser.state,
                pincode: data.user?.pincode || currentUser.pincode,
                gstin_number: data.user?.gstin_number || currentUser.gstin_number,
                business_name: data.user?.business_name || currentUser.business_name
              };
              setCurrentUser(updated);
              try {
                localStorage.setItem('customerUser', JSON.stringify(updated));
                localStorage.setItem('customer_token', data.token);
              } catch (e) {}
              setCustomerForm(prev => ({
                name: updated.name || prev.name,
                phone: updated.phone || prev.phone,
                email: updated.email || prev.email,
                address: updated.address || prev.address,
                remark: prev.remark || ''
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [currentUser]);

  const login = useCallback((userData) => {
    const token = userData.token || localStorage.getItem('customer_token');
    const enriched = { ...userData, token: token || null };
    setCurrentUser(enriched);
    try {
      localStorage.setItem('customerUser', JSON.stringify(enriched));
      if (token) localStorage.setItem('customer_token', token);
    } catch (e) {}

    setCustomerForm(prev => ({
      name: userData.name || prev?.name || '',
      phone: userData.phone || prev?.phone || '',
      email: userData.email || prev?.email || '',
      address: userData.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
      remark: prev?.remark || ''
    }));

    setIsAuthOpen(false);
    showToast('success', 'Signed In', `Welcome back, ${userData.name || userData.phone || 'Customer'}!`);
  }, [showToast]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('customerUser');
      localStorage.removeItem('customer_token');
    } catch (e) {}
    setCustomerForm({ name: '', phone: '', email: '', address: '', remark: '' });
    showToast('info', 'Signed Out', 'You have been signed out.');
  }, [showToast]);

  const updateUser = useCallback((updatedData) => {
    setCurrentUser(prev => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem('customerUser', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  }, []);

  const openAuthModal = useCallback(() => setIsAuthOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthOpen(false), []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthOpen,
        setIsAuthOpen,
        customerForm,
        setCustomerForm,
        login,
        logout,
        updateUser,
        openAuthModal,
        closeAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export default AuthContext;

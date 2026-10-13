import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/env';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('customerUser')) || null;
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

  // Sync customerForm whenever currentUser updates
  useEffect(() => {
    if (currentUser) {
      setCustomerForm(prev => ({
        name: currentUser.name || prev?.name || '',
        phone: currentUser.phone || prev?.phone || '',
        email: currentUser.email || prev?.email || '',
        address: currentUser.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
        remark: prev?.remark || ''
      }));

      // Fetch user profile if address is missing
      if (!currentUser.address && currentUser.email) {
        fetch(getApiUrl(`/api/users/${encodeURIComponent(currentUser.email)}/profile`))
          .then(res => res.ok ? res.json() : null)
          .then(profile => {
            if (profile?.address) {
              const updated = { ...currentUser, address: profile.address };
              setCurrentUser(updated);
              try { localStorage.setItem('customerUser', JSON.stringify(updated)); } catch (e) {}
              setCustomerForm(prev => ({ ...prev, address: profile.address }));
            }
          })
          .catch(() => {});
      }
    }
  }, [currentUser]);

  const login = useCallback((userData) => {
    setCurrentUser(userData);
    try {
      localStorage.setItem('customerUser', JSON.stringify(userData));
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

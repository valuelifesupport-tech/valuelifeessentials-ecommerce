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

      // Fetch user profile if details are missing
      const needsProfileFetch = currentUser.email && (!currentUser.phone || !currentUser.address || !currentUser.city || !currentUser.pincode);
      if (needsProfileFetch) {
        fetch(getApiUrl(`/api/users/${encodeURIComponent(currentUser.email)}/profile`))
          .then(res => res.ok ? res.json() : null)
          .then(profile => {
            if (profile) {
              const updated = {
                ...currentUser,
                name: profile.name || currentUser.name,
                phone: profile.phone || currentUser.phone,
                address: profile.address || currentUser.address,
                city: profile.city || currentUser.city,
                state: profile.state || currentUser.state,
                pincode: profile.pincode || currentUser.pincode,
                gstin_number: profile.gstin_number || currentUser.gstin_number,
                business_name: profile.business_name || currentUser.business_name
              };
              setCurrentUser(updated);
              try { localStorage.setItem('customerUser', JSON.stringify(updated)); } catch (e) {}
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

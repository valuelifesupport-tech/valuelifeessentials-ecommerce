import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getApiUrl } from '../config/env';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('customer_token');
      const u = JSON.parse(localStorage.getItem('customerUser'));
      if (token && u && u.id) {
        return { ...u, token };
      }
      if (!token && u) {
        localStorage.removeItem('customerUser');
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

  const fetchedUserIdsRef = useRef(new Set());

  // Sync customerForm whenever currentUser updates and acquire token at most once per user session
  useEffect(() => {
    if (currentUser) {
      setCustomerForm(prev => {
        if (
          prev.name === (currentUser.name || '') &&
          prev.phone === (currentUser.phone || '') &&
          prev.email === (currentUser.email || '') &&
          prev.address === (currentUser.address || '')
        ) {
          return prev;
        }
        return {
          name: currentUser.name || prev?.name || '',
          phone: currentUser.phone || prev?.phone || '',
          email: currentUser.email || prev?.email || '',
          address: currentUser.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
          remark: prev?.remark || ''
        };
      });

      // Fetch user profile token AT MOST ONCE per user session to guarantee no infinite loop
      const userKey = currentUser.id ? `id_${currentUser.id}` : (currentUser.email || currentUser.phone || '');
      if (userKey && !fetchedUserIdsRef.current.has(userKey) && currentUser.token) {
        fetchedUserIdsRef.current.add(userKey);

        const needsProfileFetch = !currentUser.phone || !currentUser.name || currentUser.name.startsWith('Customer ');
        if (needsProfileFetch) {
          fetch(getApiUrl('/api/auth/token'), {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({ user_id: currentUser.id, email: currentUser.email, phone: currentUser.phone })
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data && data.token && data.user) {
                setCurrentUser(prev => {
                  if (!prev) return null;
                  const updated = {
                    ...prev,
                    token: data.token,
                    name: data.user.name || prev.name,
                    phone: data.user.phone || prev.phone,
                    address: data.user.address || prev.address,
                    city: data.user.city || prev.city,
                    state: data.user.state || prev.state,
                    pincode: data.user.pincode || prev.pincode,
                    gstin_number: data.user.gstin_number || prev.gstin_number,
                    business_name: data.user.business_name || prev.business_name,
                    addresses: data.user.addresses || prev.addresses
                  };
                  try {
                    localStorage.setItem('customerUser', JSON.stringify(updated));
                    localStorage.setItem('customer_token', data.token);
                  } catch (e) {}
                  return updated;
                });
              }
            })
            .catch(() => {});
        }
      }
    }
  }, [currentUser?.id, currentUser?.token, currentUser?.email, currentUser?.phone, currentUser?.name]);

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

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getApiUrl } from '../config/env';
import { useToast } from './ToastContext';

export function sanitizeClientUser(u) {
  if (!u) return null;
  const rawEmail = u.email ? String(u.email).trim() : '';
  const isDummyEmail = !rawEmail || 
    rawEmail.toLowerCase().includes('@valuelifeessentials.com') || 
    rawEmail.toLowerCase().includes('@temporary.com') || 
    rawEmail.toLowerCase().includes('@mobile.');
  const rawName = u.name ? String(u.name).trim() : '';
  const isDummyName = !rawName || 
    rawName.toLowerCase().startsWith('customer ') || 
    rawName.toLowerCase().startsWith('customer_');

  return {
    ...u,
    name: isDummyName ? '' : rawName,
    email: isDummyEmail ? '' : rawEmail
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem('customer_token');
      const rawUser = JSON.parse(localStorage.getItem('customerUser'));
      const u = sanitizeClientUser(rawUser);
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
      const rawUser = JSON.parse(localStorage.getItem('customerUser'));
      const u = sanitizeClientUser(rawUser);
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
      const sanitized = sanitizeClientUser(currentUser);
      setCustomerForm(prev => {
        if (
          prev.name === (sanitized.name || '') &&
          prev.phone === (sanitized.phone || '') &&
          prev.email === (sanitized.email || '') &&
          prev.address === (sanitized.address || '')
        ) {
          return prev;
        }
        return {
          name: sanitized.name || prev?.name || '',
          phone: sanitized.phone || prev?.phone || '',
          email: sanitized.email || prev?.email || '',
          address: sanitized.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
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
                const cleanDataUser = sanitizeClientUser(data.user);
                setCurrentUser(prev => {
                  if (!prev) return null;
                  const updated = {
                    ...prev,
                    token: data.token,
                    name: cleanDataUser.name || prev.name,
                    email: cleanDataUser.email || prev.email,
                    phone: cleanDataUser.phone || prev.phone,
                    address: cleanDataUser.address || prev.address,
                    city: cleanDataUser.city || prev.city,
                    state: cleanDataUser.state || prev.state,
                    pincode: cleanDataUser.pincode || prev.pincode,
                    gstin_number: cleanDataUser.gstin_number || prev.gstin_number,
                    business_name: cleanDataUser.business_name || prev.business_name,
                    addresses: cleanDataUser.addresses || prev.addresses
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
    const cleanUser = sanitizeClientUser(userData);
    const token = cleanUser.token || localStorage.getItem('customer_token');
    const enriched = { ...cleanUser, token: token || null };
    setCurrentUser(enriched);
    try {
      localStorage.setItem('customerUser', JSON.stringify(enriched));
      if (token) localStorage.setItem('customer_token', token);
    } catch (e) {}

    setCustomerForm(prev => ({
      name: enriched.name || prev?.name || '',
      phone: enriched.phone || prev?.phone || '',
      email: enriched.email || prev?.email || '',
      address: enriched.address || localStorage.getItem('user_last_shipping_address') || prev?.address || '',
      remark: prev?.remark || ''
    }));

    setIsAuthOpen(false);
    showToast('success', 'Signed In', `Welcome back${enriched.name ? `, ${enriched.name}` : ''}!`);
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
      const sanitized = sanitizeClientUser(updatedData);
      const merged = { ...prev, ...sanitized };
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

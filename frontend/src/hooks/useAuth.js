import { useState, useEffect } from 'react';
import { getApiUrl } from '../api/config';

export function useAuth(showToast) {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('customerUser')) || null; } catch (e) { return null; }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('customerUser'));
      const savedAddr = localStorage.getItem('user_last_shipping_address') || '';
      const rawPhone = u?.phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      return {
        name: u?.name || '',
        phone: cleanPhone,
        email: u?.email || '',
        street: u?.address || savedAddr || '',
        address: u?.address || savedAddr || '',
        city: u?.city || '',
        state: u?.state || 'Maharashtra',
        pincode: u?.pincode || '',
        remark: ''
      };
    } catch (e) {
      return { name: '', phone: '', email: '', street: '', address: '', city: '', state: 'Maharashtra', pincode: '', remark: '' };
    }
  });

  useEffect(() => {
    if (currentUser) {
      const rawPhone = customerForm?.phone || currentUser.phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
      setCustomerForm(prev => ({
        name: currentUser.name || prev.name || '',
        phone: cleanPhone || prev.phone || '',
        email: currentUser.email || prev.email || '',
        street: prev.street || currentUser.address || localStorage.getItem('user_last_shipping_address') || prev.address || '',
        address: prev.address || currentUser.address || localStorage.getItem('user_last_shipping_address') || '',
        city: prev.city || currentUser.city || '',
        state: prev.state || currentUser.state || 'Maharashtra',
        pincode: prev.pincode || currentUser.pincode || '',
        remark: prev.remark || ''
      }));

      if ((!currentUser.address || !currentUser.city || !currentUser.pincode) && currentUser.email) {
        fetch(getApiUrl(`/api/users/${encodeURIComponent(currentUser.email)}/profile`))
          .then(res => res.ok ? res.json() : null)
          .then(profile => {
            if (profile) {
              const pPhone = (profile.phone || '').replace(/\D/g, '').slice(-10);
              const updated = { 
                ...currentUser, 
                address: profile.address || currentUser.address,
                city: profile.city || currentUser.city,
                state: profile.state || currentUser.state || 'Maharashtra',
                pincode: profile.pincode || currentUser.pincode,
                phone: pPhone || currentUser.phone
              };
              setCurrentUser(updated);
              try { localStorage.setItem('customerUser', JSON.stringify(updated)); } catch (e) {}
              setCustomerForm(prev => ({ 
                ...prev, 
                street: profile.address || prev.street,
                address: profile.address || prev.address,
                city: profile.city || prev.city,
                state: profile.state || prev.state || 'Maharashtra',
                pincode: profile.pincode || prev.pincode,
                phone: pPhone || prev.phone
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [currentUser]);

  return {
    currentUser,
    setCurrentUser,
    isAuthOpen,
    setIsAuthOpen,
    customerForm,
    setCustomerForm
  };
}

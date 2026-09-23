import { useState } from 'react';
import { getApiUrl } from '../api/config';
import { createAdminFetch } from '../utils/adminApi';

/**
 * Authentication state, login/logout handlers, and the adminFetch wrapper.
 */
export default function useAdminAuth({ showToast }) {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('admin_session_token') || '');
  const [isAuthLocked, setIsAuthLocked] = useState(!localStorage.getItem('admin_session_token'));
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const adminFetch = createAdminFetch({ setAdminToken, setIsAuthLocked, showToast });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsAuthenticating(true);
    try {
      const res = await window.fetch(getApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          localStorage.setItem('admin_session_token', data.token);
          setAdminToken(data.token);
          setIsAuthLocked(false);
          if (showToast) showToast('success', 'Access Granted 🔓', 'Welcome to the Control Panel!');
        } else {
          setLoginError('Server returned OK but no auth token was provided.');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setLoginError(errData.error || `Authentication failed with status ${res.status}.`);
      }
    } catch (err) {
      setLoginError('Could not connect to admin server. Please verify the backend is running.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('admin_session_token');
    setAdminToken('');
    setIsAuthLocked(true);
    if (showToast) showToast('info', 'Logged Out', 'Admin session ended.');
  };

  return {
    adminToken,
    isAuthLocked,
    loginForm,
    setLoginForm,
    loginError,
    isAuthenticating,
    adminFetch,
    handleAdminLogin,
    handleAdminLogout
  };
}

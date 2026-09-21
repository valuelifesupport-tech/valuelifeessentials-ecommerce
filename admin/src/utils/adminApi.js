import { getApiUrl } from '../api/config';

/**
 * Create an admin-authenticated fetch wrapper.
 * Auto-injects x-admin-token header, handles 401 session expiry.
 */
export function createAdminFetch({ setAdminToken, setIsAuthLocked, showToast }) {
  return (url, options = {}) => {
    const token = localStorage.getItem('admin_session_token') || '';
    const targetUrl = typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://')) ? url : getApiUrl(url);
    const headers = {
      'x-admin-token': token,
      ...(options.headers || {})
    };
    return window.fetch(targetUrl, { cache: 'no-store', ...options, headers }).then(res => {
      if (res.status === 401 && token) {
        localStorage.removeItem('admin_session_token');
        setAdminToken('');
        setIsAuthLocked(true);
        if (showToast) showToast('error', 'Session Expired', 'Please login again.');
      }
      return res;
    });
  };
}

/**
 * Resilient JSON fetcher with retry on 503.
 */
export async function safeFetchJson(adminFetch, url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await adminFetch(url);
      if (res.ok) {
        const text = await res.text();
        if (!text || !text.trim()) return null;
        try {
          return JSON.parse(text);
        } catch (e) {
          return null;
        }
      }
      if (res.status === 503 && i < retries) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      return null;
    } catch (e) {
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000));
        continue;
      }
      return null;
    }
  }
  return null;
}

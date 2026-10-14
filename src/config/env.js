/**
 * Centralized Environment Configuration for ValueLife Essentials Storefront
 * Safely parses Vite environment variables (import.meta.env) with production fallbacks.
 */

const isClient = typeof window !== 'undefined';

const getHostUrl = () => {
  if (!isClient) return '';
  return window.location.origin;
};

const resolveApiBase = () => {
  if (!isClient) return 'https://backend.valuelifeessentials.com';

  const host = window.location.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';

  // 1. In local dev, empty string lets Vite proxy forward '/api' to backend port 5000
  if (isLocal) {
    return '';
  }

  // 2. Explicit environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
  }

  // 3. Known production domains
  if (host.includes('valuelifeessentials.com')) {
    return 'https://backend.valuelifeessentials.com';
  }

  if (host.includes('hostingersite.com')) {
    return 'https://aliceblue-loris-851812.hostingersite.com';
  }

  // Default fallback
  return 'https://backend.valuelifeessentials.com';
};

export const API_BASE = resolveApiBase();

export const ENV = {
  // Base URLs
  API_BASE,
  STOREFRONT_URL: import.meta.env.VITE_STOREFRONT_URL || (isClient ? getHostUrl() : 'https://valuelifeessentials.com'),
  ADMIN_URL: import.meta.env.VITE_ADMIN_URL || 'https://admin.valuelifeessentials.com',

  // App Metadata
  APP_NAME: import.meta.env.VITE_APP_NAME || 'ValueLife Essentials',
  DEFAULT_CURRENCY: import.meta.env.VITE_DEFAULT_CURRENCY || 'INR',
  DEFAULT_CURRENCY_SYMBOL: '₹',

  // Feature Flags
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
  MODE: import.meta.env.MODE || 'production',
};

/**
 * Resolves a full API URL given a path.
 * Automatically adds leading slash if omitted.
 * In local dev, returns path directly (e.g. '/api/products') for Vite proxy.
 * In production, returns 'https://backend.valuelifeessentials.com/api/products'.
 */
export const getApiUrl = (path = '') => {
  if (!path) return ENV.API_BASE;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return ENV.API_BASE ? `${ENV.API_BASE}${cleanPath}` : cleanPath;
};

export default ENV;

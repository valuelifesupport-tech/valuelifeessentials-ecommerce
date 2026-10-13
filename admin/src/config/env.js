/**
 * ValueLife Essentials — Standalone Admin Environment Configuration Resolver
 * Centralizes all Vite environment variable resolution and provides intelligent fallbacks.
 */

const isBrowser = typeof window !== 'undefined';

function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (isBrowser) {
    const { hostname, protocol } = window.location;
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // Production on Hostinger / custom domain: API is at root domain or /api
    return `${protocol}//${hostname}`;
  }

  return '';
}

function resolveStorefrontUrl() {
  const envUrl = import.meta.env.VITE_STOREFRONT_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (isBrowser) {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5173';
    }
  }

  return 'https://valuelifeessentials.com';
}

export const ADMIN_ENV = {
  API_BASE_URL: resolveApiBaseUrl(),
  STOREFRONT_URL: resolveStorefrontUrl(),
  STORE_DOMAIN: import.meta.env.VITE_STORE_DOMAIN || 'valuelifeessentials.com',
  DEFAULT_GSTIN: import.meta.env.VITE_STORE_GSTIN || import.meta.env.VITE_DEFAULT_GSTIN || '36AAPFV4767N1Z4',
  DEFAULT_STORE_STATE: import.meta.env.VITE_DEFAULT_STORE_STATE || 'Telangana',
  IS_DEV: Boolean(import.meta.env.DEV),
  IS_PROD: Boolean(import.meta.env.PROD)
};

export default ADMIN_ENV;

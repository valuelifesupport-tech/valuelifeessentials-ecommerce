// Dynamic API Base URL resolver for Standalone Admin Portal
export const getApiUrl = (path = '') => {
  let base = '';

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    
    if (isLocal) {
      base = ''; // Uses Vite proxy to port 5000 in local development
    } else if (import.meta.env.VITE_API_URL) {
      base = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
    } else {
      base = 'https://backend.valuelifeessentials.com';
    }
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
};

export const API_BASE = (typeof window !== 'undefined')
  ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.trim().replace(/\/$/, '') : 'https://backend.valuelifeessentials.com')
  : 'https://backend.valuelifeessentials.com';

export const DEFAULT_FALLBACK_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 100 100'><rect width='100' height='100' rx='16' fill='%230f172a'/><path d='M50 25 C36 25 25 36 25 50 C25 64 36 75 50 75 C64 75 75 64 75 50 C75 36 64 25 50 25 Z' fill='%23134e4a' opacity='0.4'/><path d='M50 32 C40 32 32 40 32 50 C32 60 40 68 50 68 C60 68 68 60 68 50 C68 40 60 32 50 32 Z' fill='%23047857' opacity='0.7'/><path d='M50 38 C43 38 38 43 38 50 C38 57 43 62 50 62 C57 62 62 57 62 50 C62 43 57 38 50 38 Z' fill='%2310b981'/><text x='50' y='86' text-anchor='middle' fill='%2310b981' font-size='11' font-family='sans-serif' font-weight='800' letter-spacing='1'>VALUELIFE</text></svg>";

export const getProxyImgUrl = (url) => {
  if (!url || typeof url !== 'string') return DEFAULT_FALLBACK_SVG;
  return getApiUrl(`/api/media/proxy?url=${encodeURIComponent(url.trim())}`);
};

export const resolveImgUrl = (url, fallback = DEFAULT_FALLBACK_SVG) => {
  if (!url || typeof url !== 'string' || !url.trim()) return fallback;
  let clean = url.trim();

  if (clean.startsWith('data:')) return clean;

  if (clean.includes('valuelife_logo') || clean.includes('logo.png') || clean.includes('favicon.svg') || clean.includes('icons.svg')) {
    const assetName = clean.split('/').pop();
    return `/${assetName}`;
  }

  if (clean.includes('/uploads/')) {
    const filename = clean.split('/uploads/').pop();
    return getApiUrl(`/api/media/file/${filename}`);
  }

  // External full URLs (Amazon CDN, Unsplash, external media, etc.)
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  if (clean.includes('/images/')) {
    const relative = clean.split('/images/').pop();
    return `/images/${relative}`;
  }

  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return getApiUrl(path);
};

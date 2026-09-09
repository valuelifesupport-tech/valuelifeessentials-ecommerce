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

export const resolveImgUrl = (url, fallback = 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80') => {
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

  if (clean.includes('/images/')) {
    const relative = clean.split('/images/').pop();
    return `/images/${relative}`;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;

  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return getApiUrl(path);
};

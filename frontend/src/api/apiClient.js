import { getApiUrl } from './config';

export const fetchApi = async (endpoint, options = {}) => {
  try {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = getApiUrl(`/api${cleanEndpoint}`);
    const res = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Fetch API Error (${endpoint}):`, error);
    throw error;
  }
};

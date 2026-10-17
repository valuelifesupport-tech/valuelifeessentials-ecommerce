import { getApiUrl } from '../config/env';

/**
 * Standardized HTTP API Client for ValueLife Essentials
 * Handles request timeouts, JSON serialization, auth headers, and uniform error formatting.
 */
class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const apiClient = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeout = 15000,
    ...customConfig
  } = options;

  const url = getApiUrl(endpoint);

  const defaultHeaders = {
    'Accept': 'application/json',
  };

  // Add Content-Type if sending a JSON body
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  // Auto-inject customer auth token if present
  try {
    const customerUser = JSON.parse(localStorage.getItem('customerUser') || 'null');
    const directToken = localStorage.getItem('customer_token');
    const token = customerUser?.token || directToken;
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    if (customerUser?.id) {
      defaultHeaders['x-user-id'] = String(customerUser.id);
    }
  } catch (e) {
    // ignore parse error
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const config = {
    method,
    headers: { ...defaultHeaders, ...headers },
    signal: controller.signal,
    ...customConfig
  };

  if (body) {
    config.body = (typeof body === 'object' && !(body instanceof FormData))
      ? JSON.stringify(body)
      : body;
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = (typeof data === 'object' && data?.error)
        ? data.error
        : `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your internet connection.', 408);
    }
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network connection failed.', 0);
  }
};

export const fetchApi = (endpoint, options) => apiClient(endpoint, options);

export default apiClient;

import { apiClient } from './apiClient';

/**
 * Authentication & Customer User Service
 * Encapsulates login, registration, OTP delivery, profile management, and address updates.
 */
export const authService = {
  login: (credentials) => {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: credentials
    });
  },

  register: (userData) => {
    return apiClient('/api/auth/register', {
      method: 'POST',
      body: userData
    });
  },

  sendOtp: (target, type = 'login') => {
    return apiClient('/api/auth/send-otp', {
      method: 'POST',
      body: { target, type }
    });
  },

  verifyOtp: (target, otp) => {
    return apiClient('/api/auth/verify-otp', {
      method: 'POST',
      body: { target, otp }
    });
  },

  getUserProfile: (emailOrPhone) => {
    return apiClient(`/api/users/${encodeURIComponent(emailOrPhone)}/profile`);
  },

  updateProfile: (userId, profileData) => {
    return apiClient(`/api/users/${userId}`, {
      method: 'PUT',
      body: profileData
    });
  }
};

export default authService;

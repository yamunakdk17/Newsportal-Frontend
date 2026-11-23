import axios from 'axios';

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/components/auth/tokenStore';

const API_URL = String(import.meta.env.VITE_API_URL || '/api')
  .trim()
  .replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let refreshPromise = null;

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/admin/refresh', null, {
        skipAuthRefresh: true,
      })
      .then((response) => {
        const data = response.data?.data;

        if (!data?.token) {
          throw new Error('Refresh succeeded but no access token was returned.');
        }

        setAccessToken(data.token);

        return data.token;
      })
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers?.['Content-Type'];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest.skipAuthRefresh ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAccessToken();

      return Promise.reject(refreshError);
    }
  },
);

export default api;

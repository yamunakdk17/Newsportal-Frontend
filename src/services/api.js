import axios from 'axios';

import { clearAccessToken, getAccessToken, setAccessToken } from '@/auth/tokenStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

/*
| Refresh state
|
| Only one refresh request is allowed at a time.
| If several API requests receive 401 simultaneously,
| they all wait for this same Promise.
|
*/
let refreshPromise = null;

/*
| Request interceptor
|
| Attach the current access token to protected requests.
|
*/
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * Let Axios/browser create the correct multipart boundary
     * when sending FormData.
     */
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
| Refresh access token
|
| The refresh token is NOT manually sent.
|
| Laravel receives it automatically from the HttpOnly cookie
| because withCredentials: true is enabled.
|
*/
async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/admin/refresh', null, {
        /*
         * Explicitly keep credentials enabled for the refresh
         * request.
         */
        withCredentials: true,

        /*
         * Prevent the 401 interceptor from trying to refresh
         * the refresh request itself.
         */
        skipAuthRefresh: true,
      })
      .then((response) => {
        const token = response.data?.data?.token;

        if (!token) {
          throw new Error('Refresh succeeded but no access token was returned.');
        }

        setAccessToken(token);

        return token;
      })
      .catch((error) => {
        clearAccessToken();

        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/*
| Response interceptor
|
| If a protected request gets 401:
|
| 1. Refresh the access token once.
| 2. Save the new token in memory.
| 3. Retry the original request once.
|
*/
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;

    /*
     * No response means network/server connection problem.
     */
    if (!error.response) {
      return Promise.reject(error);
    }

    /*
     * Never try to refresh the refresh request itself.
     */
    if (originalRequest?.skipAuthRefresh) {
      return Promise.reject(error);
    }

    /*
     * Only handle 401 responses.
     *
     * 403, 429 and 5xx are passed to the calling component.
     */
    if (status !== 401) {
      return Promise.reject(error);
    }

    /*
     * Retry each original request only once.
     */
    if (originalRequest._retry) {
      clearAccessToken();

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /*
       * If another request is already refreshing,
       * this request waits for the same refresh Promise.
       */
      const newToken = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers || {};

      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      /*
       * Retry the original request once.
       */
      return api(originalRequest);
    } catch (refreshError) {
      /*
       * Refresh failed.
       *
       * The refresh cookie is expired, revoked, invalid,
       * or the backend rejected the request.
       */
      clearAccessToken();

      return Promise.reject(refreshError);
    }
  },
);

export default api;

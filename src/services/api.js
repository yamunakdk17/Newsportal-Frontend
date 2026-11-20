// import axios from 'axios';

// import {
//   clearAccessToken,
//   getAccessToken,
//   setAccessToken,
// } from '@/components/auth/tokenStore';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
// });

// let refreshPromise = null;

// /**
//  * Refresh the access token.
//  *
//  * The refresh token is stored in an HttpOnly cookie.
//  * The browser sends that cookie automatically because
//  * withCredentials is enabled.
//  */
// async function refreshAccessToken() {
//   console.log('[AUTH] 🔄 Refresh process started');

//   if (!refreshPromise) {
//     console.log('[AUTH] Creating new refresh request');

//     refreshPromise = api
//       .post('/admin/refresh', null, {
//         // Prevent this request from entering the
//         // automatic 401 refresh flow.
//         skipAuthRefresh: true,
//       })
//       .then((response) => {
//         console.log('[AUTH] ✅ Refresh response status:', response.status);

//         const data = response.data?.data;

//         if (!data?.token) {
//           console.error('[AUTH] ❌ Refresh succeeded but no access token was returned');

//           throw new Error('Refresh succeeded but no access token was returned.');
//         }

//         setAccessToken(data.token);

//         console.log('[AUTH] ✅ New access token stored in memory');

//         return data.token;
//       })
//       .catch((error) => {
//         console.error('[AUTH] ❌ Refresh request failed');

//         console.error('[AUTH] Refresh status:', error.response?.status);

//         console.error('[AUTH] Refresh response:', error.response?.data);

//         throw error;
//       })
//       .finally(() => {
//         console.log('[AUTH] Refresh request finished');

//         refreshPromise = null;
//       });
//   } else {
//     console.log('[AUTH] ⏳ Refresh already running — reusing existing request');
//   }

//   return refreshPromise;
// }

// /**
//  * Attach the in-memory access token to API requests.
//  */
// api.interceptors.request.use(
//   (config) => {
//     const token = getAccessToken();

//     console.log(
//       '[API] ➡️',
//       config.method?.toUpperCase(),
//       config.url,
//       '| Access token:',
//       token ? 'present' : 'missing',
//     );

//     if (token) {
//       config.headers = config.headers || {};

//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     /**
//      * Let Axios/browser automatically create the correct
//      * multipart boundary when sending FormData.
//      */
//     if (config.data instanceof FormData) {
//       delete config.headers?.['Content-Type'];
//     }

//     return config;
//   },
//   (error) => {
//     console.error('[API] ❌ Request interceptor error:', error);

//     return Promise.reject(error);
//   },
// );

// /**
//  * Handle API responses.
//  *
//  * Only ONE response interceptor is used for authentication.
//  */
// api.interceptors.response.use(
//   (response) => {
//     console.log(
//       '[API] ✅',
//       response.config.method?.toUpperCase(),
//       response.config.url,
//       '| Status:',
//       response.status,
//     );

//     return response;
//   },

//   async (error) => {
//     const originalRequest = error.config;

//     console.error(
//       '[API] ❌',
//       originalRequest?.method?.toUpperCase(),
//       originalRequest?.url,
//       '| Status:',
//       error.response?.status,
//     );

//     /**
//      * Do not refresh when:
//      *
//      * 1. There is no original request.
//      * 2. The error is not 401.
//      * 3. The request explicitly disables refresh handling.
//      * 4. The request has already been retried.
//      */
//     if (
//       !originalRequest ||
//       error.response?.status !== 401 ||
//       originalRequest.skipAuthRefresh ||
//       originalRequest._retry
//     ) {
//       console.log('[AUTH] No refresh attempted for this error');

//       return Promise.reject(error);
//     }

//     console.log('[AUTH] ⚠️ Access token rejected with 401');

//     /**
//      * Mark the original request so it can never enter
//      * the refresh flow more than once.
//      */
//     originalRequest._retry = true;

//     try {
//       const newAccessToken = await refreshAccessToken();

//       console.log('[AUTH] 🔁 Retrying original request:', originalRequest.url);

//       originalRequest.headers = originalRequest.headers || {};

//       originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

//       return api(originalRequest);
//     } catch (refreshError) {
//       console.error('[AUTH] ❌ Could not refresh session');

//       clearAccessToken();

//       console.log('[AUTH] 🗑️ Access token cleared from memory');

//       return Promise.reject(refreshError);
//     }
//   },
// );

// export default api;
import axios from 'axios';

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/components/auth/tokenStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let refreshPromise = null;

async function refreshAccessToken() {
  console.log('[AUTH] Refresh process started');

  if (!refreshPromise) {
    refreshPromise = api
      .post('/admin/refresh', null, {
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
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    console.log(
      '[API] ➡️',
      config.method?.toUpperCase(),
      config.url,
      '| Access token:',
      token ? 'present' : 'missing',
    );

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers?.['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    console.log(
      '[API] ✅',
      response.config.method?.toUpperCase(),
      response.config.url,
      '| Status:',
      response.status,
    );

    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    console.error(
      '[API] ❌',
      originalRequest?.method?.toUpperCase(),
      originalRequest?.url,
      '| Status:',
      error.response?.status,
    );

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest.skipAuthRefresh ||
      originalRequest._retry
    ) {
      console.log('[AUTH] No refresh attempted for this error');

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      console.error('[AUTH] Could not refresh session');

      clearAccessToken();

      return Promise.reject(refreshError);
    }
  },
);

export default api;

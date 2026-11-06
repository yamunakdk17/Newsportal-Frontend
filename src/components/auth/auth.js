import api from '@/services/api';

import { clearAccessToken, setAccessToken } from '@/components/auth/tokenStore';

let sessionRestorePromise = null;

/**
 * Login admin user.
 *
 * The backend returns the access token in JSON.
 * The refresh token is stored by Laravel as an
 * HttpOnly cookie and is handled automatically
 * by the browser.
 */
export async function login(email, password) {
  console.log('[AUTH] 🔐 Login started');

  const response = await api.post('/admin/login', {
    email,
    password,
  });

  console.log('[AUTH] ✅ Login response status:', response.status);

  const data = response.data?.data;

  if (!data?.token) {
    console.error('[AUTH] ❌ Login response has no access token');

    throw new Error('Login succeeded but no access token was returned.');
  }

  setAccessToken(data.token);

  console.log('[AUTH] ✅ Access token stored in memory');

  console.log('[AUTH] 🍪 Refresh token is expected in an HttpOnly cookie');

  return data.user || null;
}

/**
 * Restore an existing admin session.
 *
 * The browser automatically sends the HttpOnly
 * refresh-token cookie to Laravel.
 */
export function restoreSession() {
  console.log('[AUTH] 🔄 Restoring session...');

  if (!sessionRestorePromise) {
    sessionRestorePromise = api
      .post('/admin/refresh', null, {
        skipAuthRefresh: true,
      })
      .then((response) => {
        console.log('[AUTH] ✅ Session restore status:', response.status);

        const data = response.data?.data;

        if (!data?.token) {
          console.error('[AUTH] ❌ Session restore returned no access token');

          throw new Error('Session refresh succeeded but no access token was returned.');
        }

        setAccessToken(data.token);

        console.log('[AUTH] ✅ New access token stored after session restore');

        return data.user || null;
      })
      .catch((error) => {
        console.error('[AUTH] ❌ Session restore failed');

        console.error('[AUTH] Status:', error.response?.status);

        clearAccessToken();

        throw error;
      })
      .finally(() => {
        sessionRestorePromise = null;
      });
  }

  return sessionRestorePromise;
}

/**
 * Logout the current admin session.
 *
 * The access token is sent automatically by the Axios
 * request interceptor.
 *
 * Refresh handling is disabled for logout because
 * logout should never trigger another refresh request.
 */
export async function logout() {
  console.log('[AUTH] 🚪 Logout started');

  try {
    const response = await api.post('/admin/logout', null, {
      skipAuthRefresh: true,
    });

    console.log('[AUTH] ✅ Logout response status:', response.status);

    console.log('[AUTH] ✅ Logout response:', response.data);

    return response.data;
  } catch (error) {
    console.error('[AUTH] ❌ Logout request failed');

    console.error('[AUTH] Status:', error.response?.status);

    console.error('[AUTH] Response:', error.response?.data);

    throw error;
  } finally {
    /*
     * Access token exists only in memory,
     * so clear it when logout finishes.
     */
    clearAccessToken();

    console.log('[AUTH] 🗑️ Access token cleared from memory');
  }
}

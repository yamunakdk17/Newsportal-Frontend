import api from '@/services/api';

import { clearAccessToken, setAccessToken } from '@/components/auth/tokenStore';

let sessionRestorePromise = null;

/**
 * Login admin user.
 *
 * The backend returns the access token in JSON.
 * The refresh token is stored by Laravel as an
 * HttpOnly cookie.
 *
 * Login failures MUST NOT trigger /admin/refresh.
 */
export async function login(email, password) {
  console.log('[AUTH] 🔐 Login started');

  const response = await api.post(
    '/admin/login',
    {
      email,
      password,
    },
    {
      /**
       * A failed login must never attempt to refresh
       * an access token.
       */
      skipAuthRefresh: true,
    },
  );

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
 * This is normally called when the application starts
 * and there is no access token in memory.
 *
 * Laravel receives the refresh token automatically
 * through the HttpOnly cookie.
 */
export function restoreSession() {
  console.log('[AUTH] 🔄 Restoring session...');

  if (!sessionRestorePromise) {
    sessionRestorePromise = api
      .post('/admin/refresh', null, {
        /**
         * Never allow the refresh request itself
         * to start another refresh request.
         */
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
  } else {
    console.log('[AUTH] ⏳ Session restore already running — reusing existing request');
  }

  return sessionRestorePromise;
}

/**
 * Logout the current admin session.
 *
 * Refresh handling is disabled because logout must
 * never trigger another refresh request.
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
    /**
     * The access token exists only in memory,
     * so always remove it after logout.
     */
    clearAccessToken();

    console.log('[AUTH] 🗑️ Access token cleared from memory');
  }
}

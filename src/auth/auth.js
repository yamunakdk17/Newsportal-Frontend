import api from '@/services/api';

import { clearAccessToken, setAccessToken } from '@/auth/tokenStore';

/**
 * Login admin.
 *
 * Laravel:
 * - validates credentials
 * - returns access token
 * - sets HttpOnly refresh cookie
 */
export async function login(email, password) {
  const response = await api.post('/admin/login', {
    email,
    password,
  });

  const data = response.data?.data;

  if (!data?.token) {
    throw new Error('Login succeeded but no access token was returned.');
  }

  setAccessToken(data.token);

  return data.user;
}

/**
 * Restore an existing admin session.
 *
 * The browser automatically sends the HttpOnly
 * refresh cookie.
 */
export async function restoreSession() {
  try {
    const response = await api.post('/admin/refresh');

    const token = response.data?.data?.token;
    const user = response.data?.data?.user;

    if (!token) {
      throw new Error('Session refresh succeeded but no access token was returned.');
    }

    setAccessToken(token);

    return user || null;
  } catch (error) {
    clearAccessToken();

    throw error;
  }
}

/**
 * Logout admin.
 *
 * The current access token is automatically attached
 * by the Axios request interceptor.
 *
 * Laravel will:
 * - revoke the access token
 * - revoke the refresh token
 * - clear the refresh cookie
 */
export async function logout() {
  try {
    await api.post('/admin/logout');
  } finally {
    clearAccessToken();
  }
}

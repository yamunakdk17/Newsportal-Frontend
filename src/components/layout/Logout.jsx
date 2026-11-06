import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { logout } from '@/components/auth/auth';

export default function Logout({ onLogout }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    console.log('[AUTH] 🚪 Logout clicked');

    try {
      await logout();

      console.log('[AUTH] ✅ Logout completed');
    } catch (error) {
      console.error('[AUTH] ❌ Logout API failed:', error);

      console.error('[AUTH] Status:', error.response?.status);

      console.error('[AUTH] Response:', error.response?.data);
    } finally {
      /*
       * Access token is cleared from memory
       * inside auth.js.
       *
       * These are only UI/session metadata.
       */
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminRole');

      onLogout?.();

      navigate('/login', {
        replace: true,
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className="flex w-full items-center justify-center gap-2">
      <LogOut className="size-4" />

      <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
    </button>
  );
}

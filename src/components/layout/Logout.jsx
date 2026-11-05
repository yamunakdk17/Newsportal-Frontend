import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import api from '@/services/api';

export default function Logout({ onLogout }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const token = localStorage.getItem('adminToken');

      console.log('Logout clicked');
      console.log('Token exists:', !!token);
      console.log('Logout endpoint:', `${api.defaults.baseURL}/admin/logout`);

      /*
       * The Axios request interceptor automatically adds:
       *
       * Authorization: Bearer <adminToken>
       */
      const response = await api.post('/admin/logout');

      console.log('Logout successful');
      console.log('Status:', response.status);
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Logout API failed:', error);
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
      console.error('URL:', error.config?.url);
    } finally {
      /*
       * Clear frontend authentication regardless of
       * whether the backend logout request succeeds.
       */
      localStorage.removeItem('adminToken');
      localStorage.removeItem('tokenType');
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

export default function Logout() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await api.post('/admin/logout');

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error.response?.data || error.message);
    } finally {
      // Clear all logged-in admin data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminRole');

      // Go to login page
      navigate('/login', {
        replace: true,
      });
    }
  };

  return (
    <button type="button" onClick={handleLogout} disabled={loggingOut} className="w-full">
      {loggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}

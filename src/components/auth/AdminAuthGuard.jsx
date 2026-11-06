import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { restoreSession } from '@/components/auth/auth';

function AdminAuthGuard() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const user = await restoreSession();

        if (!mounted) {
          return;
        }

        if (user) {
          localStorage.setItem('adminUser', JSON.stringify(user));

          localStorage.setItem('adminRole', user.role || '');
        }

        setStatus('authenticated');
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error('Admin session restoration failed:', error);

        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminRole');

        setStatus('unauthenticated');
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gray-50">
        <p className="text-sm text-slate-500">Checking your session...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default AdminAuthGuard;

import { Routes, Route } from 'react-router-dom';

import Home from '@/pages/Home';
import NewsDetails from '@/pages/NewsDetails';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/news/:slug" element={<NewsDetails />} />

      {/* Login - only for users who are NOT logged in */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Admin - only for logged-in users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<Admin />} />
      </Route>

    </Routes>
  );
}

export default AppRoutes;

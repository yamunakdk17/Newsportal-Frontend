import { Routes, Route } from 'react-router-dom';

import Home from '@/pages/Home';
import NewsDetails from '@/pages/NewsDetails';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import AdminCategories from '@/pages/AdminCategories';
import NotFound from '@/pages/NotFound';

import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* News Details */}
      <Route
        path="/news/:slug"
        element={<NewsDetails />}
      />

      {/* Login - only for users who are NOT logged in */}
      <Route element={<PublicRoute />}>
        <Route
          path="/login"
          element={<Login />}
        />
      </Route>

      {/* Admin - only for logged-in users */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={<Admin />}
        />

        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />
      </Route>

      {/* Any unknown/random URL */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;

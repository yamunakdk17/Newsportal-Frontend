import { Routes, Route } from 'react-router-dom';

import Home from '@/pages/Home';
import Category from '@/pages/Category';
import NewsDetails from '@/pages/NewsDetails';
import Login from '@/pages/Login';

import AdminNews from '@/pages/AdminNews';
import AdminCategories from '@/pages/AdminCategories';
import AdminBanners from '@/pages/AdminBanners';
import AdminTeam from '@/pages/AdminTeam';

import AdminAuthGuard from '@/components/auth/AdminAuthGuard';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/category/:categoryId" element={<Category />} />

      <Route path="/news/:slug" element={<NewsDetails />} />

      <Route path="/login" element={<Login />} />

      <Route element={<AdminAuthGuard />}>
        <Route path="/admin/news" element={<AdminNews />} />

        <Route path="/admin/categories" element={<AdminCategories />} />

        <Route path="/admin/banners" element={<AdminBanners />} />

        <Route path="/admin/team" element={<AdminTeam />} />
      </Route>
    </Routes>
  );
}

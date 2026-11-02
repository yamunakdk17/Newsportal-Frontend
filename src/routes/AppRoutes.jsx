import { Routes, Route } from 'react-router-dom';

import Home from '@/pages/Home';
import Category from '@/pages/Category';
import NewsDetails from '@/pages/NewsDetails';
import Login from '@/pages/Login';
import Admin from '@/pages/Admin';
import AdminNews from '@/pages/AdminNews';
import AdminCategories from '@/pages/AdminCategories';
import AdminBanners from '@/pages/AdminBanners';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* Category */}
      <Route path="/category/:categoryId" element={<Category />} />
      {/* News Details */}
      <Route path="/news/:slug" element={<NewsDetails />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={<Admin />} />

      {/* Admin News */}
      <Route path="/admin/news" element={<AdminNews />} />

      {/* Admin Categories */}
      <Route path="/admin/categories" element={<AdminCategories />} />

      <Route path="/admin/banners" element={<AdminBanners />} />
    </Routes>
  );
}

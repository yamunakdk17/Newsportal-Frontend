import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/services/api";
import AdminSidebar from "@/components/layout/AdminSidebar";

function Admin() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("tokenType");

    navigate("/login");
  };

  useEffect(() => {
    const getDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");

        console.log(
          "Dashboard response:",
          response.data
        );

        if (response.data.success) {
          setDashboard(response.data.data);
        } else {
          setError(
            response.data.message ||
              "Failed to load dashboard"
          );
        }
      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    getDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Area */}
      <div className="ml-64">

        {/* Header */}
        <header className="border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-6 py-5 md:px-10">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your news portal
              </p>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
            >
              Logout
            </button>

          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 md:p-10">

          <p className="mb-8 text-slate-600">
            Welcome back. Here's an overview of
            your news portal.
          </p>

          {/* Dashboard Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Total News */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total News
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {dashboard?.total ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                All news articles
              </p>
            </div>

            {/* Live News */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Live News
              </p>

              <h2 className="mt-3 text-3xl font-bold text-green-600">
                {dashboard?.live ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Currently published
              </p>
            </div>

            {/* Scheduled */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Scheduled
              </p>

              <h2 className="mt-3 text-3xl font-bold text-blue-600">
                {dashboard?.scheduled ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Scheduled articles
              </p>
            </div>

            {/* Categories */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Categories
              </p>

              <h2 className="mt-3 text-3xl font-bold text-purple-600">
                {dashboard?.categories ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                News categories
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/categories")
                }
                className="mt-4 text-sm font-semibold text-purple-600 hover:text-purple-700"
              >
                Manage Categories →
              </button>
            </div>

            {/* Banners */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Banners
              </p>

              <h2 className="mt-3 text-3xl font-bold text-orange-600">
                {dashboard?.banners ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Total banners
              </p>
            </div>

            {/* Active Banners */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Active Banners
              </p>

              <h2 className="mt-3 text-3xl font-bold text-emerald-600">
                {dashboard?.active_banners ?? 0}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Currently active
              </p>
            </div>

          </div>

          {/* Backend Connection */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-slate-900">
              Backend Connection
            </h2>

            <div className="mt-3 flex items-center gap-2">

              <span className="h-3 w-3 rounded-full bg-green-500" />

              <span className="text-sm text-slate-600">
                Dashboard API connected successfully
              </span>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default Admin;

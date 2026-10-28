import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/services/api";
import { dashboardData } from "@/data/newsData";

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
        // Real backend API call
        const response = await api.get("/admin/dashboard");

        console.log("Dashboard response:", response.data);

        // Store real API response
        setDashboard(response.data);
      } catch (error) {
        console.error("Dashboard error:", error);

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
      <div className="flex min-h-svh items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-gray-50">

      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your news portal
            </p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>

        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6 md:p-10">

        <p className="mb-8 text-gray-600">
          Welcome back. Here's an overview of your news portal.
        </p>

        {/* Dashboard Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Total News */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total News
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {dashboardData.total}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              All news articles
            </p>
          </div>

          {/* Live News */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Live News
            </p>

            <h2 className="mt-3 text-3xl font-bold text-green-600">
              {dashboardData.live}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Currently published
            </p>
          </div>

          {/* Scheduled */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Scheduled
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-600">
              {dashboardData.scheduled}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Scheduled articles
            </p>
          </div>

          {/* Categories */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Categories
            </p>

            <h2 className="mt-3 text-3xl font-bold text-purple-600">
              {dashboardData.categories}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              News categories
            </p>
          </div>

          {/* Banners */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Banners
            </p>

            <h2 className="mt-3 text-3xl font-bold text-orange-600">
              {dashboardData.banners}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Total banners
            </p>
          </div>

          {/* Active Banners */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Active Banners
            </p>

            <h2 className="mt-3 text-3xl font-bold text-emerald-600">
              {dashboardData.active_banners}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Currently active
            </p>
          </div>

        </div>

        {/* Backend Connection */}
        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">

          <h2 className="text-lg font-semibold text-gray-900">
            Backend Connection
          </h2>

          <div className="mt-3 flex items-center gap-2">

            <span className="h-3 w-3 rounded-full bg-green-500" />

            <span className="text-sm text-gray-600">
              Dashboard API connected successfully
            </span>

          </div>

        </div>

      </main>
    </div>
  );
}

export default Admin;

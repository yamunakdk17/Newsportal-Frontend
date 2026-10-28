import { Navigate, Outlet } from "react-router-dom";

function PublicRoute() {
  const token = localStorage.getItem("adminToken");

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default PublicRoute;

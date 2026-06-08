import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardPathForRole } from "../../utils/roleRedirect.js";

export function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-sm text-slate-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={dashboardPathForRole(user.role)} replace />;
}

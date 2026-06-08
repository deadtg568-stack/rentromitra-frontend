import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardPathForRole } from "../../utils/roleRedirect.js";

export function ProtectedRoute({ children, requireGuest = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-sm text-slate-600">Loading...</div>;
  if (requireGuest) {
    return user ? <Navigate to={dashboardPathForRole(user.role)} replace /> : children;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}

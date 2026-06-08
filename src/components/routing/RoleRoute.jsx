import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { dashboardPathForRole } from "../../utils/roleRedirect.js";

export function RoleRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8 text-center text-sm text-slate-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!roles.includes(user.role)) return <Navigate to={dashboardPathForRole(user.role)} replace />;

  return children;
}

export function AdminRoute({ children }) {
  return <RoleRoute roles={["admin"]}>{children}</RoleRoute>;
}

export function SuperAdminRoute({ children }) {
  return <RoleRoute roles={["superadmin"]}>{children}</RoleRoute>;
}

export function UserRoute({ children }) {
  return <RoleRoute roles={["user"]}>{children}</RoleRoute>;
}

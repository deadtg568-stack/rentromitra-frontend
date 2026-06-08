export function dashboardPathForRole(role) {
  if (role === "superadmin") return "/superadmin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/user/dashboard";
}

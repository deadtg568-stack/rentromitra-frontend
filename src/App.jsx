import { Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout.jsx";
import { DashboardRedirect } from "./components/routing/DashboardRedirect.jsx";
import { ProtectedRoute } from "./components/routing/ProtectedRoute.jsx";
import { AdminRoute, SuperAdminRoute, UserRoute } from "./components/routing/RoleRoute.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { ChatPage } from "./pages/chat/ChatPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage.jsx";
import { PropertyDetailsPage } from "./pages/PropertyDetailsPage.jsx";
import { UserDashboard } from "./pages/user/UserDashboard.jsx";
import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import { SuperAdminDashboard } from "./pages/super-admin/SuperAdminDashboard.jsx";
import { NotificationsPage } from "./pages/notifications/NotificationsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<HomePage />} />
        <Route path="/properties/:id" element={<PropertyDetailsPage />} />
        <Route
          path="/login"
          element={
            <ProtectedRoute requireGuest>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          }
        />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard initialTab="overview" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/add-property"
          element={
            <AdminRoute>
              <AdminDashboard initialTab="properties" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/manage-properties"
          element={
            <AdminRoute>
              <AdminDashboard initialTab="manage" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <AdminRoute>
              <AdminDashboard initialTab="bookings" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tenants"
          element={
            <AdminRoute>
              <AdminDashboard initialTab="tenants" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/chats"
          element={
            <AdminRoute>
              <AdminDashboard initialTab="chat" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminDashboard initialTab="profile" />
            </AdminRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route
          path="/superadmin/dashboard"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard initialTab="overview" />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/superadmin/manage-users"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard initialTab="users" />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/superadmin/manage-admins"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard initialTab="admins" />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/superadmin/approve-properties"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard initialTab="properties" />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/superadmin/complaints"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard initialTab="complaints" />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/superadmin/analytics"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard initialTab="analytics" />
            </SuperAdminRoute>
          }
        />
        <Route path="/super-admin" element={<Navigate to="/superadmin/dashboard" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

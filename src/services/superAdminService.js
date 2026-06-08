import { api } from "./apiClient.js";

export async function getSuperAdminDashboardData() {
  const [usersRes, propertiesRes, pendingRes, bookingsRes, complaintsRes] = await Promise.all([
    api.get("/users"),
    api.get("/properties/manage"),
    api.get("/superadmin/properties/pending"),
    api.get("/bookings"),
    api.get("/complaints")
  ]);

  return {
    users: usersRes.data.users || [],
    properties: propertiesRes.data.properties || [],
    pendingProperties: pendingRes.data.properties || [],
    bookings: bookingsRes.data.bookings || [],
    complaints: complaintsRes.data.complaints || []
  };
}

export async function createAdminAccount(payload) {
  const res = await api.post("/users/admins", payload);
  return res.data.user;
}

export async function updateUserStatus(id, isActive) {
  const res = await api.patch(`/users/${id}/status`, { isActive });
  return res.data.user;
}

export async function deleteAccount(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function updatePropertyApproval(id, status) {
  const action = status === "approved" ? "approve" : "reject";
  const res = await api.patch(`/superadmin/properties/${id}/${action}`);
  return res.data.property;
}

export async function updateComplaintStatus(id, status, resolutionNote = "") {
  const res = await api.patch(`/complaints/${id}`, { status, resolutionNote });
  return res.data.complaint;
}

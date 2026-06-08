import { api } from "./apiClient.js";

export async function getAdminDashboardData() {
  const [propertyRes, bookingRes] = await Promise.all([api.get("/admin/properties"), api.get("/bookings")]);

  return {
    properties: propertyRes.data.properties || [],
    bookings: bookingRes.data.bookings || []
  };
}

export async function createProperty(payload) {
  const res = await api.post("/properties", toPropertyFormData(payload));
  return res.data.property;
}

export async function uploadPropertyDraftImages(files) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const res = await api.post("/uploads/properties", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data.images || [];
}

export async function updateProperty(id, payload) {
  const res = await api.patch(`/properties/${id}`, toPropertyFormData(payload));
  return res.data.property;
}

export async function deleteProperty(id) {
  const res = await api.delete(`/properties/${id}`);
  return res.data;
}

export async function updateBookingStatus(id, status) {
  const res = await api.patch(`/bookings/${id}/status`, { status });
  return res.data.booking;
}

function toPropertyFormData(payload) {
  const formData = new FormData();
  const files = payload.imageFiles || [];

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "imageFiles" || value === undefined || value === null) return;
    if (Array.isArray(value) || typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }
    formData.append(key, value);
  });

  files.forEach((file) => formData.append("images", file));
  return formData;
}

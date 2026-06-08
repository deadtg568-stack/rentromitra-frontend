import { api } from "./apiClient.js";

export async function getProperties(params) {
  const res = await api.get("/properties", { params });
  return res.data;
}

export async function getProperty(id) {
  const res = await api.get(`/properties/${id}`);
  return res.data.property;
}

export async function toggleWishlist(propertyId) {
  const res = await api.post(`/wishlist/${propertyId}`);
  return res.data;
}

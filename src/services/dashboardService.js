import { api } from "./apiClient.js";

export async function getDashboardData() {
  const [bookingsRes, wishlistRes] = await Promise.all([api.get("/bookings"), api.get("/wishlist")]);

  return {
    bookings: bookingsRes.data.bookings || [],
    wishlist: wishlistRes.data.items || []
  };
}

export async function updateProfile(payload) {
  const res = await api.patch("/users/me", payload);
  return res.data.user;
}

export async function removeWishlistProperty(propertyId) {
  const res = await api.post(`/wishlist/${propertyId}`);
  return res.data;
}

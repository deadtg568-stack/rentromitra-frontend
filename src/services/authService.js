import { api } from "./apiClient.js";

export async function loginUser(credentials) {
  const res = await api.post("/auth/login", credentials);
  return res.data;
}

export async function registerUser(payload) {
  const res = await api.post("/auth/user/register", payload);
  return res.data;
}

export async function registerAdmin(payload) {
  const res = await api.post("/auth/admin/register", payload);
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data.user;
}

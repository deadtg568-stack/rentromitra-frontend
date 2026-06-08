import { api } from "./apiClient.js";

export async function getAreas() {
  const res = await api.get("/locations/areas");
  return res.data.areas || [];
}

export async function getColleges() {
  const res = await api.get("/locations/colleges");
  return res.data.colleges || [];
}

export async function searchLocations(query) {
  const res = await api.get("/locations/search", { params: { query } });
  return res.data.results || [];
}

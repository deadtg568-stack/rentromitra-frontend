import axios from "axios";



export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});
const API_BASE_URL = "https://rentromitra-backend.onrender.com/api";
if (import.meta.env.DEV) {
  console.log("[Rentomitra API] baseURL:", API_BASE_URL);
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rentromitra_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  if (import.meta.env.DEV) {
    console.log("[Rentomitra API] request:", config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

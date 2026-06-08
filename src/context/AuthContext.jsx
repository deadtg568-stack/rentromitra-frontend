import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, loginUser, registerAdmin, registerUser } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("rentromitra_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((currentUser) => setUser(currentUser))
      .catch(() => localStorage.removeItem("rentromitra_token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await loginUser(credentials);
    localStorage.setItem("rentromitra_token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await registerUser(payload);
    localStorage.setItem("rentromitra_token", data.token);
    setUser(data.user);
    return data.user;
  }

  async function adminSignup(payload) {
    const data = await registerAdmin(payload);
    localStorage.setItem("rentromitra_token", data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("rentromitra_token");
    setUser(null);
  }

  function updateUser(nextUser) {
    setUser(nextUser);
  }

  const value = useMemo(() => ({ user, loading, login, register, adminSignup, logout, updateUser }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

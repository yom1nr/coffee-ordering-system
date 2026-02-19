import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://coffee-ordering-system-qcm3.onrender.com",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ──── Request Interceptor ────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ──── Response Interceptor ────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Auto logout on 401 (expired/invalid token)
      if (status === 401) {
        const currentPath = window.location.pathname;
        if (currentPath !== "/login" && currentPath !== "/register") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

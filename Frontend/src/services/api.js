import axios from "axios";

export const api = axios.create({
  baseURL: "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("devmatrix_token") || localStorage.getItem("devmatrix_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear all stored credentials when token is expired or server restarted
      sessionStorage.removeItem("devmatrix_token");
      sessionStorage.removeItem("devmatrix_user");
      localStorage.removeItem("devmatrix_token");
      localStorage.removeItem("devmatrix_user");

      if (window.location.pathname.startsWith("/client") || window.location.pathname.startsWith("/admin")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

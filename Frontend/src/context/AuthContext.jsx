import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to persist session in sessionStorage only (clears when browser/tab closes)
  const saveSession = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    sessionStorage.setItem("devmatrix_user", JSON.stringify(userData));
    sessionStorage.setItem("devmatrix_token", accessToken);
    // Remove from localStorage so account does not persist across terminal/server restarts
    localStorage.removeItem("devmatrix_user");
    localStorage.removeItem("devmatrix_token");
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("devmatrix_user");
    sessionStorage.removeItem("devmatrix_token");
    localStorage.removeItem("devmatrix_user");
    localStorage.removeItem("devmatrix_token");
  };

  useEffect(() => {
    const fetchMe = async () => {
      // Clean up any stale localStorage tokens from previous versions
      localStorage.removeItem("devmatrix_user");
      localStorage.removeItem("devmatrix_token");

      const savedToken = sessionStorage.getItem("devmatrix_token");
      if (!savedToken) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/api/auth/me");
        if (res.data?.success && res.data?.user) {
          saveSession(res.data.user, savedToken);
        } else {
          clearSession();
        }
      } catch (err) {
        // If server was restarted, terminated, or token expired, log out cleanly
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    if (res.data?.success) {
      const { user: userData, accessToken } = res.data;
      saveSession(userData, accessToken);
      return { success: true, user: userData };
    }
    return { success: false, message: res.data?.message || "Login failed" };
  };

  const register = async (formData) => {
    const res = await api.post("/api/auth/register", formData);
    return res.data;
  };

  const verifyEmail = async (email, otp) => {
    const res = await api.post("/api/auth/verify-email", { email, otp });
    if (res.data?.success && res.data?.accessToken) {
      const { user: userData, accessToken } = res.data;
      saveSession(userData, accessToken);
    }
    return res.data;
  };

  const resendOTP = async (email) => {
    const res = await api.post("/api/auth/resend-otp", { email });
    return res.data;
  };

  const logout = async () => {
    try {
      await api.get("/api/auth/logout");
    } catch (e) {
      // ignore
    }
    clearSession();
  };

  const handleOAuthLogin = (userData, accessToken) => {
    saveSession(userData, accessToken);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyEmail,
        resendOTP,
        logout,
        handleOAuthLogin,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === "admin",
        isClient: user?.role === "client",
        isDeveloper: user?.role === "developer",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;

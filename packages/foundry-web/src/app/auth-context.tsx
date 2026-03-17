"use client";

import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const scheduleTokenRefresh = useCallback((accessToken: string) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = payload.exp * 1000;
      const refreshIn = Math.max(0, expiresAt - Date.now() - 60000);

      if (refreshIn > 0 && refreshIn < 86400000) { // sanity: max 24h
        refreshTimeoutRef.current = setTimeout(async () => {
          const rt = localStorage.getItem("refreshToken");
          if (!rt || !mountedRef.current) return;
          try {
            const res = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: rt }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.accessToken && mountedRef.current) {
                localStorage.setItem("accessToken", data.accessToken);
                if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
                scheduleTokenRefresh(data.accessToken);
              }
            } else if (mountedRef.current) {
              clearAuth();
            }
          } catch {
            if (mountedRef.current) clearAuth();
          }
        }, refreshIn);
      }
    } catch {
      // Invalid token, ignore
    }
  }, [clearAuth]);

  // Initialize auth on mount — runs once
  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    async function init() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          scheduleTokenRefresh(token);
        } else if (res.status === 401) {
          // Try refresh
          const rt = localStorage.getItem("refreshToken");
          if (rt) {
            const refreshRes = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: rt }),
            });
            if (cancelled) return;
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.success && refreshData.accessToken) {
                localStorage.setItem("accessToken", refreshData.accessToken);
                if (refreshData.refreshToken) localStorage.setItem("refreshToken", refreshData.refreshToken);
                // Fetch user with new token
                const userRes = await fetch("/api/auth/me", {
                  headers: { Authorization: `Bearer ${refreshData.accessToken}` },
                });
                if (cancelled) return;
                if (userRes.ok) {
                  const userData = await userRes.json();
                  setUser(userData.user);
                  scheduleTokenRefresh(refreshData.accessToken);
                } else {
                  clearAuth();
                }
              } else {
                clearAuth();
              }
            } else {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      } catch {
        if (!cancelled) clearAuth();
      }

      if (!cancelled) setIsLoading(false);
    }

    init();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserWithToken = async (token: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        scheduleTokenRefresh(token);
      }
    } catch {
      // ignore
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        await fetchUserWithToken(data.accessToken);
        return { success: true };
      }
      return { success: false, error: data.error || "Login failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.accessToken && data.refreshToken) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          await fetchUserWithToken(data.accessToken);
        }
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  const logout = useCallback(() => clearAuth(), [clearAuth]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

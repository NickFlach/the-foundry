"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

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

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
  }, [refreshTimeout]);

  const scheduleTokenRefresh = useCallback((accessToken: string) => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }

    try {
      // Parse JWT to get expiry (simple base64 decode of payload)
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expiresAt = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const refreshIn = Math.max(0, expiresAt - now - 60000); // Refresh 1 minute before expiry

      if (refreshIn > 0) {
        const timeoutId = setTimeout(async () => {
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const response = await fetch("/api/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
              });

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.accessToken) {
                  localStorage.setItem("accessToken", data.accessToken);
                  if (data.refreshToken) {
                    localStorage.setItem("refreshToken", data.refreshToken);
                  }
                  scheduleTokenRefresh(data.accessToken);
                }
              } else {
                // Refresh failed, clear auth
                clearAuth();
              }
            } catch (error) {
              console.error("Token refresh failed:", error);
              clearAuth();
            }
          }
        }, refreshIn);

        setRefreshTimeout(timeoutId);
      }
    } catch (error) {
      console.error("Failed to parse token for refresh scheduling:", error);
    }
  }, [refreshTimeout, clearAuth]);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        scheduleTokenRefresh(token);
        return true;
      } else if (response.status === 401) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          try {
            const refreshResponse = await fetch("/api/auth/refresh", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              if (refreshData.success && refreshData.accessToken) {
                localStorage.setItem("accessToken", refreshData.accessToken);
                if (refreshData.refreshToken) {
                  localStorage.setItem("refreshToken", refreshData.refreshToken);
                }
                // Retry fetching user with new token
                return await fetchUser(refreshData.accessToken);
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }
        
        // Refresh failed or not available, clear auth
        clearAuth();
        return false;
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
    return false;
  }, [scheduleTokenRefresh, clearAuth]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await fetchUser(accessToken);
      }
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        await fetchUser(data.accessToken);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Registration successful, data might include tokens for auto-login
        if (data.accessToken && data.refreshToken) {
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);
          await fetchUser(data.accessToken);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const logout = () => {
    clearAuth();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
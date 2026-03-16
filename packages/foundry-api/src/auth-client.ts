/**
 * SpaceChild Auth Client
 * 
 * Thin wrapper for authenticating against auth.spacechild.love.
 * Used by The Foundry to verify tokens and proxy auth requests.
 */

const AUTH_URL = process.env.SPACECHILD_AUTH_URL || "https://auth.spacechild.love";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isEmailVerified: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  requiresVerification?: boolean;
  requiresMfa?: boolean;
  partialToken?: string;
  availableMethods?: string[];
}

async function authFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${AUTH_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return res.json();
}

/** Register a new user */
export async function register(email: string, password: string, firstName?: string, lastName?: string): Promise<AuthResponse> {
  return authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
}

/** Login with email/password */
export async function login(email: string, password: string): Promise<AuthResponse> {
  return authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/** Refresh an access token */
export async function refreshToken(refreshToken: string): Promise<AuthResponse> {
  return authFetch("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

/** Verify an access token and get the user */
export async function verifyToken(accessToken: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${AUTH_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/** Get the auth service health */
export async function authHealth(): Promise<{ status: string; service: string }> {
  return authFetch("/health");
}

import { apiUrl } from "@/utils/api";
import type { ModulePermission, PermissionsMap } from "@/utils/permissions";

export interface AdminSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  roleName: string;
  roleSlug: string;
  isSuperAdmin: boolean;
  canChangePassword: boolean;
  isActive: boolean;
  accessLevel: "Full" | "Limited";
  permissions: PermissionsMap;
  modules?: { key: string; label: string; path: string }[];
}

/** @deprecated Use AdminSession */
export interface Admin extends AdminSession {
  role?: string;
}

const TOKEN_KEY = "token";
const ADMIN_KEY = "admin";
const DASHBOARD_SESSION_KEY = "dashboard_session_active";

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

function purgeLegacyLocalAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export const activateDashboardSession = (): void => {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.setItem(DASHBOARD_SESSION_KEY, String(Date.now()));
};

export const isDashboardSessionActive = (): boolean => {
  const storage = getSessionStorage();
  if (!storage) return false;
  return Boolean(storage.getItem(DASHBOARD_SESSION_KEY));
};

export const getToken = (): string | null => {
  const storage = getSessionStorage();
  if (!storage) return null;
  return storage.getItem(TOKEN_KEY);
};

export const getAdmin = (): AdminSession | null => {
  const storage = getSessionStorage();
  if (!storage) return null;
  const admin = storage.getItem(ADMIN_KEY);
  return admin ? JSON.parse(admin) : null;
};

export const isAdmin = (): boolean => {
  const admin = getAdmin();
  return Boolean(admin?.roleSlug || admin?.isSuperAdmin);
};

export const setAuth = (token: string, admin: AdminSession): void => {
  const storage = getSessionStorage();
  if (!storage) return;
  purgeLegacyLocalAuth();
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(ADMIN_KEY, JSON.stringify(admin));
  activateDashboardSession();
};

export const clearAuth = (): void => {
  const storage = getSessionStorage();
  if (!storage) return;
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(ADMIN_KEY);
  storage.removeItem(DASHBOARD_SESSION_KEY);
  purgeLegacyLocalAuth();
};

export const endDashboardSession = (): void => {
  clearAuth();
};

export const isAuthenticated = (): boolean => {
  return Boolean(getToken() && isDashboardSessionActive());
};

export const logout = async (): Promise<void> => {
  const token = getToken();
  if (token) {
    try {
      await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  endDashboardSession();
};

export async function validateAuthSession(): Promise<AdminSession | null> {
  const token = getToken();
  if (!token || !isDashboardSessionActive()) {
    endDashboardSession();
    return null;
  }

  try {
    const response = await fetch(apiUrl("/api/auth/verify"), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      endDashboardSession();
      return null;
    }

    const data = await response.json();
    if (!data?.admin) {
      endDashboardSession();
      return null;
    }

    setAuth(token, data.admin);
    return data.admin as AdminSession;
  } catch {
    endDashboardSession();
    return null;
  }
}

export const fetchProtectedRoute = async (url: string) => {
  const token = getToken();
  if (!token || !isDashboardSessionActive()) {
    endDashboardSession();
    throw new Error("Not authenticated");
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      endDashboardSession();
      throw new Error("Session expired");
    }
    throw new Error("Request failed");
  }

  return response.json();
};

export type { ModulePermission, PermissionsMap };

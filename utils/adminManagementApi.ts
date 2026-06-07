import { apiUrl } from "@/utils/api";
import { authHeaders } from "@/utils/specialitiesApi";
import type { ModulePermission } from "@/utils/permissions";

export interface AdminRole {
  id: string;
  name: string;
  slug: string;
  description: string;
  accessLevel: "Full" | "Limited";
  isSystem: boolean;
  permissions: Record<string, ModulePermission>;
  memberCount?: number;
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string | null;
  roleName: string;
  roleSlug: string;
  access: "Full" | "Limited";
  isSuperAdmin: boolean;
  canChangePassword: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface PasswordResetRequestItem {
  id: string;
  email: string;
  note: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  member: AdminMember | null;
}

export interface AuditLogItem {
  id: string;
  action: string;
  actorEmail: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
}

export interface AdminManagementOverview {
  stats: {
    totalMembers: number;
    activeMembers: number;
    totalRoles: number;
    pendingPasswordRequests: number;
  };
  roles: AdminRole[];
  groupedMembers: Record<string, AdminMember[]>;
  members: AdminMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  passwordRequests: PasswordResetRequestItem[];
  auditLogs: AuditLogItem[];
  modules: { key: string; label: string; path: string }[];
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data as T;
}

export async function fetchAdminManagementOverview(params?: {
  search?: string;
  page?: number;
  limit?: number;
  roleSlug?: string;
}): Promise<AdminManagementOverview> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.roleSlug) query.set("roleSlug", params.roleSlug);

  const response = await fetch(
    apiUrl(`/api/admin-management/overview?${query.toString()}`),
    { headers: authHeaders(), cache: "no-store" }
  );
  return parseResponse(response);
}

export async function fetchAdminRoles(): Promise<AdminRole[]> {
  const response = await fetch(apiUrl("/api/admin-management/roles"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  const data = await parseResponse<{ roles: AdminRole[] }>(response);
  return data.roles;
}

export async function createAdminMember(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleSlug: string;
  canChangePassword?: boolean;
  permissions?: Record<string, ModulePermission>;
}): Promise<AdminMember> {
  const response = await fetch(apiUrl("/api/admin-management/members"), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<{ member: AdminMember }>(response);
  return data.member;
}

export async function updateAdminMember(
  id: string,
  payload: Partial<{
    firstName: string;
    lastName: string;
    roleSlug: string;
    isActive: boolean;
    canChangePassword: boolean;
  }>
): Promise<AdminMember> {
  const response = await fetch(apiUrl(`/api/admin-management/members/${id}`), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<{ member: AdminMember }>(response);
  return data.member;
}

export async function resetAdminMemberPassword(
  id: string,
  payload: {
    password: string;
    grantPasswordChange?: boolean;
    sendEmail?: boolean;
  }
): Promise<{ message: string; emailed: boolean; member: AdminMember }> {
  const response = await fetch(
    apiUrl(`/api/admin-management/members/${id}/reset-password`),
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }
  );
  const data = await parseResponse<{
    message: string;
    emailed: boolean;
    member: AdminMember;
  }>(response);
  return {
    message: data.message,
    emailed: Boolean(data.emailed),
    member: data.member,
  };
}

export async function deleteAdminMember(id: string): Promise<void> {
  const response = await fetch(apiUrl(`/api/admin-management/members/${id}`), {
    method: "DELETE",
    headers: authHeaders(),
  });
  await parseResponse(response);
}

export async function updateRolePermissions(
  roleId: string,
  permissions: Record<string, ModulePermission>
): Promise<AdminRole> {
  const response = await fetch(
    apiUrl(`/api/admin-management/roles/${roleId}/permissions`),
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ permissions }),
    }
  );
  const data = await parseResponse<{ role: AdminRole }>(response);
  return data.role;
}

export async function resolvePasswordRequest(
  id: string,
  payload?: {
    tempPassword?: string;
    grantPasswordChange?: boolean;
    resolutionNote?: string;
    sendEmail?: boolean;
  }
): Promise<{ message: string; emailed: boolean }> {
  const response = await fetch(
    apiUrl(`/api/admin-management/password-requests/${id}/resolve`),
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload || {}),
    }
  );
  const data = await parseResponse<{ message: string; emailed: boolean }>(response);
  return { message: data.message, emailed: Boolean(data.emailed) };
}

export async function fetchLoginRoles(): Promise<
  { name: string; slug: string; description: string; accessLevel: string }[]
> {
  const response = await fetch(apiUrl("/api/auth/roles"), { cache: "no-store" });
  const data = await parseResponse<{
    roles: { name: string; slug: string; description: string; accessLevel: string }[];
  }>(response);
  return data.roles;
}

export async function requestPasswordReset(payload: {
  email: string;
  note?: string;
}): Promise<string> {
  const response = await fetch(apiUrl("/api/auth/password-reset-request"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await parseResponse<{ message: string }>(response);
  return data.message;
}

export async function verifyAdminSession() {
  const response = await fetch(apiUrl("/api/auth/verify"), {
    headers: authHeaders(),
    cache: "no-store",
  });
  return parseResponse<{ admin: import("@/utils/auth").AdminSession }>(response);
}

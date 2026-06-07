"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { usePermissions } from "@/context/PermissionsContext";
import {
  ArrowLeft,
  Plus,
  Save,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  KeyRound,
  Mail,
  Ban,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { ModulePermission } from "@/utils/permissions";
import {
  fetchAdminManagementOverview,
  fetchAdminRoles,
  createAdminMember,
  updateAdminMember,
  resetAdminMemberPassword,
  deleteAdminMember,
  resolvePasswordRequest,
  type AdminMember,
  type AdminRole,
  type AdminManagementOverview,
  type PasswordResetRequestItem,
} from "@/utils/adminManagementApi";

function generateRandomPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  let password = "";
  for (let i = 0; i < length; i += 1) {
    password += chars.charAt(randomValues[i] % chars.length);
  }
  return password;
}

function Toggle({
  checked,
  onChange,
  isDark,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  isDark: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 disabled:opacity-40"
      style={{ backgroundColor: checked ? "#591727" : isDark ? "#5C2A3A" : "#D3D3D3" }}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function roleBadgeClass(roleName: string) {
  if (roleName === "Super Admin") return "text-white bg-[#591727] border border-[#591727]";
  if (roleName === "Manager") return "text-white bg-[#753141] border border-[#753141]";
  if (roleName === "Marketing Manager") return "text-[#711c31] bg-[#d3d3d3] border border-[#C94A3A]";
  return "text-white bg-[#894646] border border-[#894646]";
}

function accessBadgeClass(access: string) {
  if (access === "Full") {
    return "text-[#711c31] border border-[#C94A3A] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
  }
  return "text-[#753141] border border-[#D3D3D3] bg-[#d3d3d3] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
}

function statusBadgeClass(isActive: boolean) {
  if (isActive) {
    return "text-white bg-[#591727] border border-[#591727]";
  }
  return "text-[#711c31] bg-[#d3d3d3] border border-[#894646]";
}

function Avatar({ name, color }: { name: string; color: string }) {
  const palette = ["#591727", "#753141", "#894646", "#711C31", "#8B1A2E", "#B09070"];
  const bg = color || palette[name.charCodeAt(0) % palette.length];
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
      style={{ backgroundColor: bg }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AdminManagementPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { session, canEditModule, refreshSession } = usePermissions();
  const canEdit = canEditModule("admin_management");
  const isSuperAdmin = Boolean(session?.isSuperAdmin);

  const card = isDark ? "#c9a898" : "#f0f0f0";
  const cardInner = isDark ? "#d0baa3" : "#FFFFFF";
  const text1 = "#591727";
  const text2 = "#591727";
  const brand = "#591727";
  const borderCol = "#753141";
  const tableBg = isDark ? "#c1a694" : "#FDFAF4";
  const inputBg = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#5C2A3A" : "#D9C9A8";
  const rowHover = isDark ? "#d0baa3" : "#F5ECD7";

  const [view, setView] = useState<"list" | "add">("list");
  const [overview, setOverview] = useState<AdminManagementOverview | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleSlug, setNewRoleSlug] = useState("");
  const [permissions, setPermissions] = useState<Record<string, ModulePermission>>({});
  const [activePasswordRequest, setActivePasswordRequest] =
    useState<PasswordResetRequestItem | null>(null);
  const [resolvePassword, setResolvePassword] = useState("");
  const [sendPasswordEmail, setSendPasswordEmail] = useState(true);
  const [grantPasswordChange, setGrantPasswordChange] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolvingPassword, setResolvingPassword] = useState(false);
  const [activeMemberPassword, setActiveMemberPassword] = useState<AdminMember | null>(null);
  const [memberNewPassword, setMemberNewPassword] = useState("");
  const [memberSendEmail, setMemberSendEmail] = useState(true);
  const [memberGrantPasswordChange, setMemberGrantPasswordChange] = useState(false);
  const [savingMemberPassword, setSavingMemberPassword] = useState(false);
  const [blockingMemberId, setBlockingMemberId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, rolesData] = await Promise.all([
        fetchAdminManagementOverview({ search, page, limit: 8 }),
        fetchAdminRoles(),
      ]);
      setOverview(overviewData);
      setRoles(rolesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin management data");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedRole = useMemo(
    () => roles.find((role) => role.slug === newRoleSlug) || null,
    [roles, newRoleSlug]
  );

  useEffect(() => {
    if (selectedRole) {
      setPermissions(JSON.parse(JSON.stringify(selectedRole.permissions)));
    } else {
      setPermissions({});
    }
  }, [selectedRole]);

  const handlePermissionChange = (
    moduleKey: string,
    type: "view" | "edit",
    value: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        view: type === "view" ? value : prev[moduleKey]?.view ?? false,
        edit:
          type === "edit"
            ? value
            : value
              ? prev[moduleKey]?.edit ?? false
              : prev[moduleKey]?.edit ?? false,
      },
    }));
  };

  const handleSaveMember = async () => {
    if (!canEdit || !isSuperAdmin) return;
    if (!newEmail.trim() || !newPassword || !newRoleSlug) {
      setError("Email, password, and role are required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const member = await createAdminMember({
        email: newEmail.trim(),
        password: newPassword,
        firstName: newFirstName.trim(),
        lastName: newLastName.trim(),
        roleSlug: newRoleSlug,
        permissions: selectedRole?.slug === "super-admin" ? undefined : permissions,
      });
      setSuccessMessage(`New member "${member.name}" has been created successfully.`);
      setView("list");
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPassword("");
      setNewRoleSlug("");
      setPermissions({});
      await loadData();
      await refreshSession();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create member");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member: AdminMember) => {
    if (!canEdit || !isSuperAdmin || member.isSuperAdmin) return;
    if (!window.confirm(`Delete ${member.name}? This cannot be undone.`)) return;
    try {
      setError(null);
      await deleteAdminMember(member.id);
      setSuccessMessage(`"${member.name}" has been removed.`);
      if (activeMemberPassword?.id === member.id) setActiveMemberPassword(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete member");
    }
  };

  const openMemberPasswordPanel = (member: AdminMember) => {
    closePasswordResolvePanel();
    setActiveMemberPassword(member);
    setMemberNewPassword(generateRandomPassword());
    setMemberSendEmail(true);
    setMemberGrantPasswordChange(member.canChangePassword);
    setError(null);
  };

  const closeMemberPasswordPanel = () => {
    setActiveMemberPassword(null);
    setMemberNewPassword("");
    setSavingMemberPassword(false);
  };

  const handleSaveMemberPassword = async () => {
    if (!canEdit || !isSuperAdmin || !activeMemberPassword) return;
    if (!memberNewPassword.trim() || memberNewPassword.trim().length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSavingMemberPassword(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await resetAdminMemberPassword(activeMemberPassword.id, {
        password: memberNewPassword.trim(),
        grantPasswordChange: memberGrantPasswordChange,
        sendEmail: memberSendEmail,
      });
      setSuccessMessage(result.message);
      closeMemberPasswordPanel();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingMemberPassword(false);
    }
  };

  const handleToggleBlock = async (member: AdminMember) => {
    if (!canEdit || !isSuperAdmin || member.isSuperAdmin) return;
    const nextActive = !member.isActive;
    const actionLabel = nextActive ? "unblock" : "block";
    if (!window.confirm(`${nextActive ? "Unblock" : "Block"} ${member.name}?`)) return;

    setBlockingMemberId(member.id);
    setError(null);
    try {
      await updateAdminMember(member.id, { isActive: nextActive });
      setSuccessMessage(
        nextActive
          ? `"${member.name}" has been unblocked.`
          : `"${member.name}" has been blocked.`
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${actionLabel} member`);
    } finally {
      setBlockingMemberId(null);
    }
  };

  const openPasswordResolvePanel = (request: PasswordResetRequestItem) => {
    closeMemberPasswordPanel();
    setActivePasswordRequest(request);
    setResolvePassword(generateRandomPassword());
    setSendPasswordEmail(true);
    setGrantPasswordChange(false);
    setResolutionNote("");
    setError(null);
  };

  const closePasswordResolvePanel = () => {
    setActivePasswordRequest(null);
    setResolvePassword("");
    setResolutionNote("");
    setResolvingPassword(false);
  };

  const handleResolvePassword = async () => {
    if (!canEdit || !isSuperAdmin || !activePasswordRequest) return;
    if (!resolvePassword.trim() || resolvePassword.trim().length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setResolvingPassword(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await resolvePasswordRequest(activePasswordRequest.id, {
        tempPassword: resolvePassword.trim(),
        grantPasswordChange,
        sendEmail: sendPasswordEmail,
        resolutionNote: resolutionNote.trim() || "Password reset resolved by Super Admin",
      });
      setSuccessMessage(result.message);
      closePasswordResolvePanel();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve password request");
    } finally {
      setResolvingPassword(false);
    }
  };

  const modules = overview?.modules || [];

  if (view === "add") {
    return (
      <div className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 transition-colors duration-300" style={{ marginTop: 40 }}>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
          <button
            type="button"
            onClick={() => setView("list")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ borderColor: borderCol, color: text1, backgroundColor: cardInner }}
          >
            <ArrowLeft size={15} />
            Go Back
          </button>
          <button
            type="button"
            onClick={handleSaveMember}
            disabled={saving || !canEdit}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="rounded-2xl border p-4 md:p-8" style={{ borderColor: borderCol, backgroundColor: card }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: isDark ? "#fff" : text1 }}>
            Add Member
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "First Name", value: newFirstName, onChange: setNewFirstName },
              { label: "Last Name", value: newLastName, onChange: setNewLastName },
            ].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-semibold mb-2" style={{ color: text1 }}>
                  {field.label}
                </label>
                <input
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: text1 }}>
                Email Address *
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: text1 }}>
                Temporary Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: text1 }}>
                Select Role *
              </label>
              <select
                value={newRoleSlug}
                onChange={(e) => setNewRoleSlug(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
              >
                <option value="">Select a role</option>
                {roles
                  .filter((role) => role.slug !== "super-admin")
                  .map((role) => (
                    <option key={role.id} value={role.slug}>
                      {role.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {selectedRole && selectedRole.slug !== "super-admin" && (
            <div className="rounded-2xl border overflow-hidden mt-6" style={{ borderColor: borderCol, backgroundColor: tableBg }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: borderCol, backgroundColor: cardInner }}>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: text2 }}>
                  Roles & Permissions
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[720px]">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                      <th className="text-left py-4 px-5" style={{ color: text2 }}>
                        Module
                      </th>
                      {modules.map((mod) => (
                        <th key={mod.key} className="py-4 px-2 text-center text-[12px]" style={{ color: text1 }}>
                          {mod.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-4 px-5" style={{ color: text2 }}>
                        <div className="flex items-center gap-2">
                          <Eye size={14} /> View
                        </div>
                      </td>
                      {modules.map((mod) => (
                        <td key={`${mod.key}-view`} className="py-4 px-2 text-center">
                          <Toggle
                            checked={permissions[mod.key]?.view ?? false}
                            onChange={() =>
                              handlePermissionChange(mod.key, "view", !permissions[mod.key]?.view)
                            }
                            isDark={isDark}
                            disabled={!canEdit}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-5" style={{ color: text2 }}>
                        <div className="flex items-center gap-2">
                          <Pencil size={14} /> Edit
                        </div>
                      </td>
                      {modules.map((mod) => (
                        <td key={`${mod.key}-edit`} className="py-4 px-2 text-center">
                          <Toggle
                            checked={permissions[mod.key]?.edit ?? false}
                            onChange={() =>
                              handlePermissionChange(mod.key, "edit", !permissions[mod.key]?.edit)
                            }
                            isDark={isDark}
                            disabled={!canEdit}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full ml-10 max-sm:ml-0 max-sm:px-3 transition-colors duration-300" style={{ marginTop: 40 }}>
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <h1 className="text-3xl max-sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : brand }}>
          Admin Management
        </h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="w-10 h-10 rounded-xl border flex items-center justify-center"
            style={{ borderColor: borderCol, color: text2, backgroundColor: cardInner }}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          {canEdit && isSuperAdmin && (
            <button
              type="button"
              onClick={() => setView("add")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
            >
              <Plus size={16} />
              Add Member
            </button>
          )}
        </div>
      </div>

      {successMessage && (
        <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#eef8ee", color: "#2f6b2f" }}>
          {successMessage}
        </p>
      )}

      {error && (
        <p className="text-sm mb-4 px-4 py-2 rounded-xl" style={{ backgroundColor: "#fde8e8", color: "#b00020" }}>
          {error}
        </p>
      )}

      {loading && !overview ? (
        <p style={{ color: text2 }}>Loading admin data...</p>
      ) : overview ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Members", value: overview.stats.totalMembers },
              { label: "Active Members", value: overview.stats.activeMembers },
              { label: "Roles", value: overview.stats.totalRoles },
              { label: "Password Requests", value: overview.stats.pendingPasswordRequests },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border p-4"
                style={{ borderColor: borderCol, backgroundColor: card }}
              >
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: text2 }}>
                  {stat.label}
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: text1 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            {overview.roles.map((role) => (
              <div
                key={role.id}
                className="flex-1 min-w-[210px] rounded-2xl border p-5"
                style={{ borderColor: borderCol, backgroundColor: card }}
              >
                <h6 className="font-semibold text-base mb-3 text-center" style={{ color: text1 }}>
                  {role.name}
                </h6>
                <div className="w-full h-px mb-4" style={{ backgroundColor: borderCol, opacity: 0.35 }} />
                <div className="space-y-3">
                  {(overview.groupedMembers[role.slug] || []).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar name={member.name} color="" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: text1 }}>
                          {member.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: text2 }}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(overview.groupedMembers[role.slug] || []).length === 0 && (
                    <p className="text-xs text-center py-2" style={{ color: text2 }}>
                      No members
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border overflow-hidden mb-6" style={{ backgroundColor: tableBg, borderColor: borderCol }}>
            <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-3" style={{ borderBottom: `1px solid ${borderCol}`, backgroundColor: cardInner }}>
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: text2 }}>
                Details
              </span>
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border" style={{ borderColor: borderCol, backgroundColor: inputBg }}>
                  <Search size={15} style={{ color: text2 }} />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search members..."
                    className="flex-1 bg-transparent outline-none text-sm min-w-0"
                    style={{ color: text1 }}
                  />
                </div>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-40"
                  style={{ borderColor: borderCol, color: text2 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={page >= overview.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center disabled:opacity-40"
                  style={{ borderColor: borderCol, color: text2 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px] hidden sm:table">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                    {["Sr. No.", "Name", "Email", "Role", "Access", "Status", "Action"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[13px] font-medium" style={{ color: text2 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overview.members.map((member, index) => (
                    <Fragment key={member.id}>
                      <tr
                        style={{
                          borderBottom:
                            activeMemberPassword?.id === member.id
                              ? "none"
                              : `1px solid ${borderCol}`,
                          opacity: member.isActive ? 1 : 0.72,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = rowHover;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td className="px-5 py-3" style={{ color: text2 }}>
                          {String((overview.pagination.page - 1) * overview.pagination.limit + index + 1).padStart(2, "0")}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={member.name} color="" />
                            <span className="font-semibold" style={{ color: text1 }}>
                              {member.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3" style={{ color: text2 }}>
                          {member.email}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded text-xs font-semibold ${roleBadgeClass(member.roleName)}`}>
                            {member.roleName}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={accessBadgeClass(member.access)}>{member.access}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-semibold ${statusBadgeClass(member.isActive)}`}
                          >
                            {member.isActive ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {canEdit && isSuperAdmin && !member.isSuperAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  activeMemberPassword?.id === member.id
                                    ? closeMemberPasswordPanel()
                                    : openMemberPasswordPanel(member)
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-80"
                                style={{ borderColor: borderCol, color: text1, backgroundColor: cardInner }}
                                title="Change password"
                              >
                                <KeyRound size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleBlock(member)}
                                disabled={blockingMemberId === member.id}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border hover:opacity-80 disabled:opacity-40"
                                style={{ borderColor: borderCol, color: text1, backgroundColor: cardInner }}
                                title={member.isActive ? "Block user" : "Unblock user"}
                              >
                                {member.isActive ? <Ban size={15} /> : <ShieldCheck size={15} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(member)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border hover:bg-red-50"
                                style={{ borderColor: borderCol, color: "#8b1a2e", backgroundColor: cardInner }}
                                title="Delete member"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                          {member.isSuperAdmin && (
                            <span className="text-xs" style={{ color: text2 }}>
                              Protected
                            </span>
                          )}
                        </td>
                      </tr>
                      {activeMemberPassword?.id === member.id && (
                        <tr style={{ borderBottom: `1px solid ${borderCol}` }}>
                          <td colSpan={7} className="px-5 py-4" style={{ backgroundColor: cardInner }}>
                            <div className="rounded-xl border p-4 space-y-4" style={{ borderColor: borderCol }}>
                              <p className="text-sm font-semibold" style={{ color: text1 }}>
                                Change password for {member.name}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                <input
                                  type="text"
                                  value={memberNewPassword}
                                  onChange={(e) => setMemberNewPassword(e.target.value)}
                                  placeholder="Enter new password (min 6 characters)"
                                  className="flex-1 min-w-[200px] rounded-xl px-4 py-2.5 text-sm border outline-none"
                                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setMemberNewPassword(generateRandomPassword())}
                                  className="px-3 py-2.5 rounded-xl text-xs font-semibold border shrink-0"
                                  style={{ borderColor: borderCol, color: text1, backgroundColor: inputBg }}
                                >
                                  Generate Random
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-5">
                                <label className="flex items-center gap-2 text-sm" style={{ color: text1 }}>
                                  <Toggle
                                    checked={memberSendEmail}
                                    onChange={() => setMemberSendEmail((v) => !v)}
                                    isDark={isDark}
                                  />
                                  <Mail size={14} />
                                  Send password to user email
                                </label>
                                <label className="flex items-center gap-2 text-sm" style={{ color: text1 }}>
                                  <Toggle
                                    checked={memberGrantPasswordChange}
                                    onChange={() => setMemberGrantPasswordChange((v) => !v)}
                                    isDark={isDark}
                                  />
                                  <KeyRound size={14} />
                                  Allow user to change password in Settings
                                </label>
                              </div>
                              <button
                                type="button"
                                onClick={handleSaveMemberPassword}
                                disabled={savingMemberPassword}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                                style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
                              >
                                <Save size={15} />
                                {savingMemberPassword
                                  ? "Saving..."
                                  : memberSendEmail
                                    ? "Save & Email Password"
                                    : "Save Password Only"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: borderCol, backgroundColor: tableBg }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: borderCol, backgroundColor: cardInner }}>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: text2 }}>
                  Password Reset Requests
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: borderCol }}>
                {overview.passwordRequests.length === 0 ? (
                  <p className="px-5 py-6 text-sm" style={{ color: text2 }}>
                    No pending password requests
                  </p>
                ) : (
                  overview.passwordRequests.map((request) => (
                    <div key={request.id} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm" style={{ color: text1 }}>
                            {request.email}
                          </p>
                          {request.note && (
                            <p className="text-xs mt-1" style={{ color: text2 }}>
                              {request.note}
                            </p>
                          )}
                          <p className="text-[11px] mt-1" style={{ color: text2 }}>
                            {new Date(request.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {canEdit && isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              activePasswordRequest?.id === request.id
                                ? closePasswordResolvePanel()
                                : openPasswordResolvePanel(request)
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
                            style={{ backgroundColor: brand }}
                          >
                            {activePasswordRequest?.id === request.id ? "Cancel" : "Reset Password"}
                          </button>
                        )}
                      </div>

                      {activePasswordRequest?.id === request.id && (
                        <div
                          className="mt-4 rounded-xl border p-4 space-y-4"
                          style={{ borderColor: borderCol, backgroundColor: cardInner }}
                        >
                          <p className="text-sm font-semibold" style={{ color: text1 }}>
                            Set new password for {request.email}
                          </p>

                          <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: text2 }}>
                              New Password *
                            </label>
                            <div className="flex gap-2 flex-wrap">
                              <input
                                type="text"
                                value={resolvePassword}
                                onChange={(e) => setResolvePassword(e.target.value)}
                                placeholder="Enter password (min 6 characters)"
                                className="flex-1 min-w-[200px] rounded-xl px-4 py-2.5 text-sm border outline-none"
                                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                              />
                              <button
                                type="button"
                                onClick={() => setResolvePassword(generateRandomPassword())}
                                className="px-3 py-2.5 rounded-xl text-xs font-semibold border shrink-0"
                                style={{ borderColor: borderCol, color: text1, backgroundColor: inputBg }}
                              >
                                Generate Random
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: text2 }}>
                              Note (optional)
                            </label>
                            <input
                              value={resolutionNote}
                              onChange={(e) => setResolutionNote(e.target.value)}
                              placeholder="Internal note for this reset"
                              className="w-full rounded-xl px-4 py-2.5 text-sm border outline-none"
                              style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                            />
                          </div>

                          <div className="flex flex-wrap gap-5">
                            <label className="flex items-center gap-2 text-sm" style={{ color: text1 }}>
                              <Toggle
                                checked={sendPasswordEmail}
                                onChange={() => setSendPasswordEmail((v) => !v)}
                                isDark={isDark}
                              />
                              <Mail size={14} />
                              Send password to user email
                            </label>
                            <label className="flex items-center gap-2 text-sm" style={{ color: text1 }}>
                              <Toggle
                                checked={grantPasswordChange}
                                onChange={() => setGrantPasswordChange((v) => !v)}
                                isDark={isDark}
                              />
                              <KeyRound size={14} />
                              Allow user to change password in Settings
                            </label>
                          </div>

                          <button
                            type="button"
                            onClick={handleResolvePassword}
                            disabled={resolvingPassword}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                            style={{ backgroundColor: isDark ? "#8B1A2E" : brand }}
                          >
                            <Save size={15} />
                            {resolvingPassword
                              ? "Saving..."
                              : sendPasswordEmail
                                ? "Save & Email Password"
                                : "Save Password Only"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: borderCol, backgroundColor: tableBg }}>
              <div className="px-5 py-3 border-b" style={{ borderColor: borderCol, backgroundColor: cardInner }}>
                <span className="text-xs font-bold tracking-widest uppercase" style={{ color: text2 }}>
                  Recent Activity
                </span>
              </div>
              <div className="divide-y max-h-[360px] overflow-y-auto" style={{ borderColor: borderCol }}>
                {overview.auditLogs.length === 0 ? (
                  <p className="px-5 py-6 text-sm" style={{ color: text2 }}>
                    No activity logged yet
                  </p>
                ) : (
                  overview.auditLogs.map((log) => (
                    <div key={log.id} className="px-5 py-4">
                      <p className="text-sm font-semibold" style={{ color: text1 }}>
                        {log.summary || log.action}
                      </p>
                      <p className="text-xs mt-1" style={{ color: text2 }}>
                        {log.actorEmail || "System"} · {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

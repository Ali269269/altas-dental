import { apiUrl } from "@/utils/api";
import { getToken } from "@/utils/auth";
import {
  DEFAULT_SETTINGS_OVERVIEW,
  mergeSettingsOverview,
  type AlertPreferences,
  type BusinessHourEntry,
  type SettingsOverview,
  type SettingsProfile,
} from "@/utils/settingsData";

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function fetchSettingsOverview(): Promise<SettingsOverview> {
  const token = getToken();
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(apiUrl("/api/settings"), {
    headers: authHeaders(),
    cache: "no-store",
  });

  const json = await parseJson(response);
  if (!response.ok) {
    throw new Error(json.message || `Request failed (${response.status})`);
  }

  return mergeSettingsOverview(json.data);
}

export async function updateSettingsProfile(payload: {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
}): Promise<SettingsProfile> {
  const response = await fetch(apiUrl("/api/settings/profile"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to update profile");
  return { ...DEFAULT_SETTINGS_OVERVIEW.profile, ...json.data };
}

export async function uploadSettingsProfilePhoto(file: File): Promise<{
  profilePhoto: string;
  profilePhotoPath: string;
}> {
  const token = getToken();
  if (!token) throw new Error("Authentication required.");

  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(apiUrl("/api/settings/profile-photo"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to upload profile photo");
  return json.data;
}

export async function removeSettingsProfilePhoto(): Promise<void> {
  const response = await fetch(apiUrl("/api/settings/profile-photo"), {
    method: "DELETE",
    headers: authHeaders(),
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to remove profile photo");
}

export async function changeSettingsPassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ passwordChangedLabel: string }> {
  const response = await fetch(apiUrl("/api/settings/password"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to change password");
  return json.data;
}

export async function updateSettingsSecurity(twoFactorEnabled: boolean): Promise<SettingsProfile> {
  const response = await fetch(apiUrl("/api/settings/security"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ twoFactorEnabled }),
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to update security settings");
  return { ...DEFAULT_SETTINGS_OVERVIEW.profile, ...json.data };
}

export async function updateSettingsAlerts(payload: AlertPreferences): Promise<AlertPreferences> {
  const response = await fetch(apiUrl("/api/settings/alerts"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to update alert preferences");
  return json.data;
}

export async function updateSettingsClinic(payload: {
  clinicName: string;
  clinicEmail: string;
  primaryContact: string;
  address: string;
}): Promise<SettingsOverview["clinic"]> {
  const response = await fetch(apiUrl("/api/settings/clinic"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to update clinic preferences");
  return { ...DEFAULT_SETTINGS_OVERVIEW.clinic, ...json.data };
}

export async function updateSettingsBusinessHours(
  businessHours: BusinessHourEntry[]
): Promise<BusinessHourEntry[]> {
  const response = await fetch(apiUrl("/api/settings/business-hours"), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ businessHours }),
  });
  const json = await parseJson(response);
  if (!response.ok) throw new Error(json.message || "Failed to update business hours");
  return json.data;
}

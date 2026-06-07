import { apiUrl } from "@/utils/api";
import { DEFAULT_SETTINGS_OVERVIEW } from "@/utils/settingsData";

export type PublicBusinessHour = {
  label: string;
  closed: boolean;
  display: string;
};

export type PublicClinicInfo = {
  clinicName: string;
  clinicEmail: string;
  primaryContact: string;
  address: string;
  businessHours: PublicBusinessHour[];
};

export const DEFAULT_PUBLIC_CLINIC: PublicClinicInfo = {
  clinicName: DEFAULT_SETTINGS_OVERVIEW.clinic.clinicName,
  clinicEmail: "contact@atlasdentalcenter.com",
  primaryContact: DEFAULT_SETTINGS_OVERVIEW.clinic.primaryContact,
  address: DEFAULT_SETTINGS_OVERVIEW.clinic.address,
  businessHours: DEFAULT_SETTINGS_OVERVIEW.clinic.businessHours.map((entry) => ({
    label: entry.label,
    closed: entry.closed,
    display: entry.closed ? "Off" : `${entry.start}–${entry.end}`,
  })),
};

export async function fetchPublicClinicInfo(): Promise<PublicClinicInfo> {
  try {
    const response = await fetch(apiUrl("/api/settings/public"), {
      cache: "no-store",
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok || !json.data) {
      return DEFAULT_PUBLIC_CLINIC;
    }
    return {
      ...DEFAULT_PUBLIC_CLINIC,
      ...json.data,
      businessHours:
        json.data.businessHours?.length > 0
          ? json.data.businessHours
          : DEFAULT_PUBLIC_CLINIC.businessHours,
    };
  } catch {
    return DEFAULT_PUBLIC_CLINIC;
  }
}

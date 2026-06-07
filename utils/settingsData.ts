export type BusinessHourEntry = {
  label: string;
  start: string;
  end: string;
  closed: boolean;
};

export type AlertPreferences = {
  appointmentSms: boolean;
  clinicReports: boolean;
  marketingEmails: boolean;
};

export type SettingsProfile = {
  id: string;
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  profilePhoto: string;
  profilePhotoPath: string;
  twoFactorEnabled: boolean;
  alertPreferences: AlertPreferences;
  passwordChangedAt: string | null;
  passwordChangedLabel: string;
  lastLogin: string | null;
};

export type SettingsClinic = {
  clinicName: string;
  clinicEmail: string;
  primaryContact: string;
  address: string;
  businessHours: BusinessHourEntry[];
};

export type SettingsOverview = {
  profile: SettingsProfile;
  clinic: SettingsClinic;
};

export const DEFAULT_BUSINESS_HOURS: BusinessHourEntry[] = [
  { label: "Mon - Fri", start: "08:00", end: "18:00", closed: false },
  { label: "Saturday", start: "09:00", end: "14:00", closed: false },
  { label: "Sunday", start: "00:00", end: "00:00", closed: true },
];

export const DEFAULT_SETTINGS_OVERVIEW: SettingsOverview = {
  profile: {
    id: "",
    fullName: "",
    professionalTitle: "",
    email: "",
    phone: "",
    profilePhoto: "",
    profilePhotoPath: "",
    twoFactorEnabled: false,
    alertPreferences: {
      appointmentSms: true,
      clinicReports: true,
      marketingEmails: false,
    },
    passwordChangedAt: null,
    passwordChangedLabel: "Never changed",
    lastLogin: null,
  },
  clinic: {
    clinicName: "Atlas Dental Center",
    clinicEmail: "contact@atlasdentalcenter.com",
    primaryContact: "05 37 77 77 79 · 06 68 20 10 10",
    address:
      "Ang Av Atlas, 61 rue Oued Oum Errabi n. 5, 2ème étage, Agdal - RABAT",
    businessHours: DEFAULT_BUSINESS_HOURS,
  },
};

export function mergeSettingsOverview(data: Partial<SettingsOverview> | undefined): SettingsOverview {
  return {
    profile: {
      ...DEFAULT_SETTINGS_OVERVIEW.profile,
      ...(data?.profile ?? {}),
      alertPreferences: {
        ...DEFAULT_SETTINGS_OVERVIEW.profile.alertPreferences,
        ...(data?.profile?.alertPreferences ?? {}),
      },
    },
    clinic: {
      ...DEFAULT_SETTINGS_OVERVIEW.clinic,
      ...(data?.clinic ?? {}),
      businessHours:
        data?.clinic?.businessHours?.length
          ? data.clinic.businessHours
          : DEFAULT_SETTINGS_OVERVIEW.clinic.businessHours,
    },
  };
}

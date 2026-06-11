const fs = require('fs');
const path = require('path');
const ClinicSettings = require('../models/ClinicSettings');

const DEFAULT_BUSINESS_HOURS = [
  { label: 'Lundi - Vendredi', start: '08:00', end: '18:00', closed: false },
  { label: 'Samedi', start: '09:00', end: '14:00', closed: false },
  { label: 'Dimanche', start: '00:00', end: '00:00', closed: true },
];

const DEFAULT_CLINIC = {
  clinicName: 'Atlas Dental Center',
  primaryContact: '05 37 77 77 79 · 06 68 20 10 10',
  clinicEmail: 'contact@atlasdentalcenter.com',
  address:
    'Ang Av Atlas, 61 rue Oued Oum Errabi n. 5, 2ème étage, Agdal - RABAT',
};

function getApiBaseUrl() {
  return (
    process.env.API_PUBLIC_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, '');
}

function resolvePublicAssetUrl(storedPath) {
  if (!storedPath) return '';
  if (/^https?:\/\//i.test(storedPath)) return storedPath;
  const normalized = storedPath.startsWith('/') ? storedPath : `/${storedPath}`;
  return `${getApiBaseUrl()}${normalized}`;
}

function formatPasswordChangedLabel(date) {
  if (!date) return 'Never changed';
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 86400000) return 'Changed today';
  const days = Math.floor(diff / 86400000);
  if (days === 1) return 'Changed 1 day ago';
  if (days < 30) return `Changed ${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return 'Changed 1 month ago';
  return `Changed ${months} months ago`;
}

function normalizeBusinessHours(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return DEFAULT_BUSINESS_HOURS.map((entry) => ({ ...entry }));
  }

  return entries.map((entry) => ({
    label: String(entry.label || '').trim(),
    start: String(entry.start || '08:00').trim(),
    end: String(entry.end || '18:00').trim(),
    closed: Boolean(entry.closed),
  }));
}

async function getOrCreateClinicSettings() {
  let settings = await ClinicSettings.findOne({ singletonKey: 'default' });
  if (!settings) {
    settings = await ClinicSettings.create({
      singletonKey: 'default',
      ...DEFAULT_CLINIC,
      businessHours: DEFAULT_BUSINESS_HOURS,
    });
  } else if (!settings.businessHours?.length) {
    settings.businessHours = DEFAULT_BUSINESS_HOURS;
    await settings.save();
  }
  return settings;
}

function mapAdminSettings(admin) {
  const fullName =
    String(admin.displayName || '').trim() ||
    `${admin.firstName || ''} ${admin.lastName || ''}`.trim();

  return {
    id: admin._id.toString(),
    fullName,
    professionalTitle: admin.professionalTitle || '',
    email: admin.email || '',
    phone: admin.phone || '',
    profilePhoto: resolvePublicAssetUrl(admin.profilePhoto),
    profilePhotoPath: admin.profilePhoto || '',
    twoFactorEnabled: Boolean(admin.twoFactorEnabled),
    alertPreferences: {
      appointmentSms: admin.alertPreferences?.appointmentSms !== false,
      clinicReports: admin.alertPreferences?.clinicReports !== false,
      marketingEmails: Boolean(admin.alertPreferences?.marketingEmails),
    },
    passwordChangedAt: admin.passwordChangedAt || admin.updatedAt || null,
    passwordChangedLabel: formatPasswordChangedLabel(
      admin.passwordChangedAt || admin.updatedAt
    ),
    lastLogin: admin.lastLogin || null,
  };
}

function formatTime12Hour(timeValue) {
  const match = String(timeValue || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeValue || '';
  let hour = Number(match[1]);
  const minute = match[2];
  const suffix = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12 || 12;
  if (minute === '00') return `${hour}${suffix}`;
  return `${hour}:${minute}${suffix}`;
}

function formatBusinessHourDisplay(entry) {
  if (entry.closed) return 'Off';
  return `${formatTime12Hour(entry.start)}–${formatTime12Hour(entry.end)}`;
}

function mapClinicSettings(settings) {
  const businessHours = normalizeBusinessHours(settings.businessHours);
  return {
    clinicName: settings.clinicName || DEFAULT_CLINIC.clinicName,
    primaryContact: settings.primaryContact || DEFAULT_CLINIC.primaryContact,
    clinicEmail: settings.clinicEmail || DEFAULT_CLINIC.clinicEmail,
    address: settings.address || DEFAULT_CLINIC.address,
    businessHours,
  };
}

function mapPublicClinicSettings(settings) {
  const clinic = mapClinicSettings(settings);
  return {
    clinicName: clinic.clinicName,
    clinicEmail: clinic.clinicEmail,
    primaryContact: clinic.primaryContact,
    address: clinic.address,
    businessHours: clinic.businessHours.map((entry) => ({
      label: entry.label,
      closed: entry.closed,
      display: formatBusinessHourDisplay(entry),
    })),
  };
}

function mapSettingsResponse(admin, clinicSettings) {
  return {
    profile: mapAdminSettings(admin),
    clinic: mapClinicSettings(clinicSettings),
  };
}

function deleteStoredProfilePhoto(storedPath) {
  if (!storedPath || /^https?:\/\//i.test(storedPath)) return;
  const relative = storedPath.replace(/^\/uploads\/profiles\//, '');
  if (!relative || relative.includes('..')) return;
  const filePath = path.join(__dirname, '..', 'uploads', 'profiles', relative);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_CLINIC,
  deleteStoredProfilePhoto,
  formatBusinessHourDisplay,
  formatPasswordChangedLabel,
  getOrCreateClinicSettings,
  mapPublicClinicSettings,
  mapSettingsResponse,
  normalizeBusinessHours,
  resolvePublicAssetUrl,
};

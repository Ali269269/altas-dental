const DASHBOARD_MODULES = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'appointments', label: 'Appointments', path: '/dashboard/Appointments' },
  { key: 'patients', label: 'Patients', path: '/dashboard/Patients' },
  { key: 'admin_management', label: 'Admin Management', path: '/dashboard/Admin_Management' },
  { key: 'marketing', label: 'Marketing', path: '/dashboard/Marketing' },
  { key: 'analytics', label: 'Analytics', path: '/dashboard/Analytics' },
  { key: 'blogs', label: 'Blogs', path: '/dashboard/Blogs' },
  { key: 'subscribers', label: 'Subscribers', path: '/dashboard/Subcribers' },
  { key: 'specialities', label: 'Specialities', path: '/dashboard/Specialities' },
  { key: 'settings', label: 'Settings', path: '/dashboard/Settings' },
];

const MODULE_KEYS = DASHBOARD_MODULES.map((m) => m.key);

function buildFullPermissions(value = { view: true, edit: true }) {
  return Object.fromEntries(MODULE_KEYS.map((key) => [key, { ...value }]));
}

function buildPermissionsFromPreset(preset) {
  return Object.fromEntries(
    MODULE_KEYS.map((key) => [key, { view: false, edit: false, ...(preset[key] || {}) }])
  );
}

const DEFAULT_ROLE_PERMISSIONS = {
  'super-admin': buildFullPermissions({ view: true, edit: true }),
  manager: buildPermissionsFromPreset({
    dashboard: { view: true, edit: true },
    appointments: { view: true, edit: true },
    patients: { view: true, edit: true },
    marketing: { view: true, edit: true },
    analytics: { view: true, edit: true },
    blogs: { view: true, edit: true },
    subscribers: { view: true, edit: true },
    specialities: { view: true, edit: true },
    admin_management: { view: false, edit: false },
    settings: { view: true, edit: false },
  }),
  'marketing-manager': buildPermissionsFromPreset({
    dashboard: { view: true, edit: false },
    analytics: { view: true, edit: false },
    marketing: { view: true, edit: true },
    blogs: { view: true, edit: true },
    subscribers: { view: true, edit: true },
  }),
  accountant: buildPermissionsFromPreset({
    dashboard: { view: true, edit: false },
    analytics: { view: true, edit: false },
    appointments: { view: true, edit: false },
    patients: { view: true, edit: false },
  }),
};

const SYSTEM_ROLES = [
  {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Full system access and control over all modules.',
    isSystem: true,
    accessLevel: 'Full',
  },
  {
    name: 'Manager',
    slug: 'manager',
    description: 'Operational access across most dashboard modules.',
    isSystem: true,
    accessLevel: 'Limited',
  },
  {
    name: 'Marketing Manager',
    slug: 'marketing-manager',
    description: 'Marketing, blogs, and subscriber management.',
    isSystem: true,
    accessLevel: 'Limited',
  },
  {
    name: 'Accountant',
    slug: 'accountant',
    description: 'Read-only access to dashboard, analytics, and patient data.',
    isSystem: true,
    accessLevel: 'Limited',
  },
];

module.exports = {
  DASHBOARD_MODULES,
  MODULE_KEYS,
  DEFAULT_ROLE_PERMISSIONS,
  SYSTEM_ROLES,
  buildFullPermissions,
  buildPermissionsFromPreset,
};

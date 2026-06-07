const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const {
  MODULE_KEYS,
  DASHBOARD_MODULES,
  buildFullPermissions,
} = require('../constants/dashboardModules');

function normalizePermissions(input) {
  if (!input) return buildFullPermissions({ view: false, edit: false });

  const source = input instanceof Map ? Object.fromEntries(input.entries()) : input;
  const result = {};

  MODULE_KEYS.forEach((key) => {
    const value = source[key] || {};
    result[key] = {
      view: Boolean(value.view),
      edit: Boolean(value.edit),
    };
  });

  return result;
}

async function resolveAdminPermissions(admin) {
  if (!admin) return buildFullPermissions({ view: false, edit: false });
  if (admin.isSuperAdmin) return buildFullPermissions({ view: true, edit: true });

  if (!admin.roleId) {
    return buildFullPermissions({ view: false, edit: false });
  }

  const role = admin.roleId?.permissions
    ? admin.roleId
    : await Role.findById(admin.roleId);

  if (!role) {
    return buildFullPermissions({ view: false, edit: false });
  }

  return role.toPermissionObject();
}

function hasPermission(permissions, moduleKey, action = 'view') {
  const modulePerm = permissions?.[moduleKey];
  if (!modulePerm) return false;
  if (action === 'edit') return Boolean(modulePerm.view && modulePerm.edit);
  return Boolean(modulePerm.view);
}

async function buildAdminSession(adminDoc) {
  const Admin = require('../models/Admin');
  const populated = await Admin.findById(adminDoc._id || adminDoc).populate('roleId');
  if (!populated) {
    throw new Error('Admin not found');
  }

  const permissions = await resolveAdminPermissions(populated);
  const role = populated.roleId;

  return {
    id: populated._id.toString(),
    email: populated.email,
    firstName: populated.firstName || '',
    lastName: populated.lastName || '',
    displayName: populated.displayName || '',
    roleName: populated.isSuperAdmin ? 'Super Admin' : role?.name || 'Unassigned',
    roleSlug: populated.isSuperAdmin ? 'super-admin' : role?.slug || '',
    isSuperAdmin: Boolean(populated.isSuperAdmin),
    canChangePassword: Boolean(populated.canChangePassword),
    isActive: Boolean(populated.isActive),
    accessLevel: populated.isSuperAdmin ? 'Full' : role?.accessLevel || 'Limited',
    permissions,
    modules: DASHBOARD_MODULES,
  };
}

function generateTemporaryPassword(length = 12) {
  const { randomInt } = require('crypto');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$';
  let password = '';
  for (let i = 0; i < length; i += 1) {
    password += chars.charAt(randomInt(chars.length));
  }
  return password;
}

async function writeAuditLog({
  action,
  actor,
  targetType = '',
  targetId = '',
  summary = '',
  metadata = {},
}) {
  await AuditLog.create({
    action,
    actor: actor?._id || actor?.id || null,
    actorEmail: actor?.email || '',
    targetType,
    targetId: targetId ? String(targetId) : '',
    summary,
    metadata,
  });
}

module.exports = {
  normalizePermissions,
  resolveAdminPermissions,
  hasPermission,
  buildAdminSession,
  generateTemporaryPassword,
  writeAuditLog,
  MODULE_KEYS,
  DASHBOARD_MODULES,
};

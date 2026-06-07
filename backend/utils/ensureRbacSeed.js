const { randomUUID } = require('crypto');
const Admin = require('../models/Admin');
const Role = require('../models/Role');
const {
  SYSTEM_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
} = require('../constants/dashboardModules');

const isProduction = process.env.NODE_ENV === 'production';

function getSuperAdminEmail() {
  const email = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email && isProduction) {
    throw new Error('SUPER_ADMIN_EMAIL is required in production');
  }
  return email || 'admin@localhost.dev';
}

function getSuperAdminPassword() {
  const password = process.env.SUPER_ADMIN_PASSWORD || '';
  if (!password && isProduction) {
    throw new Error('SUPER_ADMIN_PASSWORD is required in production');
  }
  return password || 'DevOnly-ChangeMe-NotForProduction!';
}

async function backfillAdminUuids() {
  const admins = await Admin.find({
    $or: [{ uuid: { $exists: false } }, { uuid: null }, { uuid: '' }],
  }).select('_id');

  for (const admin of admins) {
    await Admin.updateOne({ _id: admin._id }, { $set: { uuid: randomUUID() } });
  }
}

async function ensureRbacSeed() {
  await backfillAdminUuids();
  const roleMap = new Map();

  for (const roleDef of SYSTEM_ROLES) {
    let role = await Role.findOne({ slug: roleDef.slug });
    const permissions = DEFAULT_ROLE_PERMISSIONS[roleDef.slug] || {};

    if (!role) {
      role = await Role.create({
        ...roleDef,
        permissions: new Map(Object.entries(permissions)),
      });
    } else if (!role.permissions || role.permissions.size === 0) {
      role.permissions = new Map(Object.entries(permissions));
      await role.save();
    }

    roleMap.set(role.slug, role);
  }

  const superRole = roleMap.get('super-admin');
  if (!superRole) return;

  const SUPER_ADMIN_EMAIL = getSuperAdminEmail();
  const SUPER_ADMIN_PASSWORD = getSuperAdminPassword();

  let admin = await Admin.findOne({ email: SUPER_ADMIN_EMAIL }).select('+password');
  if (!admin) {
    await Admin.create({
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      firstName: 'Dr',
      lastName: 'Ghita',
      displayName: 'Dr Ghita',
      roleId: superRole._id,
      isSuperAdmin: true,
      canChangePassword: true,
      isActive: true,
    });
    console.log(`[rbac] Super Admin provisioned: ${SUPER_ADMIN_EMAIL}`);
    return;
  }

  let changed = false;
  if (!admin.roleId || admin.roleId.toString() !== superRole._id.toString()) {
    admin.roleId = superRole._id;
    changed = true;
  }
  if (!admin.isSuperAdmin) {
    admin.isSuperAdmin = true;
    changed = true;
  }
  if (!admin.isActive) {
    admin.isActive = true;
    changed = true;
  }
  if (process.env.FORCE_SUPER_ADMIN_PASSWORD === 'true') {
    admin.password = SUPER_ADMIN_PASSWORD;
    changed = true;
  }
  if (changed) {
    await admin.save();
    console.log(
      process.env.FORCE_SUPER_ADMIN_PASSWORD === 'true'
        ? `[rbac] Super Admin updated (password reset from .env): ${SUPER_ADMIN_EMAIL}`
        : `[rbac] Super Admin updated: ${SUPER_ADMIN_EMAIL}`
    );
  }

  const legacyAdmins = await Admin.find({ email: { $ne: SUPER_ADMIN_EMAIL } });
  const managerRole = roleMap.get('manager');
  for (const legacy of legacyAdmins) {
    let legacyChanged = false;
    if (!legacy.roleId && managerRole) {
      legacy.roleId = managerRole._id;
      legacyChanged = true;
    }
    if (legacy.isSuperAdmin) {
      legacy.isSuperAdmin = false;
      legacyChanged = true;
    }
    if (legacy.canChangePassword == null) {
      legacy.canChangePassword = false;
      legacyChanged = true;
    }
    if (legacyChanged) await legacy.save();
  }
}

module.exports = { ensureRbacSeed };

const dotenv = require('dotenv');
const dns = require('dns');
const mongoose = require('mongoose');

dotenv.config();

dns.setServers(['8.8.8.8', '1.1.1.1']);
const Admin = require('../models/Admin');
const Role = require('../models/Role');
const {
  SYSTEM_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
} = require('../constants/dashboardModules');

const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL || 'drghita101@gmail.com'
).trim().toLowerCase();

const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!';

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
}

async function seedRoles() {
  const roleMap = new Map();

  for (const roleDef of SYSTEM_ROLES) {
    let role = await Role.findOne({ slug: roleDef.slug });
    const permissions = DEFAULT_ROLE_PERMISSIONS[roleDef.slug] || {};

    if (!role) {
      role = await Role.create({
        ...roleDef,
        permissions: new Map(Object.entries(permissions)),
      });
      console.log(`Created role: ${role.name}`);
    } else {
      role.name = roleDef.name;
      role.description = roleDef.description;
      role.accessLevel = roleDef.accessLevel;
      role.isSystem = roleDef.isSystem;
      if (!role.permissions || role.permissions.size === 0) {
        role.permissions = new Map(Object.entries(permissions));
      }
      await role.save();
      console.log(`Updated role: ${role.name}`);
    }

    roleMap.set(role.slug, role);
  }

  return roleMap;
}

async function seedSuperAdmin(roleMap) {
  const superRole = roleMap.get('super-admin');
  if (!superRole) throw new Error('Super Admin role missing');

  let admin = await Admin.findOne({ email: SUPER_ADMIN_EMAIL }).select('+password');

  if (!admin) {
    admin = await Admin.create({
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
    console.log(`Created Super Admin: ${SUPER_ADMIN_EMAIL}`);
  } else {
    admin.roleId = superRole._id;
    admin.isSuperAdmin = true;
    admin.isActive = true;
    admin.canChangePassword = true;
    if (process.env.FORCE_SUPER_ADMIN_PASSWORD === 'true') {
      admin.password = SUPER_ADMIN_PASSWORD;
    }
    await admin.save();
    console.log(`Updated Super Admin: ${SUPER_ADMIN_EMAIL}`);
  }
}

async function migrateLegacyAdmins(roleMap) {
  const managerRole = roleMap.get('manager');
  const admins = await Admin.find({ email: { $ne: SUPER_ADMIN_EMAIL } });

  for (const admin of admins) {
    let changed = false;
    if (!admin.roleId && managerRole) {
      admin.roleId = managerRole._id;
      changed = true;
    }
    if (admin.isSuperAdmin == null) {
      admin.isSuperAdmin = false;
      changed = true;
    }
    if (admin.canChangePassword == null) {
      admin.canChangePassword = false;
      changed = true;
    }
    if (changed) {
      await admin.save();
      console.log(`Migrated admin: ${admin.email}`);
    }
  }
}

async function seedRbac() {
  try {
    await connectDB();
    const roleMap = await seedRoles();
    await seedSuperAdmin(roleMap);
    await migrateLegacyAdmins(roleMap);
    console.log('RBAC seed completed successfully');
    console.log(`Super Admin email: ${SUPER_ADMIN_EMAIL}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Super Admin password: ${SUPER_ADMIN_PASSWORD}`);
    }
  } catch (error) {
    console.error('RBAC seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedRbac();

const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Role = require('../models/Role');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const AuditLog = require('../models/AuditLog');
const {
  MODULE_KEYS,
  DASHBOARD_MODULES,
  DEFAULT_ROLE_PERMISSIONS,
} = require('../constants/dashboardModules');
const {
  normalizePermissions,
  generateTemporaryPassword,
  writeAuditLog,
} = require('../utils/rbacHelpers');
const { sendAdminPasswordResetEmail } = require('../utils/emailService');

function toIdString(value) {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  // ObjectId defines `_id` as a getter that returns itself — must check before unwrapping `_id`.
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (value._id != null && value._id !== value) return toIdString(value._id);
  if (typeof value.toString === 'function') {
    const str = value.toString();
    return str && str !== '[object Object]' ? str : null;
  }
  return null;
}

function toPlainDocument(doc) {
  if (!doc) return null;
  if (typeof doc.toObject === 'function') return doc.toObject();
  return { ...doc };
}

function resolveMemberRole(roleField, roleMap) {
  if (!roleField) return null;
  if (roleField.name && roleField.slug) return roleField;
  const roleId = toIdString(roleField);
  return (roleId && roleMap.get(roleId)) || roleField;
}

function serializeRole(role) {
  const id = toIdString(role?._id);
  if (!id) {
    throw new Error('Cannot serialize role without id');
  }

  return {
    id,
    name: role.name,
    slug: role.slug,
    description: role.description || '',
    accessLevel: role.accessLevel,
    isSystem: Boolean(role.isSystem),
    permissions: role.toPermissionObject(),
    memberCount: role.memberCount || 0,
  };
}

function serializeMember(admin) {
  const id = toIdString(admin?._id || admin?.id);
  if (!id) return null;

  const role = admin.roleId;
  const roleId = toIdString(role?._id || role);

  return {
    id,
    name:
      admin.displayName?.trim()
      || `${admin.firstName || ''} ${admin.lastName || ''}`.trim()
      || admin.email,
    email: admin.email,
    firstName: admin.firstName || '',
    lastName: admin.lastName || '',
    roleId,
    roleName: admin.isSuperAdmin ? 'Super Admin' : role?.name || 'Unassigned',
    roleSlug: admin.isSuperAdmin ? 'super-admin' : role?.slug || '',
    access: admin.isSuperAdmin ? 'Full' : role?.accessLevel || 'Limited',
    isSuperAdmin: Boolean(admin.isSuperAdmin),
    canChangePassword: Boolean(admin.canChangePassword),
    isActive: Boolean(admin.isActive),
    lastLogin: admin.lastLogin,
    createdAt: admin.createdAt,
  };
}

async function applyPermissionsToRole(role, permissions) {
  const normalized = normalizePermissions(permissions);
  role.permissions = new Map(Object.entries(normalized));
  await role.save();
  return role;
}

exports.getOverview = async (req, res) => {
  const {
    search = '',
    page = 1,
    limit = 10,
    roleSlug = '',
  } = req.query;

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(limit) || 10));
  const skip = (pageNum - 1) * pageSize;

  const memberQuery = {};
  if (search.trim()) {
    const { escapeRegex } = require('../utils/securityHelpers');
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    memberQuery.$or = [
      { email: regex },
      { firstName: regex },
      { lastName: regex },
      { displayName: regex },
    ];
  }

  const roles = await Role.find().sort({ name: 1 }).lean();
  const roleDocs = await Role.find();
  const roleMap = new Map(roleDocs.map((r) => [toIdString(r._id), r]));

  const members = await Admin.find(memberQuery)
    .populate('roleId')
    .sort({ createdAt: -1 });

  let filteredMembers = members;
  if (roleSlug) {
    filteredMembers = members.filter((member) => {
      if (roleSlug === 'super-admin') return member.isSuperAdmin;
      return member.roleId?.slug === roleSlug;
    });
  }

  const total = filteredMembers.length;
  const pagedMembers = filteredMembers.slice(skip, skip + pageSize);

  const grouped = {};
  roleDocs.forEach((role) => {
    const roleId = toIdString(role._id);
    grouped[role.slug] = members
      .filter(
        (m) => !m.isSuperAdmin && toIdString(m.roleId?._id || m.roleId) === roleId
      )
      .map(serializeMember)
      .filter(Boolean);
  });
  grouped['super-admin'] = members
    .filter((m) => m.isSuperAdmin)
    .map(serializeMember)
    .filter(Boolean);

  const rolesWithCounts = roleDocs.map((role) => ({
    ...serializeRole(role),
    memberCount: grouped[role.slug]?.length || 0,
  }));

  const pendingPasswordRequests = await PasswordResetRequest.countDocuments({
    status: 'pending',
  });

  const passwordRequests = await PasswordResetRequest.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('admin', 'email firstName lastName displayName');

  const recentAuditLogs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json({
    success: true,
    stats: {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.isActive).length,
      totalRoles: rolesWithCounts.length,
      pendingPasswordRequests,
    },
    roles: rolesWithCounts,
    groupedMembers: grouped,
    members: pagedMembers.map(serializeMember).filter(Boolean),
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    passwordRequests: passwordRequests.map((request) => ({
      id: toIdString(request._id),
      email: request.email,
      note: request.note || '',
      status: request.status,
      createdAt: request.createdAt,
      member: request.admin
        ? serializeMember({
            ...toPlainDocument(request.admin),
            roleId: resolveMemberRole(request.admin.roleId, roleMap),
          })
        : null,
    })),
    auditLogs: recentAuditLogs.map((log) => ({
      id: toIdString(log._id),
      action: log.action,
      actorEmail: log.actorEmail,
      targetType: log.targetType,
      targetId: log.targetId,
      summary: log.summary,
      createdAt: log.createdAt,
    })),
    modules: DASHBOARD_MODULES,
  });
};

exports.getRoles = async (req, res) => {
  const roles = await Role.find().sort({ name: 1 });
  const members = await Admin.find().select('roleId isSuperAdmin');

  const payload = roles.map((role) => ({
    ...serializeRole(role),
    memberCount: members.filter(
      (m) =>
        !m.isSuperAdmin
        && toIdString(m.roleId) === toIdString(role._id)
    ).length,
  }));

  res.json({ success: true, roles: payload, modules: DASHBOARD_MODULES });
};

exports.updateRolePermissions = async (req, res) => {
  const role = await Role.findById(req.params.id);
  if (!role) {
    return res.status(404).json({ success: false, message: 'Role not found' });
  }

  if (role.slug === 'super-admin') {
    return res.status(400).json({
      success: false,
      message: 'Super Admin permissions cannot be modified',
    });
  }

  await applyPermissionsToRole(role, req.body.permissions || {});

  await writeAuditLog({
    action: 'ROLE_PERMISSIONS_UPDATED',
    actor: req.admin,
    targetType: 'Role',
    targetId: role._id,
    summary: `Updated permissions for role ${role.name}`,
    metadata: { permissions: role.toPermissionObject() },
  });

  res.json({ success: true, role: serializeRole(role) });
};

exports.createMember = async (req, res) => {
  const {
    email,
    firstName = '',
    lastName = '',
    password,
    roleId,
    roleSlug,
    canChangePassword = false,
    isActive = true,
    permissions,
  } = req.body;

  if (!email?.trim() || !password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Email and password (min 6 chars) are required',
    });
  }

  const exists = await Admin.findOne({ email: email.trim().toLowerCase() });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  let role = null;
  if (roleId) {
    role = await Role.findById(roleId);
  } else if (roleSlug) {
    role = await Role.findOne({ slug: roleSlug });
  }

  if (!role) {
    return res.status(400).json({ success: false, message: 'Valid role is required' });
  }

  if (role.slug === 'super-admin') {
    return res.status(400).json({
      success: false,
      message: 'Super Admin accounts are provisioned by system seed only',
    });
  }

  const isSuperAdmin = false;

  let admin;
  try {
    admin = await Admin.create({
      email: email.trim().toLowerCase(),
      password,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      roleId: role._id,
      isSuperAdmin,
      canChangePassword: Boolean(canChangePassword),
      isActive: Boolean(isActive),
    });
  } catch (error) {
    if (error?.code === 11000 && String(error?.message || '').includes('uuid')) {
      return res.status(409).json({
        success: false,
        message: 'A legacy database index blocked member creation. Restart the backend server to apply the fix, then try again.',
      });
    }
    throw error;
  }

  if (permissions && !isSuperAdmin && Object.keys(permissions).length > 0) {
    await applyPermissionsToRole(role, permissions);
  }

  const populated = await Admin.findById(admin._id).populate('roleId');

  await writeAuditLog({
    action: 'ADMIN_MEMBER_CREATED',
    actor: req.admin,
    targetType: 'Admin',
    targetId: populated._id,
    summary: `Created admin member ${populated.email}`,
    metadata: { role: role.slug },
  });

  res.status(201).json({
    success: true,
    member: serializeMember(populated),
  });
};

exports.updateMember = async (req, res) => {
  const admin = await Admin.findById(req.params.id).populate('roleId');
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  if (admin.isSuperAdmin && req.admin._id.toString() !== admin._id.toString()) {
    const body = req.body || {};
    if (body.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin accounts cannot be deactivated by another admin',
      });
    }
  }

  const {
    firstName,
    lastName,
    roleId,
    roleSlug,
    isActive,
    canChangePassword,
  } = req.body;

  if (firstName !== undefined) admin.firstName = String(firstName).trim();
  if (lastName !== undefined) admin.lastName = String(lastName).trim();

  if (req.body.isSuperAdmin !== undefined) {
    return res.status(400).json({
      success: false,
      message: 'Super Admin privileges cannot be changed through this endpoint',
    });
  }

  if (roleId || roleSlug) {
    const role = roleId
      ? await Role.findById(roleId)
      : await Role.findOne({ slug: roleSlug });
    if (!role) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (role.slug === 'super-admin') {
      return res.status(400).json({
        success: false,
        message: 'Super Admin role cannot be assigned through member management',
      });
    }
    if (admin.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super Admin role assignment cannot be changed',
      });
    }
    admin.roleId = role._id;
    admin.isSuperAdmin = false;
  }

  if (isActive !== undefined) admin.isActive = Boolean(isActive);
  if (canChangePassword !== undefined) {
    admin.canChangePassword = Boolean(canChangePassword);
  }

  await admin.save();
  const populated = await Admin.findById(admin._id).populate('roleId');

  await writeAuditLog({
    action: 'ADMIN_MEMBER_UPDATED',
    actor: req.admin,
    targetType: 'Admin',
    targetId: populated._id,
    summary: `Updated admin member ${populated.email}`,
  });

  res.json({ success: true, member: serializeMember(populated) });
};

exports.resetMemberPassword = async (req, res) => {
  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  if (admin.isSuperAdmin && toIdString(req.admin._id) !== toIdString(admin._id)) {
    return res.status(400).json({
      success: false,
      message: 'Cannot reset another Super Admin password from here',
    });
  }

  const newPassword = req.body.password?.trim() || generateTemporaryPassword();
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const shouldSendEmail = req.body.sendEmail !== false;
  const grantPasswordChange = Boolean(req.body.grantPasswordChange);

  admin.password = newPassword;
  admin.passwordChangedAt = new Date();
  admin.canChangePassword = grantPasswordChange;
  await admin.save();

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');
  const loginUrl = `${frontendUrl}/login`;

  let emailResult = { sent: false, skipped: true };
  if (shouldSendEmail) {
    emailResult = await sendAdminPasswordResetEmail({
      to: admin.email,
      firstName: admin.firstName,
      tempPassword: newPassword,
      loginUrl,
      canChangePassword: grantPasswordChange,
    });
  }

  await writeAuditLog({
    action: 'ADMIN_PASSWORD_RESET',
    actor: req.admin,
    targetType: 'Admin',
    targetId: admin._id,
    summary: shouldSendEmail
      ? `Reset password for ${admin.email} and emailed credentials`
      : `Reset password for ${admin.email}`,
    metadata: { emailed: Boolean(emailResult.sent) },
  });

  let message = 'Password updated successfully';
  if (shouldSendEmail) {
    if (emailResult.sent) {
      message = 'Password updated and sent to the user by email';
    } else if (emailResult.skipped) {
      message =
        'Password updated, but email was not sent (SMTP is not configured)';
    } else {
      message = 'Password updated, but the email could not be delivered';
    }
  }

  const populated = await Admin.findById(admin._id).populate('roleId');

  res.json({
    success: true,
    message,
    emailed: Boolean(emailResult.sent),
    member: serializeMember(populated),
  });
};

exports.deleteMember = async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  if (admin.isSuperAdmin) {
    return res.status(400).json({
      success: false,
      message: 'Super Admin accounts cannot be deleted',
    });
  }

  if (admin._id.toString() === req.admin._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot delete your own account',
    });
  }

  await admin.deleteOne();

  await writeAuditLog({
    action: 'ADMIN_MEMBER_DELETED',
    actor: req.admin,
    targetType: 'Admin',
    targetId: admin._id,
    summary: `Deleted admin member ${admin.email}`,
  });

  res.json({ success: true, message: 'Member deleted' });
};

exports.getPasswordRequests = async (req, res) => {
  const requests = await PasswordResetRequest.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('admin', 'email firstName lastName displayName roleId isSuperAdmin')
    .populate('resolvedBy', 'email firstName lastName');

  res.json({
    success: true,
    requests: requests.map((request) => ({
      id: request._id.toString(),
      email: request.email,
      note: request.note || '',
      status: request.status,
      createdAt: request.createdAt,
      resolvedAt: request.resolvedAt,
      resolutionNote: request.resolutionNote || '',
      member: request.admin ? serializeMember(request.admin) : null,
      resolvedBy: request.resolvedBy
        ? {
            email: request.resolvedBy.email,
            name: `${request.resolvedBy.firstName || ''} ${request.resolvedBy.lastName || ''}`.trim(),
          }
        : null,
    })),
  });
};

exports.resolvePasswordRequest = async (req, res) => {
  const request = await PasswordResetRequest.findById(req.params.id).populate('admin');
  if (!request) {
    return res.status(404).json({ success: false, message: 'Password request not found' });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'This password request has already been processed',
    });
  }

  const admin = await Admin.findById(request.admin?._id || request.admin).select('+password');
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Associated admin account not found' });
  }

  const tempPassword = req.body.tempPassword?.trim() || generateTemporaryPassword();
  if (tempPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const shouldSendEmail = req.body.sendEmail !== false;
  const grantPasswordChange = Boolean(req.body.grantPasswordChange);

  admin.password = tempPassword;
  admin.passwordChangedAt = new Date();
  admin.canChangePassword = grantPasswordChange;
  await admin.save();

  request.status = 'resolved';
  request.resolvedAt = new Date();
  request.resolvedBy = req.admin._id;
  request.resolutionNote = String(
    req.body.resolutionNote || 'Password reset resolved by Super Admin'
  ).trim();
  await request.save();

  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')[0]
    .trim()
    .replace(/\/$/, '');
  const loginUrl = `${frontendUrl}/login`;

  let emailResult = { sent: false, skipped: true };
  if (shouldSendEmail) {
    emailResult = await sendAdminPasswordResetEmail({
      to: admin.email,
      firstName: admin.firstName,
      tempPassword,
      loginUrl,
      canChangePassword: grantPasswordChange,
    });
  }

  await writeAuditLog({
    action: 'PASSWORD_RESET_RESOLVED',
    actor: req.admin,
    targetType: 'Admin',
    targetId: admin._id,
    summary: shouldSendEmail
      ? `Reset password for ${admin.email} and emailed credentials`
      : `Reset password for ${admin.email}`,
    metadata: {
      requestId: toIdString(request._id),
      emailed: Boolean(emailResult.sent),
    },
  });

  let message = 'Password updated successfully';
  if (shouldSendEmail) {
    if (emailResult.sent) {
      message = 'Password updated and sent to the user by email';
    } else if (emailResult.skipped) {
      message =
        'Password updated, but email was not sent (SMTP is not configured)';
    } else {
      message = 'Password updated, but the email could not be delivered';
    }
  }

  res.json({
    success: true,
    message,
    emailed: Boolean(emailResult.sent),
    request: {
      id: toIdString(request._id),
      status: request.status,
      resolvedAt: request.resolvedAt,
    },
  });
};

exports.getAuditLogs = async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  res.json({
    success: true,
    logs: logs.map((log) => ({
      id: log._id.toString(),
      action: log.action,
      actorEmail: log.actorEmail,
      targetType: log.targetType,
      targetId: log.targetId,
      summary: log.summary,
      metadata: log.metadata || {},
      createdAt: log.createdAt,
    })),
  });
};

exports.seedDefaultRolePermissions = async () => {
  const roles = await Role.find();
  for (const role of roles) {
    const preset = DEFAULT_ROLE_PERMISSIONS[role.slug];
    if (preset) {
      role.permissions = new Map(Object.entries(preset));
      await role.save();
    }
  }
};

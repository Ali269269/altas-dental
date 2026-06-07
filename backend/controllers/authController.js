const Admin = require('../models/Admin');
const Role = require('../models/Role');
const PasswordResetRequest = require('../models/PasswordResetRequest');
const { sendTokenResponse, verifySession } = require('../utils/tokenUtils');
const { writeAuditLog } = require('../utils/rbacHelpers');

exports.login = async (req, res) => {
  const { email, password, roleSlug } = req.body;

  if (!email || !password || !roleSlug) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email, password, and role',
    });
  }

  const admin = await Admin.findOne({ email: String(email).trim().toLowerCase() })
    .select('+password')
    .populate('roleId');

  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!admin.isActive) {
    return res.status(403).json({ success: false, message: 'Your account is disabled' });
  }

  const isMatch = await admin.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const normalizedRoleSlug = String(roleSlug).trim().toLowerCase();
  const assignedSlug = admin.isSuperAdmin
    ? 'super-admin'
    : admin.roleId?.slug || '';

  if (!assignedSlug || assignedSlug !== normalizedRoleSlug) {
    return res.status(401).json({
      success: false,
      message: 'Selected role does not match your assigned role',
    });
  }

  admin.lastLogin = new Date();
  await admin.save();

  await writeAuditLog({
    action: 'ADMIN_LOGIN',
    actor: admin,
    targetType: 'Admin',
    targetId: admin._id,
    summary: `${admin.email} logged in as ${admin.isSuperAdmin ? 'Super Admin' : admin.roleId?.name}`,
  });

  await sendTokenResponse(admin, 200, res);
};

exports.signup = async (req, res) => {
  const { email, password, firstName, lastName, roleId, roleSlug } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide an email and password',
    });
  }

  const existing = await Admin.findOne({ email: String(email).trim().toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Admin already exists with that email' });
  }

  let role = null;
  if (roleId) role = await Role.findById(roleId);
  else if (roleSlug) role = await Role.findOne({ slug: String(roleSlug).trim().toLowerCase() });
  else role = await Role.findOne({ slug: 'manager' });

  if (!role) {
    return res.status(400).json({ success: false, message: 'Valid role is required' });
  }

  if (role.slug === 'super-admin') {
    return res.status(400).json({
      success: false,
      message: 'Super Admin accounts are provisioned by system seed only',
    });
  }

  const admin = await Admin.create({
    email: String(email).trim().toLowerCase(),
    password,
    firstName: String(firstName || '').trim(),
    lastName: String(lastName || '').trim(),
    roleId: role._id,
    isSuperAdmin: false,
    isActive: true,
  });

  await writeAuditLog({
    action: 'ADMIN_MEMBER_CREATED',
    actor: req.admin,
    targetType: 'Admin',
    targetId: admin._id,
    summary: `Created admin member ${admin.email}`,
    metadata: { role: role.slug },
  });

  const populated = await Admin.findById(admin._id).populate('roleId');
  await sendTokenResponse(populated, 201, res);
};

exports.getLoginRoles = async (_req, res) => {
  const roles = await Role.find({ slug: { $ne: 'super-admin-hidden' } })
    .sort({ name: 1 })
    .select('name slug description accessLevel');

  res.json({
    success: true,
    roles: roles.map((role) => ({
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      accessLevel: role.accessLevel,
    })),
  });
};

exports.requestPasswordReset = async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const note = String(req.body.note || '').trim();

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists for this email, the Super Admin will review your request.',
    });
  }

  const existingPending = await PasswordResetRequest.findOne({
    admin: admin._id,
    status: 'pending',
  });

  if (existingPending) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists for this email, the Super Admin will review your request.',
    });
  }

  await PasswordResetRequest.create({
    admin: admin._id,
    email: admin.email,
    note,
    status: 'pending',
  });

  await writeAuditLog({
    action: 'PASSWORD_RESET_REQUESTED',
    actor: admin,
    targetType: 'Admin',
    targetId: admin._id,
    summary: `Password reset requested by ${admin.email}`,
  });

  res.status(200).json({
    success: true,
    message: 'If an account exists for this email, the Super Admin will review your request.',
  });
};

exports.verifyAccess = async (req, res) => {
  const session = await verifySession(req.admin._id);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Session invalid' });
  }

  res.json({ success: true, admin: session });
};

exports.getProfile = async (_req, res) => {
  const session = await verifySession(_req.admin._id);
  if (!session) {
    return res.status(401).json({ success: false, message: 'Session invalid' });
  }

  res.status(200).json({
    success: true,
    session,
  });
};

exports.logout = async (req, res) => {
  if (req.admin?._id) {
    const admin = await Admin.findById(req.admin._id);
    if (admin) {
      admin.authVersion = Number(admin.authVersion || 0) + 1;
      await admin.save();
    }
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

exports.getDashboard = async (req, res) => {
  const admin = await Admin.findById(req.admin.id).populate('roleId');
  const session = await verifySession(admin._id);

  res.status(200).json({
    success: true,
    data: {
      admin: session,
      dashboardStats: {
        message: 'Welcome to your dashboard',
      },
    },
  });
};

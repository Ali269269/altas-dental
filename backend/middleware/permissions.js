const {
  resolveAdminPermissions,
  hasPermission,
} = require('../utils/rbacHelpers');

async function attachPermissions(req, res, next) {
  try {
    req.permissions = await resolveAdminPermissions(req.admin);
    req.isSuperAdmin = Boolean(req.admin?.isSuperAdmin);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve permissions',
    });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.admin?.isSuperAdmin) return next();
  return res.status(403).json({
    success: false,
    message: 'Super Admin access required',
  });
}

function requirePermission(moduleKey, action = 'view') {
  return (req, res, next) => {
    if (req.admin?.isSuperAdmin) return next();

    const permissions = req.permissions || {};
    if (hasPermission(permissions, moduleKey, action)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `You do not have ${action} access to ${moduleKey.replace(/_/g, ' ')}`,
    });
  };
}

function requireAnyPermission(moduleKeys, action = 'view') {
  return (req, res, next) => {
    if (req.admin?.isSuperAdmin) return next();

    const permissions = req.permissions || {};
    const allowed = moduleKeys.some((key) => hasPermission(permissions, key, action));

    if (allowed) return next();

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to perform this action',
    });
  };
}

const protectedAdmin = ['protect', 'checkActiveAdmin', 'attachPermissions'];

module.exports = {
  attachPermissions,
  requireSuperAdmin,
  requirePermission,
  requireAnyPermission,
  protectedAdmin,
};

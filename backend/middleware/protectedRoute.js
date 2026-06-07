const { protect, checkActiveAdmin } = require('./auth');
const { attachPermissions, requirePermission } = require('./permissions');

function protectedRoute(moduleKey, action = 'view') {
  return [protect, checkActiveAdmin, attachPermissions, requirePermission(moduleKey, action)];
}

module.exports = { protectedRoute };

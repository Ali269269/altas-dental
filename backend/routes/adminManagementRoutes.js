const express = require('express');
const { protect, checkActiveAdmin } = require('../middleware/auth');
const {
  attachPermissions,
  requireSuperAdmin,
  requirePermission,
} = require('../middleware/permissions');
const {
  getOverview,
  getRoles,
  updateRolePermissions,
  createMember,
  updateMember,
  resetMemberPassword,
  deleteMember,
  getPasswordRequests,
  resolvePasswordRequest,
  getAuditLogs,
} = require('../controllers/adminManagementController');

const router = express.Router();

router.use(protect, checkActiveAdmin, attachPermissions);
router.use(requirePermission('admin_management', 'view'));

router.get('/overview', getOverview);
router.get('/roles', getRoles);
router.get('/password-requests', getPasswordRequests);
router.get('/audit-logs', getAuditLogs);

router.put('/roles/:id/permissions', requireSuperAdmin, requirePermission('admin_management', 'edit'), updateRolePermissions);
router.post('/members', requireSuperAdmin, requirePermission('admin_management', 'edit'), createMember);
router.put('/members/:id', requireSuperAdmin, requirePermission('admin_management', 'edit'), updateMember);
router.post('/members/:id/reset-password', requireSuperAdmin, requirePermission('admin_management', 'edit'), resetMemberPassword);
router.delete('/members/:id', requireSuperAdmin, requirePermission('admin_management', 'edit'), deleteMember);
router.post('/password-requests/:id/resolve', requireSuperAdmin, requirePermission('admin_management', 'edit'), resolvePasswordRequest);

module.exports = router;

const express = require('express');
const {
  login,
  signup,
  getProfile,
  logout,
  getDashboard,
  getLoginRoles,
  requestPasswordReset,
  verifyAccess,
} = require('../controllers/authController');
const { protect, checkActiveAdmin } = require('../middleware/auth');
const { attachPermissions, requireSuperAdmin } = require('../middleware/permissions');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/roles', getLoginRoles);
router.post('/login', authLimiter, login);
router.post('/password-reset-request', authLimiter, requestPasswordReset);

router.post('/signup', protect, checkActiveAdmin, attachPermissions, requireSuperAdmin, signup);

router.get('/verify', protect, checkActiveAdmin, attachPermissions, verifyAccess);
router.get('/profile', protect, checkActiveAdmin, attachPermissions, getProfile);
router.get('/dashboard', protect, checkActiveAdmin, attachPermissions, getDashboard);
router.post('/logout', protect, logout);
router.get('/logout', protect, logout);

module.exports = router;

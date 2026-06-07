const express = require('express');
const {
  getSettings,
  getPublicClinicSettings,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  changePassword,
  updateSecurity,
  updateAlertPreferences,
  updateClinic,
  updateBusinessHours,
} = require('../controllers/settingsController');
const { protect, checkActiveAdmin } = require('../middleware/auth');
const { attachPermissions, requirePermission } = require('../middleware/permissions');
const { profilePhotoUpload } = require('../middleware/profilePhotoUpload');

const router = express.Router();

router.get('/public', getPublicClinicSettings);

router.use(protect, checkActiveAdmin, attachPermissions);

router.get('/', requirePermission('settings', 'view'), getSettings);
router.put('/profile', requirePermission('settings', 'edit'), updateProfile);
router.post('/profile-photo', requirePermission('settings', 'edit'), profilePhotoUpload, uploadProfilePhoto);
router.delete('/profile-photo', requirePermission('settings', 'edit'), removeProfilePhoto);
router.put('/password', requirePermission('settings', 'edit'), changePassword);
router.put('/security', requirePermission('settings', 'edit'), updateSecurity);
router.put('/alerts', requirePermission('settings', 'edit'), updateAlertPreferences);
router.put('/clinic', requirePermission('settings', 'edit'), updateClinic);
router.put('/business-hours', requirePermission('settings', 'edit'), updateBusinessHours);

module.exports = router;

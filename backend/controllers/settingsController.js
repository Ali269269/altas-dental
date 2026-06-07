const Admin = require('../models/Admin');
const {
  deleteStoredProfilePhoto,
  getOrCreateClinicSettings,
  mapPublicClinicSettings,
  mapSettingsResponse,
  normalizeBusinessHours,
  resolvePublicAssetUrl,
} = require('../utils/settingsHelpers');

// @desc    Public clinic info for website footer
// @route   GET /api/settings/public
// @access  Public
exports.getPublicClinicSettings = async (req, res) => {
  try {
    const settings = await getOrCreateClinicSettings();
    return res.status(200).json({
      success: true,
      data: mapPublicClinicSettings(settings),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching clinic information',
      error: error.message,
    });
  }
};

function parseDisplayName(fullName) {
  const trimmed = String(fullName || '').trim();
  if (!trimmed) return { displayName: '', firstName: '', lastName: '' };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { displayName: trimmed, firstName: trimmed, lastName: '' };
  }
  return {
    displayName: trimmed,
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

// @desc    Get admin + clinic settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const [admin, clinicSettings] = await Promise.all([
      Admin.findById(req.admin.id),
      getOrCreateClinicSettings(),
    ]);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    return res.status(200).json({
      success: true,
      data: mapSettingsResponse(admin, clinicSettings),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message,
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/settings/profile
// @access  Private/Admin
exports.updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    const fullName = String(req.body.fullName || '').trim();
    const professionalTitle = String(req.body.professionalTitle || '').trim();
    const phone = String(req.body.phone || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (email !== admin.email) {
      const existing = await Admin.findOne({ email, _id: { $ne: admin._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another account already uses this email',
        });
      }
      admin.email = email;
    }

    const nameParts = parseDisplayName(fullName);
    admin.displayName = nameParts.displayName;
    admin.firstName = nameParts.firstName;
    admin.lastName = nameParts.lastName;
    admin.professionalTitle = professionalTitle;
    admin.phone = phone;

    await admin.save();

    const clinicSettings = await getOrCreateClinicSettings();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: mapSettingsResponse(admin, clinicSettings).profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating profile',
    });
  }
};

// @desc    Upload profile photo
// @route   POST /api/settings/profile-photo
// @access  Private/Admin
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.profilePhoto) {
      deleteStoredProfilePhoto(admin.profilePhoto);
    }

    admin.profilePhoto = `/uploads/profiles/${req.file.filename}`;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Profile photo updated',
      data: {
        profilePhoto: resolvePublicAssetUrl(admin.profilePhoto),
        profilePhotoPath: admin.profilePhoto,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading profile photo',
    });
  }
};

// @desc    Remove profile photo
// @route   DELETE /api/settings/profile-photo
// @access  Private/Admin
exports.removeProfilePhoto = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (admin.profilePhoto) {
      deleteStoredProfilePhoto(admin.profilePhoto);
      admin.profilePhoto = '';
      await admin.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Profile photo removed',
      data: { profilePhoto: '', profilePhotoPath: '' },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error removing profile photo',
    });
  }
};

// @desc    Change admin password
// @route   PUT /api/settings/password
// @access  Private/Admin
exports.changePassword = async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    const confirmPassword = String(req.body.confirmPassword || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all password fields',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match',
      });
    }

    const admin = await Admin.findById(req.admin.id).select('+password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (!admin.isSuperAdmin && !admin.canChangePassword) {
      return res.status(403).json({
        success: false,
        message: 'Password changes are managed by the Super Admin. Submit a password reset request from the login page.',
      });
    }

    const isMatch = await admin.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    admin.password = newPassword;
    admin.passwordChangedAt = new Date();
    await admin.save();

    const clinicSettings = await getOrCreateClinicSettings();
    const profile = mapSettingsResponse(admin, clinicSettings).profile;

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: {
        passwordChangedAt: profile.passwordChangedAt,
        passwordChangedLabel: profile.passwordChangedLabel,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error changing password',
    });
  }
};

// @desc    Update security preferences
// @route   PUT /api/settings/security
// @access  Private/Admin
exports.updateSecurity = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    if (typeof req.body.twoFactorEnabled === 'boolean') {
      admin.twoFactorEnabled = req.body.twoFactorEnabled;
    }

    await admin.save();
    const clinicSettings = await getOrCreateClinicSettings();

    return res.status(200).json({
      success: true,
      message: 'Security settings updated',
      data: mapSettingsResponse(admin, clinicSettings).profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating security settings',
    });
  }
};

// @desc    Update alert preferences
// @route   PUT /api/settings/alerts
// @access  Private/Admin
exports.updateAlertPreferences = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    admin.alertPreferences = {
      appointmentSms:
        req.body.appointmentSms !== undefined
          ? Boolean(req.body.appointmentSms)
          : admin.alertPreferences?.appointmentSms !== false,
      clinicReports:
        req.body.clinicReports !== undefined
          ? Boolean(req.body.clinicReports)
          : admin.alertPreferences?.clinicReports !== false,
      marketingEmails:
        req.body.marketingEmails !== undefined
          ? Boolean(req.body.marketingEmails)
          : Boolean(admin.alertPreferences?.marketingEmails),
    };

    await admin.save();
    const clinicSettings = await getOrCreateClinicSettings();

    return res.status(200).json({
      success: true,
      message: 'Alert preferences updated',
      data: mapSettingsResponse(admin, clinicSettings).profile.alertPreferences,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating alert preferences',
    });
  }
};

// @desc    Update clinic preferences
// @route   PUT /api/settings/clinic
// @access  Private/Admin
exports.updateClinic = async (req, res) => {
  try {
    const settings = await getOrCreateClinicSettings();

    settings.clinicName = String(req.body.clinicName || settings.clinicName).trim();
    settings.primaryContact = String(
      req.body.primaryContact || settings.primaryContact
    ).trim();
    settings.clinicEmail = String(
      req.body.clinicEmail || settings.clinicEmail || ''
    )
      .trim()
      .toLowerCase();
    settings.address = String(req.body.address || settings.address).trim();

    if (!settings.clinicName) {
      return res.status(400).json({ success: false, message: 'Clinic name is required' });
    }
    if (settings.clinicEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.clinicEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid clinic email' });
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Clinic preferences updated',
      data: mapSettingsResponse({ _id: req.admin.id }, settings).clinic,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating clinic preferences',
    });
  }
};

// @desc    Update business hours
// @route   PUT /api/settings/business-hours
// @access  Private/Admin
exports.updateBusinessHours = async (req, res) => {
  try {
    const settings = await getOrCreateClinicSettings();
    settings.businessHours = normalizeBusinessHours(req.body.businessHours);
    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Business hours updated',
      data: mapSettingsResponse({ _id: req.admin.id }, settings).clinic.businessHours,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating business hours',
    });
  }
};

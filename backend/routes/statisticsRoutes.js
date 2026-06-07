const express = require('express');
const {
  getDashboardStats,
  getDashboardOverview,
  getAnalyticsOverview,
  getAppointmentsPageOverview,
  getPatientsPageOverview,
  getAppointmentsToday,
  getPendingConfirmations,
  createAppointment,
  confirmAppointmentByEmail,
  cancelAppointmentByEmail,
  getAppointmentById,
  deleteAppointment,
  sendAppointmentReminder,
  sendPatientAppointmentEmail,
  updateAppointmentStatus,
  completeAppointmentCheckup,
  uploadClinicalScans,
  deleteClinicalScan,
  downloadClinicalScan,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/statisticsController');
const { protectedRoute } = require('../middleware/protectedRoute');
const { clinicalScanUpload } = require('../middleware/clinicalScanUpload');
const { appointmentBookingLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Dashboard statistics (protected - admin only)
router.get('/dashboard', ...protectedRoute('dashboard', 'view'), getDashboardStats);
router.get('/overview', ...protectedRoute('dashboard', 'view'), getDashboardOverview);
router.get('/analytics-overview', ...protectedRoute('analytics', 'view'), getAnalyticsOverview);
router.get('/appointments-overview', ...protectedRoute('appointments', 'view'), getAppointmentsPageOverview);
router.get('/patients-overview', ...protectedRoute('patients', 'view'), getPatientsPageOverview);
router.get('/appointments-today', ...protectedRoute('appointments', 'view'), getAppointmentsToday);
router.get('/pending-confirmations', ...protectedRoute('appointments', 'view'), getPendingConfirmations);

// Create appointment (can be public or protected - we'll allow both for flexibility)
// For now, we'll make it unprotected so patients can book from client side
router.post('/appointments', appointmentBookingLimiter, createAppointment);

// Patient download link from clinical record emails (signed token)
router.get('/clinical-scans/download', downloadClinicalScan);

// Admin email action links (public, signed token)
router.get('/appointments/actions/confirm', confirmAppointmentByEmail);
router.get('/appointments/actions/cancel', cancelAppointmentByEmail);

// Single appointment (protected - admin only)
router.get('/appointments/:id', ...protectedRoute('appointments', 'view'), getAppointmentById);
router.put('/appointments/:id', ...protectedRoute('appointments', 'edit'), updateAppointmentStatus);
router.delete('/appointments/:id', ...protectedRoute('appointments', 'edit'), deleteAppointment);
router.post(
  '/appointments/:id/clinical-scans',
  ...protectedRoute('patients', 'edit'),
  clinicalScanUpload,
  uploadClinicalScans
);
router.delete(
  '/appointments/:id/clinical-scans/:storedName',
  ...protectedRoute('patients', 'edit'),
  deleteClinicalScan
);
router.post(
  '/appointments/:id/checkup',
  ...protectedRoute('appointments', 'edit'),
  completeAppointmentCheckup
);
router.post(
  '/appointments/:id/reminder',
  ...protectedRoute('appointments', 'edit'),
  sendAppointmentReminder
);
router.post(
  '/appointments/:id/email',
  ...protectedRoute('appointments', 'edit'),
  sendPatientAppointmentEmail
);
router.get('/notifications', ...protectedRoute('dashboard', 'view'), getAdminNotifications);
router.put('/notifications/read-all', ...protectedRoute('dashboard', 'edit'), markAllNotificationsRead);
router.put('/notifications/:id/read', ...protectedRoute('dashboard', 'edit'), markNotificationRead);

module.exports = router;

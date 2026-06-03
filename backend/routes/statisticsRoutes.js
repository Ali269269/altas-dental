const express = require('express');
const {
  getDashboardStats,
  getDashboardOverview,
  getAppointmentsPageOverview,
  getAppointmentsToday,
  getPendingConfirmations,
  createAppointment,
  confirmAppointmentByEmail,
  cancelAppointmentByEmail,
  getAppointmentById,
  updateAppointmentStatus,
  completeAppointmentCheckup,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/statisticsController');
const { protect, checkActiveAdmin } = require('../middleware/auth');

const router = express.Router();

// Dashboard statistics (protected - admin only)
router.get('/dashboard', protect, checkActiveAdmin, getDashboardStats);

// Full dashboard overview (protected - admin only)
router.get('/overview', protect, checkActiveAdmin, getDashboardOverview);

// Appointments page overview (protected - admin only)
router.get('/appointments-overview', protect, checkActiveAdmin, getAppointmentsPageOverview);

// Appointments for today (protected - admin only)
router.get('/appointments-today', protect, checkActiveAdmin, getAppointmentsToday);

// Pending confirmations (protected - admin only)
router.get('/pending-confirmations', protect, checkActiveAdmin, getPendingConfirmations);

// Create appointment (can be public or protected - we'll allow both for flexibility)
// For now, we'll make it unprotected so patients can book from client side
router.post('/appointments', createAppointment);

// Admin email action links (public, signed token)
router.get('/appointments/actions/confirm', confirmAppointmentByEmail);
router.get('/appointments/actions/cancel', cancelAppointmentByEmail);

// Single appointment (protected - admin only)
router.get('/appointments/:id', protect, checkActiveAdmin, getAppointmentById);

// Update appointment status (protected - admin only)
router.put('/appointments/:id', protect, checkActiveAdmin, updateAppointmentStatus);

// Complete checkup → marks appointment as SEEN (protected - admin only)
router.post(
  '/appointments/:id/checkup',
  protect,
  checkActiveAdmin,
  completeAppointmentCheckup
);

// Notifications (protected - admin only)
router.get('/notifications', protect, checkActiveAdmin, getAdminNotifications);
router.put('/notifications/read-all', protect, checkActiveAdmin, markAllNotificationsRead);
router.put('/notifications/:id/read', protect, checkActiveAdmin, markNotificationRead);

module.exports = router;

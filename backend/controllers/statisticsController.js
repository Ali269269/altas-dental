const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { getTodayRange, parseAppointmentDate } = require('../utils/dateUtils');
const {
  getWeekRange,
  buildOccupancyGrid,
  buildServicesBreakdown,
  buildStaffProductivity,
  buildUpcomingAppointments,
  mapAppointmentRow,
  formatShortDate,
  formatTimeAgo,
  formatLongDate,
  getInitials,
  getArrivalSubtitle,
  appointmentHasStoredCheckup,
} = require('../utils/dashboardHelpers');
const {
  buildAppointmentsPageOverview,
  mapAppointmentListItem,
} = require('../utils/appointmentsPageHelpers');
const { buildPatientsPageOverview, computePatientStats } = require('../utils/patientsPageHelpers');
const { buildAnalyticsOverview } = require('../utils/analyticsPageHelpers');
const {
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail,
  sendAppointmentReminderEmail,
  sendPatientFollowUpEmail,
  sendPatientTreatmentSummaryEmail,
  sendPatientEmailByType,
  sendAdminNewAppointmentEmail,
} = require('../utils/emailService');
const { verifyAppointmentAction } = require('../utils/appointmentActionTokens');
const { renderActionResultPage } = require('../utils/emailHtmlPages');
const { buildPatientProfileForAppointment } = require('../utils/patientProfileHelpers');
const { mapScansForClient } = require('../utils/clinicalScanUrls');
const fs = require('fs');
const path = require('path');
const { clinicalRoot } = require('../middleware/clinicalScanUpload');
const { verifyClinicalScanDownload } = require('../utils/clinicalScanDownloadToken');

function mapCheckupDetail(checkup, appointmentId) {
  if (!checkup) return null;
  const c = checkup.toObject ? checkup.toObject() : checkup;
  const id = appointmentId ? String(appointmentId) : '';
  return {
    complaint: c.complaint || '',
    clinicalObs: c.clinicalObs || '',
    primaryDiagnosis: c.primaryDiagnosis || '',
    diagnostics: Array.isArray(c.diagnostics) ? c.diagnostics : [],
    treatment: Array.isArray(c.treatment) ? c.treatment : [],
    prescriptions: c.prescriptions || '',
    followUp: c.followUp || '',
    postOpInstructions: Array.isArray(c.postOpInstructions)
      ? c.postOpInstructions
      : [],
    additionalNotes: c.additionalNotes || '',
    scanNames: Array.isArray(c.scanNames) ? c.scanNames : [],
    scans: id ? mapScansForClient(id, c.scans) : [],
    completedAt: c.completedAt || null,
  };
}

function mapAppointmentDetail(appt) {
  return {
    id: appt._id.toString(),
    patientName: appt.patientName,
    email: appt.email,
    phone: appt.phone,
    specialty: appt.specialty,
    appointmentDate: appt.appointmentDate,
    appointmentDateLabel: formatLongDate(appt.appointmentDate),
    appointmentTime: appt.appointmentTime,
    notes: appt.notes || '',
    status: appt.status,
    cancellationReason: appt.cancellationReason || '',
    isNewPatient: Boolean(appt.isNewPatient),
    createdAt: appt.createdAt,
    checkup: mapCheckupDetail(appt.checkup, appt._id),
  };
}

function mapNotificationRow(notification) {
  return {
    id: notification._id.toString(),
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: Boolean(notification.isRead),
    timeAgo: formatTimeAgo(notification.createdAt),
    createdAt: notification.createdAt,
    details: {
      appointmentId: notification.appointmentId
        ? notification.appointmentId.toString()
        : null,
      patientName: notification.patientName || '',
      service: notification.service || '',
      appointmentDate: notification.appointmentDate,
      appointmentTime: notification.appointmentTime || '',
      phone: notification.phone || '',
      email: notification.email || '',
    },
  };
}

async function buildDashboardStatCards() {
  const { today, tomorrow } = getTodayRange();

  // Appointments booked today (created) — updates immediately after client submission
  const totalBookingsToday = await Appointment.countDocuments({
    createdAt: { $gte: today, $lt: tomorrow },
  });

  // Awaiting admin action (new online bookings + pending)
  const pendingConfirmations = await Appointment.countDocuments({
    status: { $in: ['NEW', 'PENDING'] },
  });

  const newPatientsCount = await Appointment.countDocuments({
    isNewPatient: true,
    createdAt: { $gte: today, $lt: tomorrow },
  });

  const bookingsBadge =
    totalBookingsToday > 0
      ? `-${Math.floor(totalBookingsToday * 0.1)}%`
      : '0%';
  const newPatientsBadge =
    newPatientsCount > 0 ? `-${newPatientsCount} today` : 'No new';

  return {
    statCards: [
      {
        label: 'Total Bookings Today',
        value: totalBookingsToday.toString(),
        badge: bookingsBadge,
        badgeType: 'negative',
      },
      {
        label: 'Pending Confirmations',
        value: pendingConfirmations.toString(),
        badge: 'Action Needed',
        badgeType: 'warning',
      },
      {
        label: 'New Patients',
        value: newPatientsCount.toString(),
        badge: newPatientsBadge,
        badgeType: 'neutral',
      },
    ],
    metadata: {
      totalBookingsToday,
      pendingConfirmations,
      newPatientsCount,
      timestamp: new Date(),
    },
  };
}

async function buildDashboardOverview() {
  const { today, tomorrow } = getTodayRange();
  const { weekStart, weekEnd } = getWeekRange();

  const statCardsData = await buildDashboardStatCards();

  const [
    todayAppointmentsRaw,
    pendingRaw,
    weekAppointments,
    allAppointments,
    futureAppointmentsRaw,
    patientStats,
  ] = await Promise.all([
    Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow },
    }).sort({ appointmentTime: 1 }),
    Appointment.find({ status: { $in: ['NEW', 'PENDING'] } })
      .sort({ createdAt: -1 })
      .limit(10),
    Appointment.find({
      appointmentDate: { $gte: weekStart, $lt: weekEnd },
    }),
    Appointment.find({}),
    Appointment.find({
      appointmentDate: { $gte: today },
      status: { $in: ['NEW', 'PENDING', 'CONFIRMED'] },
    }).sort({ appointmentDate: 1, appointmentTime: 1 }),
    computePatientStats(),
  ]);

  const todayAppointments = todayAppointmentsRaw.map(mapAppointmentRow);
  const upcomingAppointments = buildUpcomingAppointments(futureAppointmentsRaw);
  const pendingConfirmations = pendingRaw.map((appt) => ({
    id: appt._id.toString(),
    name: appt.patientName,
    service: appt.specialty,
    date: formatShortDate(appt.appointmentDate),
    timeAgo: formatTimeAgo(appt.createdAt),
  }));

  const { grid: occupancyData, peakLabel } = buildOccupancyGrid(weekAppointments);
  const { services, topPerformer } = buildServicesBreakdown(allAppointments);
  const staff = buildStaffProductivity(allAppointments);

  let nextPatient = null;
  const nextApptSource = upcomingAppointments.length
    ? futureAppointmentsRaw.find((a) => a._id.toString() === upcomingAppointments[0].id)
    : todayAppointmentsRaw.find((a) =>
        ['NEW', 'PENDING', 'CONFIRMED'].includes(a.status)
      ) || todayAppointmentsRaw[0];

  const nextAppt = nextApptSource;

  if (nextAppt) {
    const [previousVisit, lastClinicalAppt] = await Promise.all([
      Appointment.findOne({
        email: nextAppt.email,
        _id: { $ne: nextAppt._id },
        appointmentDate: { $lt: nextAppt.appointmentDate },
      }).sort({ appointmentDate: -1 }),
      Appointment.findOne({
        email: nextAppt.email,
        status: { $in: ['SEEN', 'COMPLETED'] },
      }).sort({ appointmentDate: -1 }),
    ]);

    const hasClinicalRecord =
      lastClinicalAppt && appointmentHasStoredCheckup(lastClinicalAppt);

    const hasAlert =
      nextAppt.notes &&
      /allerg|alert|medical/i.test(nextAppt.notes);

    nextPatient = {
      initials: getInitials(nextAppt.patientName),
      subtitle: getArrivalSubtitle(
        nextAppt.appointmentDate,
        nextAppt.appointmentTime
      ),
      appointmentId: nextAppt._id.toString(),
      clinicalRecordAppointmentId:
        hasClinicalRecord ? lastClinicalAppt._id.toString() : null,
      hasClinicalRecord: Boolean(hasClinicalRecord),
      rows: [
        { label: 'Patient Name:', value: nextAppt.patientName, isTag: false },
        {
          label: 'Patient ID:',
          value: `#PX-${nextAppt._id.toString().slice(-4).toUpperCase()}`,
          isTag: false,
        },
        {
          label: 'Last Visit:',
          value: previousVisit
            ? formatLongDate(previousVisit.appointmentDate)
            : 'First visit',
          isTag: false,
        },
        {
          label: 'Medical Alerts:',
          value: hasAlert ? '⚠ Allergies' : 'None on file',
          isTag: hasAlert,
        },
      ],
    };
  }

  return {
    ...statCardsData,
    occupancyData,
    occupancyPeak: peakLabel,
    services,
    topPerformer,
    todayAppointments,
    upcomingAppointments,
    staff,
    pendingConfirmations,
    nextPatient,
    patientStats: {
      totalPatients: patientStats.totalPatients,
      newPatientsThisMonth: patientStats.newPatients,
      newToday: patientStats.newToday,
      monthGrowthPct: patientStats.patientsMonthGrowthPct,
    },
  };
}

// @desc    Full dashboard payload (stat cards, lists, charts)
// @route   GET /api/statistics/overview
// @access  Private/Protected
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const data = await buildDashboardOverview();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
      error: error.message,
    });
  }
};

// @desc    Analytics page payload (charts, conversion, summary stats)
// @route   GET /api/statistics/analytics-overview
// @access  Private/Protected
exports.getAnalyticsOverview = async (req, res, next) => {
  try {
    const data = await buildAnalyticsOverview();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics overview',
      error: error.message,
    });
  }
};

// @desc    Appointments page payload (calendar, lists, stats)
// @route   GET /api/statistics/appointments-overview
// @access  Private/Protected
exports.getAppointmentsPageOverview = async (req, res, next) => {
  try {
    const data = await buildAppointmentsPageOverview(req.query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments overview',
      error: error.message,
    });
  }
};

// @desc    Patients dashboard overview (list, stats, filters)
// @route   GET /api/statistics/patients-overview
// @access  Private/Protected
exports.getPatientsPageOverview = async (req, res, next) => {
  try {
    const data = await buildPatientsPageOverview(req.query);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching patients overview',
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics for stat cards
// @route   GET /api/statistics/dashboard
// @access  Private/Protected
exports.getDashboardStats = async (req, res, next) => {
  try {
    const data = await buildDashboardStatCards();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

// @desc    Get detailed appointments list for today
// @route   GET /api/statistics/appointments-today
// @access  Private/Protected
exports.getAppointmentsToday = async (req, res, next) => {
  try {
    const { today, tomorrow } = getTodayRange();

    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ appointmentTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments for today',
      error: error.message,
    });
  }
};

// @desc    Get pending confirmations
// @route   GET /api/statistics/pending-confirmations
// @access  Private/Protected
exports.getPendingConfirmations = async (req, res, next) => {
  try {
    const pendingAppointments = await Appointment.find({
      status: { $in: ['NEW', 'PENDING'] },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: pendingAppointments.length,
      data: pendingAppointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending confirmations',
      error: error.message,
    });
  }
};

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function findPendingDuplicateAppointment({
  email,
  phone,
  specialty,
  appointmentDate,
  appointmentTime,
}) {
  const dayStart = startOfDay(appointmentDate);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return Appointment.findOne({
    email: String(email).trim().toLowerCase(),
    phone: String(phone).trim(),
    specialty: String(specialty).trim(),
    appointmentTime: String(appointmentTime).trim(),
    appointmentDate: { $gte: dayStart, $lt: dayEnd },
    status: { $in: ['NEW', 'PENDING'] },
  });
}

async function notifyAdminNewBooking(appointment) {
  try {
    const emailResult = await sendAdminNewAppointmentEmail(appointment);
    if (emailResult?.skipped) {
      console.warn('Admin appointment email skipped:', emailResult.reason || 'unknown');
    }
    return emailResult;
  } catch (emailError) {
    console.error(
      'Failed to send admin appointment notification:',
      emailError.message || emailError
    );
    return { sent: false, error: emailError.message };
  }
}

function respondBookingAccepted(res, appointment, alreadyExists = false) {
  return res.status(200).json({
    success: true,
    alreadyExists,
    message: alreadyExists
      ? 'Appointment request already received'
      : 'Appointment created successfully',
    data: appointment,
  });
}

// @desc    Create a new appointment (used when patient books from client side)
// @route   POST /api/statistics/appointments
// @access  Private/Protected or Public
exports.createAppointment = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please try again in a moment.',
        error: `MongoDB readyState=${mongoose.connection.readyState}`,
      });
    }

    const { patientName, email, phone, specialty, appointmentDate, appointmentTime, notes, isNewPatient } = req.body;

    // Validate required fields
    if (!patientName || !email || !phone || !specialty || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const parsedDate = parseAppointmentDate(appointmentDate);
    if (!parsedDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment date',
      });
    }

    const todayStart = startOfDay(new Date());
    if (startOfDay(parsedDate) < todayStart) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be today or in the future',
      });
    }

    const normalized = {
      patientName: String(patientName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      specialty: String(specialty).trim(),
      appointmentDate: parsedDate,
      appointmentTime: String(appointmentTime).trim(),
      notes: notes ? String(notes).trim() : '',
      isNewPatient: isNewPatient !== undefined ? isNewPatient : true,
    };

    const existing = await findPendingDuplicateAppointment(normalized);
    if (existing) {
      await notifyAdminNewBooking(existing);
      return respondBookingAccepted(res, existing, true);
    }

    const appointment = await Appointment.create({
      ...normalized,
      status: 'NEW',
    });

    try {
      await Notification.create({
        type: 'APPOINTMENT_BOOKED',
        title: 'New appointment request',
        message: `${appointment.patientName} booked ${appointment.specialty}`,
        appointmentId: appointment._id,
        patientName: appointment.patientName,
        service: appointment.specialty,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        phone: appointment.phone,
        isRead: false,
      });
    } catch (notifError) {
      console.error('Notification create failed:', notifError.message || notifError);
    }

    await notifyAdminNewBooking(appointment);

    return respondBookingAccepted(res, appointment, false);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const details = Object.values(error.errors || {})
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message: details || error.message || 'Validation failed',
        error: error.message,
      });
    }

    if (error.code === 11000) {
      const parsedDate = parseAppointmentDate(req.body?.appointmentDate);
      if (parsedDate) {
        const existing = await findPendingDuplicateAppointment({
          email: req.body.email,
          phone: req.body.phone,
          specialty: req.body.specialty,
          appointmentDate: parsedDate,
          appointmentTime: req.body.appointmentTime,
        });
        if (existing) {
          await notifyAdminNewBooking(existing);
          return respondBookingAccepted(res, existing, true);
        }
      }
    }

    console.error('Create appointment error:', error);

    const clientMessage =
      error.message ||
      (error.name === 'MongoServerError'
        ? 'Database rejected this appointment'
        : 'Error creating appointment');

    res.status(500).json({
      success: false,
      message: clientMessage,
      error: error.message,
      code: error.code,
      name: error.name,
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/statistics/appointments/:id
// @access  Private/Protected
const ALLOWED_APPOINTMENT_STATUSES = [
  'NEW',
  'PENDING',
  'CONFIRMED',
  'SEEN',
  'COMPLETED',
  'CANCELLED',
];

async function applyAppointmentStatusWithEmails(appointment, status, cancellationReason) {
  const normalized = String(status).toUpperCase();
  const storedStatus = normalized === 'COMPLETED' ? 'SEEN' : normalized;
  const update = { status: storedStatus };
  if (storedStatus === 'CANCELLED') {
    update.cancellationReason = String(cancellationReason || '').trim();
  }

  const updated = await Appointment.findByIdAndUpdate(appointment._id, update, {
    new: true,
    runValidators: true,
  });

  try {
    if (storedStatus === 'CONFIRMED') {
      await sendAppointmentConfirmationEmail(updated);
    } else if (storedStatus === 'CANCELLED') {
      await sendAppointmentCancellationEmail(
        updated,
        updated.cancellationReason
      );
    }
  } catch (emailError) {
    console.error(
      `Failed to send patient ${storedStatus.toLowerCase()} email:`,
      emailError.message || emailError
    );
  }

  if (storedStatus === 'CONFIRMED' || storedStatus === 'CANCELLED') {
    try {
      await Notification.deleteMany({ appointmentId: updated._id });
    } catch (notifError) {
      console.error('Failed to remove appointment notification:', notifError.message || notifError);
    }
  }

  return updated;
}

function sendEmailActionHtml(res, statusCode, { title, message, variant }) {
  res.status(statusCode).send(
    renderActionResultPage({ title, message, variant })
  );
}

// @desc    Confirm appointment from admin email link
// @route   GET /api/statistics/appointments/actions/confirm
// @access  Public (signed token)
exports.confirmAppointmentByEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return sendEmailActionHtml(res, 400, {
        title: 'Invalid link',
        message: 'This confirmation link is missing or invalid.',
        variant: 'error',
      });
    }

    const payload = verifyAppointmentAction(token, 'confirm');
    if (!payload) {
      return sendEmailActionHtml(res, 400, {
        title: 'Link expired',
        message: 'This confirmation link has expired or is invalid. Please use the admin dashboard.',
        variant: 'error',
      });
    }

    const appointment = await Appointment.findById(payload.appointmentId);
    if (!appointment) {
      return sendEmailActionHtml(res, 404, {
        title: 'Not found',
        message: 'This appointment could not be found.',
        variant: 'error',
      });
    }

    if (appointment.status === 'CONFIRMED') {
      return sendEmailActionHtml(res, 200, {
        title: 'Already confirmed',
        message: `The appointment for ${appointment.patientName} is already confirmed.`,
        variant: 'success',
      });
    }

    if (['CANCELLED', 'SEEN', 'COMPLETED'].includes(appointment.status)) {
      return sendEmailActionHtml(res, 400, {
        title: 'Cannot confirm',
        message: `This appointment is ${appointment.status.toLowerCase()} and can no longer be confirmed.`,
        variant: 'error',
      });
    }

    await applyAppointmentStatusWithEmails(appointment, 'CONFIRMED');

    return sendEmailActionHtml(res, 200, {
      title: 'Appointment confirmed',
      message: `The appointment for ${appointment.patientName} on ${formatLongDate(appointment.appointmentDate)} at ${appointment.appointmentTime} has been confirmed. A confirmation email was sent to the patient.`,
      variant: 'success',
    });
  } catch (error) {
    console.error('Email confirm action error:', error);
    return sendEmailActionHtml(res, 500, {
      title: 'Something went wrong',
      message: 'We could not confirm this appointment. Please try again from the admin dashboard.',
      variant: 'error',
    });
  }
};

// @desc    Cancel appointment from admin email link
// @route   GET /api/statistics/appointments/actions/cancel
// @access  Public (signed token)
exports.cancelAppointmentByEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return sendEmailActionHtml(res, 400, {
        title: 'Invalid link',
        message: 'This cancellation link is missing or invalid.',
        variant: 'error',
      });
    }

    const payload = verifyAppointmentAction(token, 'cancel');
    if (!payload) {
      return sendEmailActionHtml(res, 400, {
        title: 'Link expired',
        message: 'This cancellation link has expired or is invalid. Please use the admin dashboard.',
        variant: 'error',
      });
    }

    const appointment = await Appointment.findById(payload.appointmentId);
    if (!appointment) {
      return sendEmailActionHtml(res, 404, {
        title: 'Not found',
        message: 'This appointment could not be found.',
        variant: 'error',
      });
    }

    if (appointment.status === 'CANCELLED') {
      return sendEmailActionHtml(res, 200, {
        title: 'Already cancelled',
        message: `The appointment for ${appointment.patientName} is already cancelled.`,
        variant: 'success',
      });
    }

    if (['SEEN', 'COMPLETED'].includes(appointment.status)) {
      return sendEmailActionHtml(res, 400, {
        title: 'Cannot cancel',
        message: `This appointment was already completed and cannot be cancelled.`,
        variant: 'error',
      });
    }

    const defaultReason =
      'Your appointment request could not be confirmed at the requested time. Please book another slot online or contact the clinic.';

    await applyAppointmentStatusWithEmails(
      appointment,
      'CANCELLED',
      defaultReason
    );

    return sendEmailActionHtml(res, 200, {
      title: 'Appointment cancelled',
      message: `The appointment for ${appointment.patientName} has been cancelled. A notification email was sent to the patient.`,
      variant: 'success',
    });
  } catch (error) {
    console.error('Email cancel action error:', error);
    return sendEmailActionHtml(res, 500, {
      title: 'Something went wrong',
      message: 'We could not cancel this appointment. Please try again from the admin dashboard.',
      variant: 'error',
    });
  }
};

// @desc    Permanently delete an appointment record
// @route   DELETE /api/statistics/appointments/:id
// @access  Private/Protected
exports.deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    await Notification.deleteMany({ appointmentId: appointment._id });
    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Appointment permanently deleted',
      data: { id: appointment._id.toString() },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting appointment',
      error: error.message,
    });
  }
};

// @desc    Send appointment reminder email to patient
// @route   POST /api/statistics/appointments/:id/reminder
// @access  Private/Protected
exports.sendAppointmentReminder = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const email = String(appointment.email || '').trim();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'This appointment has no email address on file',
      });
    }

    const status = String(appointment.status || '').toUpperCase();
    if (status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot send a reminder for a cancelled appointment',
      });
    }

    const emailResult = await sendAppointmentReminderEmail(appointment);
    if (!emailResult.sent) {
      return res.status(503).json({
        success: false,
        message:
          'Email could not be sent. Check SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS) in backend/.env',
      });
    }

    res.status(200).json({
      success: true,
      message: `Reminder email sent to ${email}`,
    });
  } catch (error) {
    console.error('sendAppointmentReminder error:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminder email',
      error: error.message,
    });
  }
};

// @desc    Send patient email (reminder, follow-up, treatment summary)
// @route   POST /api/statistics/appointments/:id/email
// @access  Private/Protected
exports.sendPatientAppointmentEmail = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    const type = String(req.body?.type || 'reminder').toLowerCase();

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const email = String(appointment.email || '').trim();
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'This appointment has no email address on file',
      });
    }

    const status = String(appointment.status || '').toUpperCase();
    if (status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot email patient for a cancelled appointment',
      });
    }

    let emailResult;
    let successMessage;

    emailResult = await sendPatientEmailByType(appointment, type);
    if (type === 'follow_up' || type === 'followup') {
      successMessage = `Follow-up instructions sent to ${email}`;
    } else if (type === 'treatment_summary' || type === 'summary') {
      successMessage = `Treatment summary sent to ${email}`;
    } else if (type === 'book_appointment') {
      successMessage = `Booking invitation sent to ${email}`;
    } else if (type === 'appointment_due') {
      successMessage = `Appointment due notice sent to ${email}`;
    } else {
      successMessage = `Reminder email sent to ${email}`;
    }

    if (!emailResult.sent) {
      return res.status(503).json({
        success: false,
        message:
          'Email could not be sent. Check SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS) in backend/.env',
      });
    }

    res.status(200).json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    console.error('sendPatientAppointmentEmail error:', error.message || error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message,
    });
  }
};

// @desc    Get single appointment details
// @route   GET /api/statistics/appointments/:id
// @access  Private/Protected
exports.getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const relatedAppointments = await Appointment.find({
      email: String(appointment.email).trim().toLowerCase(),
    })
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...mapAppointmentDetail(appointment),
        patientProfile: buildPatientProfileForAppointment(
          appointment,
          relatedAppointments
        ),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message,
    });
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status',
      });
    }

    const normalized = String(status).toUpperCase();
    if (!ALLOWED_APPOINTMENT_STATUSES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment status',
      });
    }

    if (normalized === 'CANCELLED') {
      const reason = String(cancellationReason || '').trim();
      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a cancellation reason',
        });
      }
    }

    const storedStatus = normalized === 'COMPLETED' ? 'SEEN' : normalized;
    const update = { status: storedStatus };
    if (normalized === 'CANCELLED') {
      update.cancellationReason = String(cancellationReason).trim();
    }

    const appointment = await Appointment.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    let emailResult = null;
    try {
      if (storedStatus === 'CONFIRMED') {
        emailResult = await sendAppointmentConfirmationEmail(appointment);
      } else if (storedStatus === 'CANCELLED') {
        emailResult = await sendAppointmentCancellationEmail(
          appointment,
          appointment.cancellationReason
        );
      }
    } catch (emailError) {
      console.error('Failed to send appointment email:', emailError);
      emailResult = { sent: false, error: emailError.message };
    }

    if (storedStatus === 'CONFIRMED' || storedStatus === 'CANCELLED') {
      try {
        await Notification.deleteMany({ appointmentId: appointment._id });
      } catch (notifError) {
        console.error('Failed to remove appointment notification:', notifError.message || notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment,
        detail: mapAppointmentDetail(appointment),
        listItem: mapAppointmentListItem(appointment),
        email: emailResult,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating appointment',
      error: error.message,
    });
  }
};

// @desc    Download clinical scan (patient email link, signed token)
// @route   GET /api/statistics/clinical-scans/download?token=...
// @access  Public (valid token required)
exports.downloadClinicalScan = async (req, res) => {
  try {
    const payload = verifyClinicalScanDownload(req.query.token);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'This download link is invalid or has expired.',
      });
    }

    const { appointmentId, storedName } = payload;
    const safeName = path.basename(String(storedName || ''));
    if (!safeName) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file reference',
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Clinical record not found',
      });
    }

    const scanMeta = (appointment.checkup?.scans || []).find(
      (s) => s.storedName === safeName
    );
    if (!scanMeta) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const filePath = path.join(clinicalRoot, appointmentId, safeName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    const downloadName = scanMeta.originalName || safeName;
    return res.download(filePath, downloadName);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Download failed',
    });
  }
};

// @desc    Upload clinical scan images for an appointment
// @route   POST /api/statistics/appointments/:id/clinical-scans
// @access  Private/Protected
exports.uploadClinicalScans = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'No image files were uploaded',
      });
    }

    if (!appointment.checkup) {
      appointment.checkup = {};
    }

    const added = req.files.map((f) => ({
      storedName: f.filename,
      originalName: f.originalname || f.filename,
      mimeType: f.mimetype || '',
      size: f.size || 0,
      uploadedAt: new Date(),
    }));

    appointment.checkup.scans = [...(appointment.checkup.scans || []), ...added];
    appointment.markModified('checkup');
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Images uploaded',
      data: {
        scans: mapScansForClient(id, appointment.checkup.scans),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading clinical images',
      error: error.message,
    });
  }
};

// @desc    Remove a clinical scan image
// @route   DELETE /api/statistics/appointments/:id/clinical-scans/:storedName
// @access  Private/Protected
exports.deleteClinicalScan = async (req, res, next) => {
  try {
    const { id, storedName } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const safeName = path.basename(String(storedName || ''));
    const filePath = path.join(clinicalRoot, id, safeName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (appointment.checkup?.scans) {
      appointment.checkup.scans = appointment.checkup.scans.filter(
        (s) => s.storedName !== safeName
      );
      appointment.markModified('checkup');
      await appointment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Image removed',
      data: {
        scans: mapScansForClient(id, appointment.checkup?.scans || []),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing clinical image',
      error: error.message,
    });
  }
};

// @desc    Complete checkup and mark appointment as SEEN
// @route   POST /api/statistics/appointments/:id/checkup
// @access  Private/Protected
exports.completeAppointmentCheckup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      complaint = '',
      clinicalObs = '',
      primaryDiagnosis = '',
      diagnostics = [],
      treatment = [],
      prescriptions = '',
      followUp = '',
      postOpInstructions = [],
      additionalNotes = '',
      scanNames = [],
      isEdit = false,
      date,
      view,
      page,
      limit,
      search,
      status: statusFilter,
    } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot complete checkup for a cancelled appointment',
      });
    }

    const editing =
      isEdit === true ||
      isEdit === 'true' ||
      (appointment.checkup && appointment.checkup.completedAt);

    const completedAt =
      editing && appointment.checkup?.completedAt
        ? appointment.checkup.completedAt
        : new Date();

    if (!editing) {
      appointment.status = 'SEEN';
    }

    const priorScans = appointment.checkup?.scans || [];

    appointment.checkup = {
      complaint: String(complaint || '').trim(),
      clinicalObs: String(clinicalObs || '').trim(),
      primaryDiagnosis: String(primaryDiagnosis || '').trim(),
      diagnostics: Array.isArray(diagnostics) ? diagnostics : [],
      treatment: Array.isArray(treatment)
        ? treatment.filter(Boolean).map(String)
        : treatment
          ? [String(treatment)]
          : [],
      prescriptions: String(prescriptions || '').trim(),
      followUp: String(followUp || '').trim(),
      postOpInstructions: Array.isArray(postOpInstructions)
        ? postOpInstructions.filter(Boolean).map(String)
        : [],
      additionalNotes: String(additionalNotes || '').trim(),
      scanNames: Array.isArray(scanNames)
        ? scanNames.filter(Boolean).map(String)
        : [],
      scans: priorScans,
      completedAt,
    };
    await appointment.save();

    const overview = await buildAppointmentsPageOverview({
      date,
      view,
      page,
      limit,
      search,
      status: statusFilter,
    });

    res.status(200).json({
      success: true,
      message: editing
        ? 'Clinical record updated'
        : 'Checkup saved and appointment marked as seen',
      data: {
        appointment,
        listItem: mapAppointmentListItem(appointment),
        overview: {
          statCards: overview.statCards,
          upcomingAppointments: overview.upcomingAppointments,
          patientsSeen: overview.patientsSeen,
          allAppointments: overview.allAppointments,
          dayCalendar: overview.dayCalendar,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error saving checkup',
      error: error.message,
    });
  }
};

// @desc    Get admin notifications
// @route   GET /api/statistics/notifications
// @access  Private/Protected
exports.getAdminNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ isRead: false })
        .sort({ createdAt: -1 })
        .limit(limit),
      Notification.countDocuments({ isRead: false }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        unreadCount,
        total: notifications.length,
        notifications: notifications.map(mapNotificationRow),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/statistics/notifications/:id/read
// @access  Private/Protected
exports.markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      data: mapNotificationRow(notification),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/statistics/notifications/read-all
// @access  Private/Protected
exports.markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: error.message,
    });
  }
};

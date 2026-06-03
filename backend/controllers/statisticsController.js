const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { getTodayRange, parseAppointmentDate } = require('../utils/dateUtils');
const {
  getWeekRange,
  buildOccupancyGrid,
  buildServicesBreakdown,
  buildStaffProductivity,
  mapAppointmentRow,
  formatShortDate,
  formatTimeAgo,
  formatLongDate,
  getInitials,
  getArrivalSubtitle,
} = require('../utils/dashboardHelpers');
const {
  buildAppointmentsPageOverview,
  mapAppointmentListItem,
} = require('../utils/appointmentsPageHelpers');
const {
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail,
  sendAdminNewAppointmentEmail,
} = require('../utils/emailService');
const { verifyAppointmentAction } = require('../utils/appointmentActionTokens');
const { renderActionResultPage } = require('../utils/emailHtmlPages');

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
  ]);

  const todayAppointments = todayAppointmentsRaw.map(mapAppointmentRow);
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
  const nextAppt =
    todayAppointmentsRaw.find((a) =>
      ['NEW', 'PENDING', 'CONFIRMED'].includes(a.status)
    ) || todayAppointmentsRaw[0];

  if (nextAppt) {
    const previousVisit = await Appointment.findOne({
      email: nextAppt.email,
      _id: { $ne: nextAppt._id },
      appointmentDate: { $lt: nextAppt.appointmentDate },
    }).sort({ appointmentDate: -1 });

    const hasAlert =
      nextAppt.notes &&
      /allerg|alert|medical/i.test(nextAppt.notes);

    nextPatient = {
      initials: getInitials(nextAppt.patientName),
      subtitle: getArrivalSubtitle(
        nextAppt.appointmentDate,
        nextAppt.appointmentTime
      ),
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
    staff,
    pendingConfirmations,
    nextPatient,
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
      return respondBookingAccepted(res, existing, true);
    }

    const appointment = await Appointment.create({
      ...normalized,
      status: 'NEW',
    });

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

    try {
      await sendAdminNewAppointmentEmail(appointment);
    } catch (emailError) {
      console.error('Failed to send admin appointment notification:', emailError);
    }

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

  if (storedStatus === 'CONFIRMED') {
    await sendAppointmentConfirmationEmail(updated);
  } else if (storedStatus === 'CANCELLED') {
    await sendAppointmentCancellationEmail(
      updated,
      updated.cancellationReason
    );
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

    res.status(200).json({
      success: true,
      data: mapAppointmentDetail(appointment),
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

// @desc    Complete checkup and mark appointment as SEEN
// @route   POST /api/statistics/appointments/:id/checkup
// @access  Private/Protected
exports.completeAppointmentCheckup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      complaint = '',
      clinicalObs = '',
      diagnostics = [],
      treatment = [],
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

    appointment.status = 'SEEN';
    appointment.checkup = {
      complaint: String(complaint || '').trim(),
      clinicalObs: String(clinicalObs || '').trim(),
      diagnostics: Array.isArray(diagnostics) ? diagnostics : [],
      treatment: Array.isArray(treatment)
        ? treatment.filter(Boolean)
        : treatment
          ? [String(treatment)]
          : [],
      completedAt: new Date(),
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
      message: 'Checkup saved and appointment marked as seen',
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
      Notification.find({})
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

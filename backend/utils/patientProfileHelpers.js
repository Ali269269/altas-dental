const { formatLongDate, formatShortDate } = require('./dashboardHelpers');
const { mapScansForClient } = require('./clinicalScanUrls');

const MONTHS_UPPER = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function normalizeStatus(status) {
  const upper = String(status || 'PENDING').toUpperCase();
  if (upper === 'SEEN') return 'COMPLETED';
  if (upper === 'NEW') return 'PENDING';
  if (upper === 'COMPLETED') return 'COMPLETED';
  return upper;
}

function splitUpcomingDisplay(date) {
  const d = new Date(date);
  return {
    upcomingDate: String(d.getDate()),
    upcomingMonth: `${MONTHS_UPPER[d.getMonth()]}, ${d.getFullYear()}`,
    upcomingYear: String(d.getFullYear()),
  };
}

function mapCheckupToHistoryEntry(appt) {
  const c = appt.checkup || {};
  const hasCheckup =
    Boolean(c.complaint?.trim()) ||
    Boolean(c.clinicalObs?.trim()) ||
    Boolean(c.primaryDiagnosis?.trim()) ||
    (Array.isArray(c.diagnostics) && c.diagnostics.length > 0) ||
    (Array.isArray(c.treatment) && c.treatment.length > 0) ||
    Boolean(c.additionalNotes?.trim()) ||
    (Array.isArray(c.postOpInstructions) && c.postOpInstructions.length > 0);

  if (!hasCheckup) return null;

  const stamp = c.completedAt || appt.updatedAt || appt.appointmentDate;
  const d = new Date(stamp);

  const appointmentId = appt._id.toString();

  return {
    appointmentId,
    specialty: appt.specialty || '',
    date: formatLongDate(d),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    complaint: c.complaint?.trim() || '—',
    clinicalObs: c.clinicalObs?.trim() || '—',
    primaryDiagnosis: c.primaryDiagnosis?.trim() || '',
    diagnostics: (c.diagnostics || []).map((item) => ({
      label: typeof item === 'string' ? item : item.label,
      tag: Boolean(typeof item === 'object' && item.tag),
    })),
    treatment: (c.treatment || []).map((t) => String(t)),
    prescriptions: c.prescriptions?.trim() || '',
    followUp: c.followUp?.trim() || '',
    postOpInstructions: Array.isArray(c.postOpInstructions)
      ? c.postOpInstructions
      : [],
    additionalNotes: c.additionalNotes?.trim() || '',
    scans: mapScansForClient(appointmentId, c.scans),
  };
}

function buildPatientProfileForAppointment(appointment, relatedAppointments = []) {
  const email = String(appointment.email || '').trim().toLowerCase();
  const sorted = [...relatedAppointments].sort(
    (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
  );

  const currentId = appointment._id.toString();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const previousVisits = sorted
    .filter((a) => {
      const id = a._id.toString();
      if (id === currentId) return false;
      const status = String(a.status || '').toUpperCase();
      return status === 'SEEN' || status === 'COMPLETED' || status === 'CONFIRMED';
    })
    .map((a) => ({
      specialty: a.specialty,
      date: formatShortDate(a.appointmentDate),
    }));

  const earliest = sorted.length
    ? sorted.reduce((min, a) =>
        new Date(a.createdAt) < new Date(min.createdAt) ? a : min
      )
    : appointment;

  const historyEntries = sorted
    .map(mapCheckupToHistoryEntry)
    .filter(Boolean);

  const checkup = appointment.checkup || {};
  const clinicalObs = checkup.clinicalObs?.trim();
  const bookingNotes = appointment.notes?.trim();

  const notes = [];
  if (bookingNotes) {
    notes.push({
      doctor: 'Atlas Dental Center',
      doctorInitials: 'AD',
      date: `${formatLongDate(appointment.createdAt || appointment.appointmentDate)} · Booking`,
      status: normalizeStatus(appointment.status),
      content: bookingNotes,
    });
  }
  if (clinicalObs && clinicalObs !== bookingNotes) {
    notes.push({
      doctor: 'Clinical Team',
      doctorInitials: 'CT',
      date: formatLongDate(checkup.completedAt || appointment.updatedAt),
      status: 'COMPLETED',
      content: clinicalObs,
    });
  }

  const upcoming = splitUpcomingDisplay(appointment.appointmentDate);
  const status = normalizeStatus(appointment.status);

  return {
    id: `#PV-${currentId.slice(-4).toUpperCase()}`,
    name: appointment.patientName,
    email: appointment.email,
    phone: appointment.phone,
    specialty: appointment.specialty,
    lastVisit:
      previousVisits[0]?.date ||
      (status === 'COMPLETED' ? formatShortDate(appointment.appointmentDate) : '—'),
    nextAppt: `${formatShortDate(appointment.appointmentDate)}, ${appointment.appointmentTime}`,
    status,
    patientSince: formatShortDate(earliest.createdAt || appointment.createdAt),
    previousVisits,
    ...upcoming,
    upcomingService: appointment.specialty,
    upcomingDoctor: 'Atlas Dental Team',
    upcomingTime: appointment.appointmentTime,
    upcomingStatus: status,
    clinicalNote:
      clinicalObs ||
      bookingNotes ||
      `No clinical observations recorded for ${appointment.patientName}.`,
    clinicalNoteDate: checkup.completedAt
      ? `Recorded ${formatLongDate(checkup.completedAt)}`
      : bookingNotes
        ? `Booking note · ${formatLongDate(appointment.createdAt || appointment.appointmentDate)}`
        : 'No record date',
    documents: mapScansForClient(currentId, checkup.scans).map((s) => ({
      name: s.originalName,
      added: checkup.completedAt
        ? formatShortDate(checkup.completedAt)
        : formatShortDate(appointment.updatedAt),
      size: s.size ? `${Math.round(s.size / 1024)} KB` : '—',
      icon: /^image\//i.test(s.mimeType) ? 'img' : 'doc',
      url: s.url,
    })),
    postOpInstructions: Array.isArray(checkup.postOpInstructions)
      ? checkup.postOpInstructions
      : [],
    historyEntries,
    notes,
  };
}

module.exports = {
  buildPatientProfileForAppointment,
  normalizeStatus,
};

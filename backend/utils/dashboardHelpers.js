const DAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIME_SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
const { toDateKey } = require('./dateUtils');
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const STAFF_TEMPLATE = [
  { name: 'Dr. Aris Thorne', role: 'Principal Dentist', avg: '45 min', avatar: 'AT', specialties: ['Aligneurs', 'Orthodontie', 'Implantologie'] },
  { name: 'Dr. Julian Vane', role: 'Associate Dentist', avg: '52 min', avatar: 'JV', specialties: ['Parodontologie', 'Endodontie', 'Chirurgie orale'] },
  { name: 'Sarah Jenkins', role: 'Lead Hygienist', avg: '30 min', avatar: 'SJ', specialties: ['Réhabilitation totale du sourire', 'Dentisterie Esthétique', 'Pédodontie', 'Prothèse dentaire'] },
];

function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return { weekStart, weekEnd };
}

function parseAppointmentTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = (match[3] || '').toUpperCase();

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return { hour, minute, period: period || (hour >= 12 ? 'PM' : 'AM') };
}

function formatDisplayTime(timeStr) {
  const parsed = parseAppointmentTime(timeStr);
  if (!parsed) {
    return { time: timeStr || '--:--', period: '' };
  }

  let displayHour = parsed.hour % 12;
  if (displayHour === 0) displayHour = 12;
  const period = parsed.hour >= 12 ? 'PM' : 'AM';

  return {
    time: `${String(displayHour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')}`,
    period,
  };
}

function timeToSlotIndex(timeStr) {
  const parsed = parseAppointmentTime(timeStr);
  if (!parsed) return -1;

  const totalMinutes = parsed.hour * 60 + parsed.minute;
  const slotMinutes = TIME_SLOTS.map((t) => {
    const [h] = t.split(':').map(Number);
    return h * 60;
  });

  let bestIdx = 0;
  let bestDiff = Infinity;
  slotMinutes.forEach((mins, idx) => {
    const diff = Math.abs(totalMinutes - mins);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIdx = idx;
    }
  });
  return bestIdx;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatAvgMinutes(minutes) {
  if (!minutes || !Number.isFinite(minutes)) return null;
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

function formatShortDate(date) {
  const d = new Date(date);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function formatLongDate(date) {
  const d = new Date(date);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTimeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return 'Just now';
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getArrivalSubtitle(appointmentDate, appointmentTime) {
  const parsed = parseAppointmentTime(appointmentTime);
  if (!parsed) return 'Scheduled';

  const now = new Date();
  const appt = new Date(appointmentDate);
  appt.setHours(parsed.hour, parsed.minute, 0, 0);

  const diffMs = appt.getTime() - now.getTime();
  if (diffMs < 0) return 'In progress';
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `Arriving in ${mins} mins`;
  const hours = Math.floor(mins / 60);
  return `Arriving in ${hours}h ${mins % 60}m`;
}

function countToLevel(count, maxCount) {
  if (!count || count <= 0) return 0;
  if (!maxCount || maxCount <= 0) return 1;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function buildOccupancyGrid(appointments) {
  const grid = TIME_SLOTS.map(() => DAYS_SHORT.map(() => 0));
  const { weekStart } = getWeekRange();

  appointments.forEach((appt) => {
    const apptDate = new Date(appt.appointmentDate);
    const dayIndex = Math.floor(
      (apptDate.setHours(0, 0, 0, 0) - weekStart.getTime()) / 86400000
    );
    if (dayIndex < 0 || dayIndex > 6) return;

    const slotIndex = timeToSlotIndex(appt.appointmentTime);
    if (slotIndex < 0 || slotIndex >= TIME_SLOTS.length) return;

    grid[slotIndex][dayIndex] += 1;
  });

  let maxCount = 0;
  let peak = { day: 'Tue', time: '10:00 am', count: 0 };

  grid.forEach((row, ti) => {
    row.forEach((count, di) => {
      if (count > maxCount) {
        maxCount = count;
        const dayName = DAYS_SHORT[di];
        const timeLabel = TIME_SLOTS[ti].replace(':00', ':00 am').replace('12:00', '12:00 pm').replace('14:00', '2:00 pm').replace('16:00', '4:00 pm').replace('18:00', '6:00 pm').replace('08:00', '8:00 am').replace('10:00', '10:00 am');
        peak = { day: dayName.charAt(0) + dayName.slice(1).toLowerCase(), time: formatPeakTime(TIME_SLOTS[ti]), count };
      }
    });
  });

  const levelGrid = grid.map((row) =>
    row.map((count) => countToLevel(count, maxCount))
  );

  const peakLabel =
    maxCount > 0
      ? `Peak: ${peak.day} ${peak.time}`
      : 'Peak: —';

  return { grid: levelGrid, peakLabel };
}

function formatPeakTime(slot) {
  const [h] = slot.split(':').map(Number);
  if (h === 8) return '8:00 am';
  if (h === 10) return '10:00 am';
  if (h === 12) return '12:00 pm';
  if (h === 14) return '2:00 pm';
  if (h === 16) return '4:00 pm';
  if (h === 18) return '6:00 pm';
  return slot;
}

const DEFAULT_SERVICE_NAMES = [
  'Aligneurs',
  'Parodontologie',
  'Endodontie',
  'Réhabilitation totale du sourire',
];

function buildServicesBreakdown(appointments) {
  const counts = {};
  appointments.forEach((a) => {
    counts[a.specialty] = (counts[a.specialty] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, c]) => sum + c, 0);

  if (total === 0) {
    return {
      services: DEFAULT_SERVICE_NAMES.map((name) => ({ name, pct: 0 })),
      topPerformer: '—',
    };
  }

  const services = sorted.slice(0, 4).map(([name, count]) => ({
    name,
    pct: Math.round((count / total) * 100),
  }));

  for (const name of DEFAULT_SERVICE_NAMES) {
    if (services.length >= 4) break;
    if (!services.find((s) => s.name === name)) {
      services.push({ name, pct: 0 });
    }
  }

  return {
    services: services.slice(0, 4),
    topPerformer: sorted[0][0],
  };
}

function buildStaffProductivity(appointments) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const seenAppts = appointments.filter(
    (a) =>
      ['SEEN', 'COMPLETED'].includes(a.status) &&
      new Date(a.appointmentDate) >= thirtyDaysAgo
  );

  const counts = {};
  const durationTotals = {};
  const durationCounts = {};

  seenAppts.forEach((a) => {
    counts[a.specialty] = (counts[a.specialty] || 0) + 1;

    if (a.checkup?.completedAt) {
      const parsed = parseAppointmentTime(a.appointmentTime);
      const start = new Date(a.appointmentDate);
      if (parsed) start.setHours(parsed.hour, parsed.minute, 0, 0);
      const end = new Date(a.checkup.completedAt);
      const mins = (end.getTime() - start.getTime()) / 60000;
      if (mins > 0 && mins < 480) {
        durationTotals[a.specialty] = (durationTotals[a.specialty] || 0) + mins;
        durationCounts[a.specialty] = (durationCounts[a.specialty] || 0) + 1;
      }
    }
  });

  const members = STAFF_TEMPLATE.map((member) => {
    const seen = member.specialties.reduce(
      (sum, specialty) => sum + (counts[specialty] || 0),
      0
    );

    let totalMins = 0;
    let totalCount = 0;
    member.specialties.forEach((specialty) => {
      totalMins += durationTotals[specialty] || 0;
      totalCount += durationCounts[specialty] || 0;
    });

    const avgMins = totalCount > 0 ? totalMins / totalCount : null;

    return {
      name: member.name,
      role: member.role,
      seen,
      avg: formatAvgMinutes(avgMins) || member.avg,
      avatar: member.avatar,
    };
  });

  const maxSeen = Math.max(...members.map((m) => m.seen), 1);
  return members.map((member) => ({
    ...member,
    progress: Math.round((member.seen / maxSeen) * 100),
  }));
}

function buildUpcomingAppointments(appointments) {
  const now = new Date();
  const today = startOfDay(now);
  const openStatuses = ['NEW', 'PENDING', 'CONFIRMED'];

  return appointments
    .filter((a) => openStatuses.includes(a.status))
    .map((a) => {
      const parsed = parseAppointmentTime(a.appointmentTime);
      const apptDate = new Date(a.appointmentDate);
      if (parsed) apptDate.setHours(parsed.hour, parsed.minute, 0, 0);
      return { appt: a, apptDate };
    })
    .filter(({ apptDate }) => apptDate >= now)
    .sort((a, b) => a.apptDate - b.apptDate)
    .map(({ appt }) => mapUpcomingAppointmentRow(appt, today));
}

function mapUpcomingAppointmentRow(appt, today = startOfDay(new Date())) {
  const row = mapAppointmentRow(appt);
  const apptDay = startOfDay(appt.appointmentDate);
  let dateLabel = formatShortDate(appt.appointmentDate);

  if (apptDay.getTime() === today.getTime()) {
    dateLabel = 'Today';
  } else if (apptDay.getTime() === addDays(today, 1).getTime()) {
    dateLabel = 'Tomorrow';
  }

  return { ...row, dateLabel, appointmentDate: toDateKey(appt.appointmentDate) };
}

function appointmentHasStoredCheckup(appt) {
  const c = appt?.checkup;
  if (!c) return false;
  return (
    Boolean(String(c.complaint || '').trim()) ||
    Boolean(String(c.clinicalObs || '').trim()) ||
    Boolean(String(c.primaryDiagnosis || '').trim()) ||
    (Array.isArray(c.diagnostics) && c.diagnostics.length > 0) ||
    (Array.isArray(c.treatment) && c.treatment.length > 0) ||
    Boolean(String(c.prescriptions || '').trim()) ||
    Boolean(String(c.followUp || '').trim()) ||
    (Array.isArray(c.postOpInstructions) && c.postOpInstructions.length > 0) ||
    Boolean(String(c.additionalNotes || '').trim())
  );
}

function mapAppointmentRow(appt) {
  const { time, period } = formatDisplayTime(appt.appointmentTime);
  return {
    id: appt._id.toString(),
    time,
    period,
    name: appt.patientName,
    type: appt.specialty,
    status: appt.status,
  };
}

module.exports = {
  DAYS_SHORT,
  TIME_SLOTS,
  STAFF_TEMPLATE,
  getWeekRange,
  parseAppointmentTime,
  formatDisplayTime,
  formatShortDate,
  formatLongDate,
  formatTimeAgo,
  getInitials,
  getArrivalSubtitle,
  buildOccupancyGrid,
  buildServicesBreakdown,
  buildStaffProductivity,
  buildUpcomingAppointments,
  mapAppointmentRow,
  mapUpcomingAppointmentRow,
  appointmentHasStoredCheckup,
};

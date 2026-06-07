const Appointment = require('../models/Appointment');
const { getTodayRange } = require('./dateUtils');
const {
  formatShortDate,
  parseAppointmentTime,
} = require('./dashboardHelpers');
const {
  SEEN_STATUSES,
  isSeenStatus,
  addDays,
  parseAnchorDate,
} = require('./appointmentsPageHelpers');

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatNextAppt(date, timeStr) {
  const d = new Date(date);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${timeStr}`;
}

function mapPatientsPageStatus(status) {
  const upper = String(status || 'PENDING').toUpperCase();
  if (isSeenStatus(upper)) return 'COMPLETED';
  if (upper === 'CONFIRMED') return 'ACTIVE';
  if (upper === 'CANCELLED') return 'CANCELLED';
  if (upper === 'ACTIVE') return 'ACTIVE';
  return 'PENDING';
}

function matchStatusFilter(rowStatus, statusFilter) {
  if (!statusFilter || statusFilter === 'All Statuses') return true;
  const filter = statusFilter.toUpperCase();
  const row = rowStatus.toUpperCase();
  if (filter === 'COMPLETED') return row === 'COMPLETED';
  if (filter === 'ACTIVE') return row === 'ACTIVE' || row === 'CONFIRMED';
  return row === filter;
}

function pickPrimaryAppointment(appts) {
  const now = startOfDay(new Date());
  const openStatuses = ['NEW', 'PENDING', 'CONFIRMED'];

  const upcoming = appts
    .filter((a) => {
      const day = startOfDay(new Date(a.appointmentDate));
      return day >= now && openStatuses.includes(String(a.status || '').toUpperCase());
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

  if (upcoming.length) return upcoming[0];

  return [...appts].sort(
    (a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate)
  )[0];
}

function getLastVisitDate(appts) {
  const seen = appts
    .filter((a) => isSeenStatus(a.status))
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
  return seen[0] ? startOfDay(new Date(seen[0].appointmentDate)) : null;
}

function getNextApptLabel(appts) {
  const now = startOfDay(new Date());
  const closed = ['CANCELLED', ...SEEN_STATUSES];

  const upcoming = appts
    .filter((a) => {
      const day = startOfDay(new Date(a.appointmentDate));
      const status = String(a.status || '').toUpperCase();
      return day >= now && !closed.includes(status);
    })
    .sort((a, b) => {
      const da = new Date(a.appointmentDate);
      const db = new Date(b.appointmentDate);
      if (da.getTime() !== db.getTime()) return da - db;
      const pa = parseAppointmentTime(a.appointmentTime);
      const pb = parseAppointmentTime(b.appointmentTime);
      if (pa && pb) return pa.hour * 60 + pa.minute - (pb.hour * 60 + pb.minute);
      return 0;
    });

  if (!upcoming.length) return 'None Scheduled';
  const next = upcoming[0];
  return formatNextAppt(next.appointmentDate, next.appointmentTime);
}

function getMostRecentCreatedAt(appts) {
  let latest = 0;
  appts.forEach((a) => {
    const t = new Date(a.createdAt || 0).getTime();
    if (t > latest) latest = t;
  });
  return latest ? new Date(latest) : null;
}

function buildPatientRowFromAppointments(appts) {
  const primary = pickPrimaryAppointment(appts);
  const lastVisit = getLastVisitDate(appts);
  const recentAt = getMostRecentCreatedAt(appts);

  return {
    id: primary._id.toString(),
    name: primary.patientName,
    patientId: `#PV-${primary._id.toString().slice(-4).toUpperCase()}`,
    email: primary.email,
    phone: primary.phone,
    specialty: primary.specialty,
    lastVisit: lastVisit ? formatShortDate(lastVisit) : '—',
    nextAppt: getNextApptLabel(appts),
    status: mapPatientsPageStatus(primary.status),
    rawStatus: primary.status,
    _emailKey: String(primary.email || '').trim().toLowerCase(),
    _lastVisitDate: lastVisit,
    _recentAt: recentAt,
  };
}

async function computePatientStats() {
  const all = await Appointment.find({})
    .select('email createdAt')
    .sort({ createdAt: 1 })
    .lean();

  const firstByEmail = new Map();
  all.forEach((a) => {
    const key = String(a.email || '').trim().toLowerCase();
    if (!key) return;
    const created = new Date(a.createdAt);
    if (!firstByEmail.has(key) || created < firstByEmail.get(key)) {
      firstByEmail.set(key, created);
    }
  });

  const { today } = getTodayRange();
  const todayEnd = addDays(today, 1);
  const yesterdayStart = addDays(today, -1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  let newThisMonth = 0;
  let newPrevMonth = 0;
  let newToday = 0;
  let newYesterday = 0;

  firstByEmail.forEach((createdAt) => {
    const d = new Date(createdAt);
    if (d >= monthStart && d < monthEnd) newThisMonth += 1;
    if (d >= prevMonthStart && d < monthStart) newPrevMonth += 1;
    if (d >= today && d < todayEnd) newToday += 1;
    if (d >= yesterdayStart && d < today) newYesterday += 1;
  });

  let patientsMonthGrowthPct = null;
  if (newPrevMonth > 0) {
    patientsMonthGrowthPct = Math.round(
      ((newThisMonth - newPrevMonth) / newPrevMonth) * 100
    );
  } else if (newThisMonth > 0) {
    patientsMonthGrowthPct = 100;
  }

  const totalPatientsTodayDelta = newToday - newYesterday;
  const newPatientsTodayDelta = newToday - newYesterday;

  return {
    totalPatients: firstByEmail.size,
    newPatients: newThisMonth,
    newToday,
    totalPatientsTodayDelta,
    newPatientsTodayDelta,
    patientsMonthGrowthPct,
  };
}

async function buildPatientsPageOverview(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const { escapeRegex } = require('./securityHelpers');
  const searchRaw = (query.search || '').trim().slice(0, 200);
  const search = searchRaw ? escapeRegex(searchRaw) : '';
  const statusFilter = (query.status || '').trim();
  const lastVisitParam = (query.lastVisit || '').trim();
  const sortMode = String(query.sort || '').trim().toLowerCase();

  const appointmentFilter = {};
  if (search) {
    appointmentFilter.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const [stats, appointments] = await Promise.all([
    computePatientStats(),
    Appointment.find(appointmentFilter)
      .sort({ appointmentDate: -1, createdAt: -1 })
      .lean(),
  ]);

  const byEmail = new Map();
  appointments.forEach((appt) => {
    const key = String(appt.email || '').trim().toLowerCase();
    if (!key) return;
    if (!byEmail.has(key)) byEmail.set(key, []);
    byEmail.get(key).push(appt);
  });

  let rows = Array.from(byEmail.values()).map(buildPatientRowFromAppointments);

  if (statusFilter && statusFilter !== 'All Statuses') {
    rows = rows.filter((row) => matchStatusFilter(row.status, statusFilter));
  }

  if (lastVisitParam && /^\d{4}-\d{2}-\d{2}/.test(lastVisitParam)) {
    const anchor = parseAnchorDate(lastVisitParam);
    const visitEnd = addDays(anchor, 1);
    rows = rows.filter((row) => {
      if (!row._lastVisitDate) return false;
      const t = row._lastVisitDate.getTime();
      return t >= anchor.getTime() && t < visitEnd.getTime();
    });
  }

  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.patientId.toLowerCase().includes(q) ||
        row.phone.includes(search) ||
        row.email.toLowerCase().includes(q)
    );
  }

  if (sortMode === 'recent') {
    rows.sort((a, b) => {
      const ta = a._recentAt ? a._recentAt.getTime() : 0;
      const tb = b._recentAt ? b._recentAt.getTime() : 0;
      return tb - ta;
    });
  } else {
    rows.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = rows.length;
  const start = (page - 1) * limit;
  const patients = rows.slice(start, start + limit).map(
    ({ _emailKey, _lastVisitDate, _recentAt, ...row }) => row
  );

  return {
    ...stats,
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

module.exports = {
  buildPatientsPageOverview,
  mapPatientsPageStatus,
  computePatientStats,
};

const Appointment = require('../models/Appointment');
const { getTodayRange, toDateKey } = require('./dateUtils');
const {
  getWeekRange,
  parseAppointmentTime,
  formatDisplayTime,
  formatShortDate,
  formatLongDate,
  formatTimeAgo,
} = require('./dashboardHelpers');

const MONTH_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const WEEK_GRID_TIMES = ['08:00', '10:00', '12:00', '02:00', '04:00', '06:00'];
const DAY_VIEW_TIMES = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
];

/** Canonical completed-visit statuses (COMPLETED kept for legacy records). */
const SEEN_STATUSES = ['SEEN', 'COMPLETED'];
const UPCOMING_STATUSES = ['CONFIRMED'];

function isSeenStatus(status) {
  return SEEN_STATUSES.includes(status);
}

function isUpcomingStatus(status) {
  return UPCOMING_STATUSES.includes(status);
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

function getMonthRange(year, month) {
  const monthStart = new Date(year, month, 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(year, month + 1, 1);
  return { monthStart, monthEnd };
}

function getMonthGridMeta(year, month) {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let offset = first.getDay() - 1;
  if (offset < 0) offset = 6;
  return { daysInMonth, offset };
}

function parseAnchorDate(input) {
  if (input && /^\d{4}-\d{2}-\d{2}/.test(String(input))) {
    const [y, m, d] = String(input).slice(0, 10).split('-').map(Number);
    return startOfDay(new Date(y, m - 1, d));
  }
  return startOfDay(new Date());
}

function formatMonthYear(date) {
  return `${MONTHS_FULL[date.getMonth()]} ${date.getFullYear()}`;
}

function formatWeekRange(weekStart) {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  if (sameMonth) {
    return `${MONTHS_FULL[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }
  return `${formatShortDate(weekStart)} - ${formatShortDate(weekEnd)}, ${weekEnd.getFullYear()}`;
}

function formatDayLabel(date) {
  return `${MONTHS_FULL[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function truncateLabel(text, max = 18) {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 3)}...`;
}

function eventColorForAppointment(appt) {
  if (appt.status === 'CANCELLED') return 'red';
  const specialty = (appt.specialty || '').toLowerCase();
  if (/surgery|chirurgie|complex/.test(specialty)) return 'red';
  if (isSeenStatus(appt.status)) return 'gray';
  if (appt.status === 'CONFIRMED') return '#591727';
  return 'gray';
}

function mapCalendarEvent(appt) {
  const time = appt.appointmentTime || '';
  const name = truncateLabel(appt.patientName, 14);
  return {
    appointmentId: appt._id.toString(),
    patientName: appt.patientName,
    time,
    status: appt.status,
    label: `${time} · ${name}`,
    color: eventColorForAppointment(appt),
  };
}

function buildCalendarAppointmentRefs(appointments) {
  const seen = new Set();
  const refs = [];
  appointments.forEach((appt) => {
    const id = appt._id.toString();
    if (seen.has(id)) return;
    seen.add(id);
    const d = new Date(appt.appointmentDate);
    refs.push({
      id,
      patientName: appt.patientName,
      appointmentTime: appt.appointmentTime || '',
      day: String(d.getDate()),
      appointmentDate: toDateKey(d),
    });
  });
  return refs;
}

function timeToWeekSlot(timeStr) {
  const parsed = parseAppointmentTime(timeStr);
  if (!parsed) return '08:00';

  const hour = parsed.hour;
  if (hour < 9) return '08:00';
  if (hour < 11) return '10:00';
  if (hour < 13) return '12:00';
  if (hour < 15) return '02:00';
  if (hour < 17) return '04:00';
  return '06:00';
}

function normalizeDayViewTime(timeStr) {
  const parsed = parseAppointmentTime(timeStr);
  if (!parsed) return timeStr;

  let hour = parsed.hour % 12;
  if (hour === 0) hour = 12;
  const period = parsed.hour >= 12 ? 'PM' : 'AM';
  return `${String(hour).padStart(2, '0')}:${String(parsed.minute).padStart(2, '0')} ${period}`;
}

function mapTableStatus(status) {
  if (isSeenStatus(status)) return 'SEEN';
  if (status === 'CONFIRMED') return 'ACTIVE';
  if (status === 'CANCELLED') return 'CANCELLED';
  return 'PENDING';
}

function formatNextAppt(date, timeStr) {
  const d = new Date(date);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${timeStr}`;
}

function getStatPeriodContext(query = {}) {
  const anchor = parseAnchorDate(query.date);
  const viewMode = query.view || 'month';
  const { today } = getTodayRange();
  const isAnchorToday = startOfDay(anchor).getTime() === today.getTime();

  let rangeStart;
  let rangeEnd;
  let prevRangeStart;
  let prevRangeEnd;
  let periodLabel;

  if (viewMode === 'day') {
    rangeStart = startOfDay(anchor);
    rangeEnd = addDays(rangeStart, 1);
    prevRangeStart = addDays(rangeStart, -1);
    prevRangeEnd = rangeStart;
    periodLabel = isAnchorToday ? 'Today' : formatShortDate(anchor);
  } else if (viewMode === 'week') {
    const week = getWeekRange(anchor);
    rangeStart = week.weekStart;
    rangeEnd = week.weekEnd;
    prevRangeStart = addDays(rangeStart, -7);
    prevRangeEnd = rangeStart;
    periodLabel = 'This Week';
  } else {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const { monthStart, monthEnd } = getMonthRange(year, month);
    rangeStart = monthStart;
    rangeEnd = monthEnd;
    prevRangeStart = new Date(year, month - 1, 1);
    prevRangeEnd = monthStart;
    periodLabel = 'This Month';
  }

  return {
    rangeStart,
    rangeEnd,
    prevRangeStart,
    prevRangeEnd,
    periodLabel,
  };
}

async function buildAppointmentsStatCards(query = {}) {
  const { rangeStart, rangeEnd, prevRangeStart, prevRangeEnd, periodLabel } =
    getStatPeriodContext(query);

  const appointmentInPeriod = {
    appointmentDate: { $gte: rangeStart, $lt: rangeEnd },
  };
  const appointmentInPrevPeriod = {
    appointmentDate: { $gte: prevRangeStart, $lt: prevRangeEnd },
  };

  const [
    totalBookings,
    seenCount,
    leftCount,
    noSeeCount,
    prevTotalBookings,
  ] = await Promise.all([
    Appointment.countDocuments(appointmentInPeriod),
    Appointment.countDocuments({
      ...appointmentInPeriod,
      status: { $in: SEEN_STATUSES },
    }),
    Appointment.countDocuments({
      ...appointmentInPeriod,
      status: { $in: ['NEW', 'PENDING', 'CONFIRMED'] },
    }),
    Appointment.countDocuments({
      ...appointmentInPeriod,
      status: 'CANCELLED',
    }),
    Appointment.countDocuments(appointmentInPrevPeriod),
  ]);

  let badge = null;
  let badgeType = null;
  if (prevTotalBookings > 0) {
    const pct = Math.round(
      ((totalBookings - prevTotalBookings) / prevTotalBookings) * 100
    );
    badge = `${pct >= 0 ? '+' : ''}${pct}%`;
    badgeType = pct >= 0 ? 'positive' : 'negative';
  } else if (totalBookings > 0) {
    badge = `+${totalBookings}`;
    badgeType = 'positive';
  }

  return [
    {
      label: `Total Bookings (${periodLabel})`,
      value: String(totalBookings),
      badge,
      badgeType,
    },
    {
      label: `Patients seen (${periodLabel})`,
      value: String(seenCount),
      badge: null,
      badgeType: null,
    },
    {
      label: `Patients left (${periodLabel})`,
      value: String(leftCount),
      badge: null,
      badgeType: null,
    },
    {
      label: 'No See',
      value: String(noSeeCount),
      badge: null,
      badgeType: null,
    },
  ];
}

function buildMonthEvents(appointments) {
  const events = {};
  appointments.forEach((appt) => {
    const d = new Date(appt.appointmentDate);
    const day = String(d.getDate());
    if (!events[day]) events[day] = [];
    events[day].push(mapCalendarEvent(appt));
  });
  return events;
}

function buildWeekEvents(appointments, weekStart) {
  const events = [];
  appointments.forEach((appt) => {
    const apptDay = startOfDay(new Date(appt.appointmentDate));
    const dayIndex = Math.floor(
      (apptDay.getTime() - weekStart.getTime()) / 86400000
    );
    if (dayIndex < 0 || dayIndex > 6) return;

    events.push({
      ...mapCalendarEvent(appt),
      day: dayIndex,
      gridSlot: timeToWeekSlot(appt.appointmentTime),
      color: eventColorForAppointment(appt) === 'red' ? 'red' : 'blue',
    });
  });
  return events;
}

function buildDayEvents(appointments) {
  return appointments.map((appt) => {
    const colorMap = {
      red: 'red',
      '#591727': 'blue',
      gray: 'blue',
    };
    const baseColor = eventColorForAppointment(appt);
    return {
      ...mapCalendarEvent(appt),
      time: normalizeDayViewTime(appt.appointmentTime),
      label: (appt.specialty || 'Appointment').toUpperCase(),
      name: appt.patientName,
      color: colorMap[baseColor] || 'blue',
    };
  });
}

function mapAppointmentListItem(appt) {
  const { time, period } = formatDisplayTime(appt.appointmentTime);
  const displayStatus = isSeenStatus(appt.status) ? 'SEEN' : appt.status;
  return {
    id: appt._id.toString(),
    time,
    period,
    name: appt.patientName,
    type: appt.specialty,
    status: displayStatus,
  };
}

function filterUpcoming(appointments) {
  return appointments
    .filter((a) => isUpcomingStatus(a.status))
    .map(mapAppointmentListItem);
}

function filterSeen(appointments) {
  return appointments
    .filter((a) => isSeenStatus(a.status))
    .map(mapAppointmentListItem);
}

async function buildTableRows(appointments) {
  const emails = [...new Set(appointments.map((a) => a.email))];
  const lastVisits = {};

  await Promise.all(
    emails.map(async (email) => {
      const prev = await Appointment.findOne({
        email,
        status: { $in: SEEN_STATUSES },
      }).sort({ appointmentDate: -1 });
      lastVisits[email] = prev ? formatLongDate(prev.appointmentDate) : '—';
    })
  );

  return appointments.map((appt) => ({
    id: appt._id.toString(),
    name: appt.patientName,
    patientId: `#PV-${appt._id.toString().slice(-4).toUpperCase()}`,
    email: appt.email,
    phone: appt.phone,
    specialty: appt.specialty,
    lastVisit: lastVisits[appt.email] || '—',
    nextAppt: formatNextAppt(appt.appointmentDate, appt.appointmentTime),
    status: mapTableStatus(appt.status),
    rawStatus: appt.status,
  }));
}

function buildNextUp(appointments, referenceDay) {
  const now = new Date();
  const upcoming = appointments
    .filter((a) => isUpcomingStatus(a.status))
    .map((a) => {
      const parsed = parseAppointmentTime(a.appointmentTime);
      const apptDate = new Date(a.appointmentDate);
      if (parsed) apptDate.setHours(parsed.hour, parsed.minute, 0, 0);
      return { appt: a, apptDate };
    })
    .filter(({ apptDate }) => apptDate >= now)
    .sort((a, b) => a.apptDate - b.apptDate);

  const next = upcoming[0]?.appt;
  if (!next) return null;

  const ref = startOfDay(referenceDay);
  return {
    date: `${MONTHS_SHORT[ref.getMonth()].toUpperCase()} ${ref.getDate()}`,
    name: truncateLabel(next.patientName, 12),
    detail: `${next.specialty} · ${next.appointmentTime}`,
    appointmentId: next._id.toString(),
    phone: next.phone,
  };
}

async function buildAppointmentsPageOverview(query = {}) {
  const anchor = parseAnchorDate(query.date);
  const viewMode = query.view || 'month';
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const { escapeRegex } = require('./securityHelpers');
  const searchRaw = (query.search || '').trim().slice(0, 200);
  const search = searchRaw ? escapeRegex(searchRaw) : '';
  const statusFilter = (query.status || '').trim().toUpperCase();

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const { monthStart, monthEnd } = getMonthRange(year, month);
  const { weekStart, weekEnd } = getWeekRange(anchor);
  const dayStart = startOfDay(anchor);
  const dayEnd = addDays(dayStart, 1);

  const { today } = getTodayRange();
  const todayNum = today.getDate();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  const statCards = await buildAppointmentsStatCards({
    date: query.date,
    view: viewMode,
  });

  const listFilter = {};
  if (search) {
    listFilter.$or = [
      { patientName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (statusFilter && statusFilter !== 'ALL') {
    if (statusFilter === 'ACTIVE') {
      listFilter.status = { $in: ['CONFIRMED', ...SEEN_STATUSES] };
    } else if (statusFilter === 'SEEN') {
      listFilter.status = { $in: SEEN_STATUSES };
    } else if (statusFilter === 'PENDING') {
      listFilter.status = { $in: ['NEW', 'PENDING'] };
    } else {
      listFilter.status = statusFilter;
    }
  }

  const [
    monthAppointments,
    weekAppointments,
    dayAppointments,
    pendingRaw,
    listTotal,
    listAppointments,
  ] = await Promise.all([
    Appointment.find({
      appointmentDate: { $gte: monthStart, $lt: monthEnd },
    }).sort({ appointmentDate: 1, appointmentTime: 1 }),
    Appointment.find({
      appointmentDate: { $gte: weekStart, $lt: weekEnd },
    }).sort({ appointmentDate: 1, appointmentTime: 1 }),
    Appointment.find({
      appointmentDate: { $gte: dayStart, $lt: dayEnd },
    }).sort({ appointmentTime: 1 }),
    Appointment.find({ status: { $in: ['NEW', 'PENDING'] } })
      .sort({ createdAt: -1 }),
    Appointment.countDocuments(listFilter),
    Appointment.find(listFilter)
      .sort({ appointmentDate: -1, appointmentTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  const periodAppointments =
    viewMode === 'week'
      ? weekAppointments
      : viewMode === 'day'
        ? dayAppointments
        : monthAppointments;

  const pendingConfirmations = pendingRaw.map((appt) => ({
    id: appt._id.toString(),
    name: appt.patientName,
    email: appt.email,
    service: appt.specialty,
    date: formatShortDate(appt.appointmentDate),
    timeAgo: formatTimeAgo(appt.createdAt),
    time: appt.appointmentTime,
    phone: appt.phone,
  }));

  const gridMeta = getMonthGridMeta(year, month);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart, i);
    return {
      label: MONTH_DAYS[i],
      date: String(d.getDate()).padStart(2, '0'),
      fullDate: toDateKey(d),
    };
  });

  const dayNames = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday',
  ];

  const allTableRows = await buildTableRows(listAppointments);

  return {
    statCards,
    pendingConfirmations,
    dateLabels: {
      month: formatMonthYear(anchor),
      week: formatWeekRange(weekStart),
      day: formatDayLabel(anchor),
    },
    anchorDate: toDateKey(anchor),
    monthCalendar: {
      year,
      month,
      daysInMonth: gridMeta.daysInMonth,
      offset: gridMeta.offset,
      today: isCurrentMonth ? todayNum : null,
      events: buildMonthEvents(monthAppointments),
    },
    weekCalendar: {
      days: weekDays,
      timeSlots: WEEK_GRID_TIMES,
      events: buildWeekEvents(weekAppointments, weekStart),
    },
    dayCalendar: {
      dayNumber: String(anchor.getDate()).padStart(2, '0'),
      dayName: dayNames[anchor.getDay()],
      monthLabel: `${MONTHS_FULL[anchor.getMonth()].toUpperCase()} ${anchor.getFullYear()}`,
      timeSlots: DAY_VIEW_TIMES,
      events: buildDayEvents(dayAppointments),
      nextUp: buildNextUp(dayAppointments, anchor),
    },
    upcomingAppointments: filterUpcoming(periodAppointments),
    patientsSeen: filterSeen(periodAppointments),
    calendarAppointments: buildCalendarAppointmentRefs([
      ...monthAppointments,
      ...weekAppointments,
      ...dayAppointments,
    ]),
    allAppointments: allTableRows,
    pagination: {
      page,
      limit,
      total: listTotal,
      totalPages: Math.max(1, Math.ceil(listTotal / limit)),
    },
  };
}

module.exports = {
  buildAppointmentsPageOverview,
  buildAppointmentsStatCards,
  mapAppointmentListItem,
  filterUpcoming,
  filterSeen,
  parseAnchorDate,
  addDays,
  MONTH_DAYS,
  SEEN_STATUSES,
  isSeenStatus,
  isUpcomingStatus,
};

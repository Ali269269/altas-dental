const Appointment = require('../models/Appointment');
const { getTodayRange } = require('./dateUtils');
const { getWeekRange } = require('./dashboardHelpers');

const CONFIRMED_STATUSES = ['CONFIRMED', 'SEEN', 'COMPLETED'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const TODAY_VISITOR_HOURS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
const TODAY_USER_SLOTS = [
  { label: '6am', startHour: 6, endHour: 9 },
  { label: '9am', startHour: 9, endHour: 12 },
  { label: '12pm', startHour: 12, endHour: 15 },
  { label: '3pm', startHour: 15, endHour: 18 },
  { label: '6pm', startHour: 18, endHour: 21 },
  { label: '9pm', startHour: 21, endHour: 24 },
  { label: '12am', startHour: 0, endHour: 6 },
];

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

function formatHourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function conversionRate(confirmed, total) {
  if (total === 0) return 0;
  return Math.round((confirmed / total) * 100);
}

function countInHourRange(appointments, startHour, endHour) {
  return appointments.filter((appt) => {
    const hour = new Date(appt.createdAt).getHours();
    if (startHour < endHour) return hour >= startHour && hour < endHour;
    return hour >= startHour || hour < endHour;
  }).length;
}

function countInTwoHourBucket(appointments, startHour) {
  return appointments.filter((appt) => {
    const hour = new Date(appt.createdAt).getHours();
    return hour >= startHour && hour < startHour + 2;
  }).length;
}

function countByWeekday(appointments, weekStart) {
  return DAY_LABELS.map((label, index) => {
    const dayStart = addDays(weekStart, index);
    const dayEnd = addDays(dayStart, 1);
    const count = appointments.filter((appt) => {
      const created = new Date(appt.createdAt);
      return created >= dayStart && created < dayEnd;
    }).length;
    return { label, t: label, v: count };
  });
}

function countByMonth(appointments, year) {
  return MONTH_LABELS.map((label, monthIndex) => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 1);
    const count = appointments.filter((appt) => {
      const created = new Date(appt.createdAt);
      return created >= monthStart && created < monthEnd;
    }).length;
    return { label, t: label, v: count };
  });
}

function filterNewPatients(appointments) {
  return appointments.filter((appt) => Boolean(appt.isNewPatient));
}

function countConfirmed(appointments) {
  return appointments.filter((appt) => CONFIRMED_STATUSES.includes(appt.status)).length;
}

function buildVisitorsChartToday(appointments) {
  return TODAY_VISITOR_HOURS.map((hour) => ({
    t: formatHourLabel(hour),
    v: countInTwoHourBucket(appointments, hour),
  }));
}

function buildUsersChartToday(appointments) {
  const newPatients = filterNewPatients(appointments);
  return TODAY_USER_SLOTS.map(({ label, startHour, endHour }) => ({
    label,
    v: countInHourRange(newPatients, startHour, endHour),
  }));
}

function buildConversionSlice(appointments) {
  const total = appointments.length;
  const confirmed = countConfirmed(appointments);
  const pending = Math.max(total - confirmed, 0);
  return { visitors: pending, clicks: confirmed };
}

async function fetchAppointmentsInRange(start, end) {
  return Appointment.find({
    createdAt: { $gte: start, $lt: end },
  })
    .select('createdAt status isNewPatient')
    .lean();
}

async function buildAnalyticsOverview() {
  const now = new Date();
  const { today, tomorrow } = getTodayRange();
  const yesterday = addDays(today, -1);
  const { weekStart, weekEnd } = getWeekRange(now);
  const year = now.getFullYear();
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year + 1, 0, 1);

  const [
    todayAppointments,
    yesterdayAppointments,
    weekAppointments,
    yearAppointments,
  ] = await Promise.all([
    fetchAppointmentsInRange(today, tomorrow),
    fetchAppointmentsInRange(yesterday, today),
    fetchAppointmentsInRange(weekStart, weekEnd),
    fetchAppointmentsInRange(yearStart, yearEnd),
  ]);

  const todayTotal = todayAppointments.length;
  const yesterdayTotal = yesterdayAppointments.length;
  const changePercent = percentChange(todayTotal, yesterdayTotal);
  const todayConversion = conversionRate(
    countConfirmed(todayAppointments),
    todayTotal
  );

  const weekNewPatients = filterNewPatients(weekAppointments);
  const yearNewPatients = filterNewPatients(yearAppointments);

  return {
    summary: {
      totalVisitorsToday: todayTotal,
      changePercent,
      changeLabel:
        changePercent >= 0
          ? `+${changePercent}% vs yesterday`
          : `${changePercent}% vs yesterday`,
      conversionRatePercent: todayConversion,
      conversionSubtitle: 'Request → Confirmed',
    },
    visitorsChart: {
      Today: buildVisitorsChartToday(todayAppointments),
      Week: countByWeekday(weekAppointments, weekStart),
      Month: countByMonth(yearAppointments, year),
    },
    usersChart: {
      Today: buildUsersChartToday(todayAppointments),
      Week: countByWeekday(weekNewPatients, weekStart).map(({ label, v }) => ({
        label,
        v,
      })),
      Month: countByMonth(yearNewPatients, year).map(({ label, v }) => ({
        label,
        v,
      })),
    },
    conversion: {
      Today: buildConversionSlice(todayAppointments),
      Week: buildConversionSlice(weekAppointments),
      Month: buildConversionSlice(yearAppointments),
    },
    metadata: {
      lastUpdated: now.toISOString(),
      totals: {
        today: todayTotal,
        week: weekAppointments.length,
        year: yearAppointments.length,
      },
    },
  };
}

module.exports = {
  buildAnalyticsOverview,
  CONFIRMED_STATUSES,
};

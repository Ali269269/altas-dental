import type { Patient } from "@/types/patient";

export type AppointmentsStatCard = {
  label: string;
  value: string;
  badge: string | null;
  badgeType: string | null;
};

export type CalendarEventBase = {
  appointmentId: string;
  patientName: string;
  time: string;
  status: string;
  label: string;
  color: string;
};

export type CalendarEvent = CalendarEventBase;

export type WeekCalendarEvent = CalendarEventBase & {
  day: number;
  gridSlot: string;
};

export type DayCalendarEvent = CalendarEventBase & {
  name: string;
};

export type CalendarAppointmentRef = {
  id: string;
  patientName: string;
  appointmentTime: string;
  day: string;
  appointmentDate: string;
};

export type AppointmentCheckupDetail = {
  complaint?: string;
  clinicalObs?: string;
  primaryDiagnosis?: string;
  diagnostics?: { label: string; tag?: boolean }[];
  treatment?: string[];
  prescriptions?: string;
  followUp?: string;
  postOpInstructions?: string[];
  additionalNotes?: string;
  scanNames?: string[];
  scans?: {
    storedName: string;
    originalName: string;
    url: string;
    mimeType?: string;
    size?: number;
  }[];
  completedAt?: string | null;
};

export type AppointmentDetail = {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  specialty: string;
  appointmentDate?: string;
  appointmentDateLabel: string;
  appointmentTime: string;
  notes: string;
  status: string;
  cancellationReason: string;
  isNewPatient: boolean;
  createdAt?: string;
  checkup?: AppointmentCheckupDetail | null;
  patientProfile?: Patient;
};

export type AppointmentListItem = {
  id?: string;
  time: string;
  period: string;
  name: string;
  type: string;
  status: string;
};

export type PendingConfirmationItem = {
  id: string;
  name: string;
  email?: string;
  service: string;
  date: string;
  timeAgo: string;
  time: string;
  phone?: string;
};

export type AppointmentTableRow = {
  id: string;
  name: string;
  patientId: string;
  email: string;
  phone: string;
  specialty: string;
  lastVisit: string;
  nextAppt: string;
  status: string;
  rawStatus?: string;
};

export type NextUpInfo = {
  date: string;
  name: string;
  detail: string;
  appointmentId: string;
  phone: string;
};

export type AppointmentsPageOverview = {
  statCards: AppointmentsStatCard[];
  pendingConfirmations: PendingConfirmationItem[];
  dateLabels: {
    month: string;
    week: string;
    day: string;
  };
  anchorDate: string;
  monthCalendar: {
    year: number;
    month: number;
    daysInMonth: number;
    offset: number;
    today: number | null;
    events: Record<string, CalendarEvent[]>;
  };
  weekCalendar: {
    days: { label: string; date: string; fullDate: string }[];
    timeSlots: string[];
    events: WeekCalendarEvent[];
  };
  dayCalendar: {
    dayNumber: string;
    dayName: string;
    monthLabel: string;
    timeSlots: string[];
    events: DayCalendarEvent[];
    nextUp: NextUpInfo | null;
  };
  upcomingAppointments: AppointmentListItem[];
  patientsSeen: AppointmentListItem[];
  calendarAppointments: CalendarAppointmentRef[];
  allAppointments: AppointmentTableRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const DEFAULT_APPOINTMENTS_OVERVIEW: AppointmentsPageOverview = {
  statCards: [
    { label: "Total Bookings Today", value: "0", badge: null, badgeType: null },
    { label: "Patients seen (Today)", value: "0", badge: null, badgeType: null },
    { label: "Patients left (Today)", value: "0", badge: null, badgeType: null },
    { label: "No See", value: "0", badge: null, badgeType: null },
  ],
  pendingConfirmations: [],
  dateLabels: { month: "", week: "", day: "" },
  anchorDate: "",
  monthCalendar: {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    daysInMonth: 31,
    offset: 0,
    today: null,
    events: {},
  },
  weekCalendar: {
    days: [],
    timeSlots: ["08:00", "10:00", "12:00", "02:00", "04:00", "06:00"],
    events: [],
  },
  dayCalendar: {
    dayNumber: "01",
    dayName: "Monday",
    monthLabel: "",
    timeSlots: [],
    events: [],
    nextUp: null,
  },
  upcomingAppointments: [],
  patientsSeen: [],
  calendarAppointments: [],
  allAppointments: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
};

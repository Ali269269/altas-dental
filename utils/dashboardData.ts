export type StatCard = {
  label: string;
  value: string;
  badge: string;
  badgeType: string;
};

export type DisplayAppointment = {
  id?: string;
  time: string;
  period: string;
  name: string;
  type: string;
  status: string;
};

export type ServiceStat = { name: string; pct: number };

export type StaffMember = {
  name: string;
  role: string;
  seen: number;
  avg: string;
  avatar: string;
};

export type PendingConfirmation = {
  id: string;
  name: string;
  service: string;
  date: string;
  timeAgo: string;
};

export type PatientOverviewRow = {
  label: string;
  value: string;
  isTag: boolean;
};

export type NextPatient = {
  initials: string;
  subtitle: string;
  rows: PatientOverviewRow[];
};

export type DashboardOverview = {
  statCards: StatCard[];
  occupancyData: number[][];
  occupancyPeak: string;
  services: ServiceStat[];
  topPerformer: string;
  todayAppointments: DisplayAppointment[];
  staff: StaffMember[];
  pendingConfirmations: PendingConfirmation[];
  nextPatient: NextPatient | null;
};

export const DEFAULT_STAT_CARDS: StatCard[] = [
  { label: "Total Bookings Today", value: "0", badge: "0%", badgeType: "negative" },
  { label: "Pending Confirmations", value: "0", badge: "Action Needed", badgeType: "warning" },
  { label: "New Patients", value: "0", badge: "No new", badgeType: "neutral" },
];

const EMPTY_OCCUPANCY: number[][] = Array.from({ length: 6 }, () =>
  Array.from({ length: 7 }, () => 0)
);

export const DEFAULT_SERVICES: ServiceStat[] = [
  { name: "Aligneurs", pct: 0 },
  { name: "Parodontologie", pct: 0 },
  { name: "Endodontie", pct: 0 },
  { name: "Réhabilitation totale du sourire", pct: 0 },
];

export const DEFAULT_STAFF: StaffMember[] = [
  { name: "Dr. Aris Thorne", role: "Principal Dentist", seen: 0, avg: "45 min", avatar: "AT" },
  { name: "Dr. Julian Vane", role: "Associate Dentist", seen: 0, avg: "52 min", avatar: "JV" },
  { name: "Sarah Jenkins", role: "Lead Hygienist", seen: 0, avg: "30 min", avatar: "SJ" },
];

export const DEFAULT_NEXT_PATIENT: NextPatient = {
  initials: "—",
  subtitle: "No upcoming patients today",
  rows: [
    { label: "Patient Name:", value: "—", isTag: false },
    { label: "Patient ID:", value: "—", isTag: false },
    { label: "Last Visit:", value: "—", isTag: false },
    { label: "Medical Alerts:", value: "None on file", isTag: false },
  ],
};

export const DEFAULT_DASHBOARD_OVERVIEW: DashboardOverview = {
  statCards: DEFAULT_STAT_CARDS,
  occupancyData: EMPTY_OCCUPANCY,
  occupancyPeak: "Peak: —",
  services: DEFAULT_SERVICES,
  topPerformer: "—",
  todayAppointments: [],
  staff: DEFAULT_STAFF,
  pendingConfirmations: [],
  nextPatient: null,
};

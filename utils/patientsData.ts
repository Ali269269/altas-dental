import type { AppointmentTableRow } from "@/utils/appointmentsData";

export type PatientTableRow = AppointmentTableRow;

export type PatientsPageOverview = {
  totalPatients: number;
  newPatients: number;
  totalPatientsTodayDelta: number;
  newPatientsTodayDelta: number;
  patientsMonthGrowthPct: number | null;
  patients: PatientTableRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const DEFAULT_PATIENTS_OVERVIEW: PatientsPageOverview = {
  totalPatients: 0,
  newPatients: 0,
  totalPatientsTodayDelta: 0,
  newPatientsTodayDelta: 0,
  patientsMonthGrowthPct: null,
  patients: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 1 },
};

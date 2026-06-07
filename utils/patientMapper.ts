import type { Patient, PatientStatus } from "@/types/patient";
import type { AppointmentTableRow } from "@/utils/appointmentsData";

function normalizePatientStatus(status: string): PatientStatus {
  const upper = status.toUpperCase().replace(/\s+/g, " ");
  if (upper === "FOLLOW-UP REQUIRED" || upper === "FOLLOW UP REQUIRED") {
    return "FOLLOW-UP REQUIRED";
  }
  if (
    upper === "ACTIVE" ||
    upper === "PENDING" ||
    upper === "COMPLETED" ||
    upper === "CANCELLED" ||
    upper === "CONFIRMED"
  ) {
    return upper as PatientStatus;
  }
  if (upper === "SEEN") return "COMPLETED";
  if (upper === "NEW") return "PENDING";
  return "PENDING";
}

function parseNextAppointment(nextAppt: string) {
  if (!nextAppt || nextAppt === "None Scheduled") {
    return {
      upcomingDate: "—",
      upcomingMonth: "No upcoming",
      upcomingYear: "",
      upcomingTime: "N/A",
    };
  }

  const parts = nextAppt.split(",");
  const datePart = parts[0]?.trim() ?? "";
  const timePart = parts.slice(1).join(",").trim() || "—";
  const dateTokens = datePart.split(/\s+/);
  const day = dateTokens[1] ?? "—";
  const month = dateTokens[0]?.toUpperCase() ?? "";
  const year = dateTokens[2] ?? "";

  return {
    upcomingDate: day,
    upcomingMonth: month ? `${month}${year ? `,${year}` : ""}` : "—",
    upcomingYear: year,
    upcomingTime: timePart,
  };
}

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Build a Patient record from an appointments table row (API or list view). */
export function appointmentRowToPatient(
  row: AppointmentTableRow,
  overrides: Partial<Patient> = {}
): Patient {
  const status = normalizePatientStatus(row.status);
  const upcoming = parseNextAppointment(row.nextAppt);

  const base: Patient = {
    id: row.patientId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    specialty: row.specialty,
    lastVisit: row.lastVisit,
    nextAppt: row.nextAppt,
    status,
    patientSince: row.lastVisit !== "—" ? row.lastVisit : "—",
    previousVisits:
      row.lastVisit !== "—"
        ? [{ specialty: row.specialty, date: row.lastVisit }]
        : [],
    upcomingService: row.specialty,
    upcomingDoctor: "—",
    upcomingStatus: status,
    clinicalNote: `"No clinical notes recorded for ${row.name}."`,
    clinicalNoteDate: row.lastVisit !== "—" ? `Recorded ${row.lastVisit}` : "No record date",
    documents: [],
    postOpInstructions: [],
    historyEntries: [],
    notes: [],
    ...upcoming,
  };

  return { ...base, ...overrides };
}

/** Prefer a full patient profile when the row matches an existing demo patient. */
export function resolvePatientFromRow(
  row: AppointmentTableRow,
  catalog: Patient[],
  overrides: Partial<Patient> = {}
): Patient {
  const match = catalog.find(
    (p) =>
      p.id === row.patientId ||
      p.email.toLowerCase() === row.email.toLowerCase() ||
      p.name.toLowerCase() === row.name.toLowerCase()
  );

  if (!match) {
    return appointmentRowToPatient(row, overrides);
  }

  return {
    ...match,
    lastVisit: row.lastVisit,
    nextAppt: row.nextAppt,
    status: normalizePatientStatus(row.status),
    specialty: row.specialty,
    ...parseNextAppointment(row.nextAppt),
    upcomingService: row.specialty,
    upcomingStatus: normalizePatientStatus(row.status),
    historyEntries: overrides.historyEntries ?? match.historyEntries,
    notes: overrides.notes ?? match.notes,
    ...overrides,
  };
}

import type { AppointmentDetail } from "@/utils/appointmentsData";

/** Map full appointment API payload (with patientProfile) to Patient for detail view. */
export function appointmentDetailToPatient(detail: AppointmentDetail): Patient {
  if (detail.patientProfile) {
    return {
      ...detail.patientProfile,
      status: normalizePatientStatus(detail.patientProfile.status),
      upcomingStatus: normalizePatientStatus(
        detail.patientProfile.upcomingStatus || detail.status
      ),
    };
  }

  const upcoming = parseNextAppointment(
    `${detail.appointmentDateLabel}, ${detail.appointmentTime}`
  );

  return appointmentRowToPatient(
    {
      id: detail.id,
      name: detail.patientName,
      patientId: `#PV-${detail.id.slice(-4).toUpperCase()}`,
      email: detail.email,
      phone: detail.phone,
      specialty: detail.specialty,
      lastVisit: detail.appointmentDateLabel,
      nextAppt: `${detail.appointmentDateLabel}, ${detail.appointmentTime}`,
      status: detail.status,
    },
    {
      ...upcoming,
      upcomingService: detail.specialty,
      upcomingStatus: normalizePatientStatus(detail.status),
      clinicalNote: detail.notes || `No clinical notes recorded for ${detail.patientName}.`,
      clinicalNoteDate: detail.appointmentDateLabel
        ? `Recorded ${detail.appointmentDateLabel}`
        : "No record date",
      notes: detail.notes
        ? [
            {
              doctor: "Atlas Dental Center",
              doctorInitials: "AD",
              date: detail.appointmentDateLabel,
              status: detail.status,
              content: detail.notes,
            },
          ]
        : [],
    }
  );
}

export { initialsFromName };

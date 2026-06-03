export type PatientStatus =
  | "ACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "CONFIRMED"
  | "FOLLOW-UP REQUIRED";

export type DetailTab = "overview" | "history" | "notes";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  lastVisit: string;
  nextAppt: string;
  status: PatientStatus;
  patientSince: string;
  previousVisits: { specialty: string; date: string }[];
  upcomingDate: string;
  upcomingMonth: string;
  upcomingYear: string;
  upcomingService: string;
  upcomingDoctor: string;
  upcomingTime: string;
  upcomingStatus: PatientStatus;
  clinicalNote: string;
  clinicalNoteDate: string;
  documents: { name: string; added: string; size: string; icon: "img" | "doc" }[];
  postOpInstructions: string[];
  historyEntries: {
    date: string;
    time: string;
    complaint: string;
    clinicalObs: string;
    diagnostics: { label: string; tag?: boolean }[];
    treatment: string[];
  }[];
  notes: {
    doctor: string;
    doctorInitials: string;
    date: string;
    status: string;
    content: string;
  }[];
}

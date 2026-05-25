"use client";

import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
type PatientStatus =
  | "ACTIVE"
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "CONFIRMED"
  | "FOLLOW-UP REQUIRED";
type DetailTab = "overview" | "history" | "notes";

interface Patient {
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

// ── Data ─────────────────────────────────────────────────────────────────────
const initialPatients: Patient[] = [
  {
    id: "#PV-4492", name: "Eleanor Vance",     email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Nov 28, 10:30 AM", status: "ACTIVE",
    patientSince: "Jan 2021",
    previousVisits: [
      { specialty: "Aligneurs", date: "Jan 12, 2026" },
      { specialty: "Aligneurs", date: "Dec 12, 2025" },
      { specialty: "Aligneurs", date: "Nov 12, 2025" },
      { specialty: "Aligneurs", date: "Oct 12, 2025" },
      { specialty: "Aligneurs", date: "Oct 01, 2025" },
    ],
    upcomingDate: "26", upcomingMonth: "APRIL,2026", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Julian Thorne", upcomingTime: "10:30 AM", upcomingStatus: "CONFIRMED",
    clinicalNote: `"Patient mentions slight sensitivity in upper left molar. Prefers morning appointments. Continue monitoring gum health around brackets."`,
    clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [
      { name: "Full Arch X-Ray.pdf", added: "Added Oct 12, 2023", size: "4.2 MB", icon: "img" },
      { name: "Treatment Plan V2.pdf", added: "Added Sep 28, 2023", size: "1.1 MB", icon: "doc" },
    ],
    postOpInstructions: ["AVOID HOT LIQUIDS FOR 24 HOURS", "SOFT DIET RECOMMENDED"],
    historyEntries: [
      {
        date: "Jan 12, 2026", time: "10:30 AM",
        complaint: "Patient Complained about pain in molar.",
        clinicalObs: "Molar and soft tissue examination was perormed.",
        diagnostics: [{ label: "Localized Stage II Periodontitis" }, { label: "HIGH SENSITIVITY", tag: true }, { label: "CARIES SUSPECTED", tag: true }],
        treatment: ["Local anesthesia: 2% Lidocaine w/ 1:100k epi", "Composite Restoration · Tooth #14 (MOD)"],
      },
      {
        date: "Dec 12, 2025", time: "10:30 AM",
        complaint: "Patient Complained about pain in molar.",
        clinicalObs: "Molar and soft tissue examination was perormed.",
        diagnostics: [{ label: "Localized Stage II Periodontitis" }, { label: "HIGH SENSITIVITY", tag: true }, { label: "CARIES SUSPECTED", tag: true }],
        treatment: ["Local anesthesia: 2% Lidocaine w/ 1:100k epi", "Composite Restoration · Tooth #14 (MOD)"],
      },
      {
        date: "Nov 12, 2025", time: "10:30 AM",
        complaint: "Patient Complained about pain in molar.",
        clinicalObs: "Molar and soft tissue examination was perormed.",
        diagnostics: [{ label: "Localized Stage II Periodontitis" }, { label: "HIGH SENSITIVITY", tag: true }, { label: "CARIES SUSPECTED", tag: true }],
        treatment: ["Local anesthesia: 2% Lidocaine w/ 1:100k epi", "Composite Restoration · Tooth #14 (MOD)"],
      },
    ],
    notes: [
      {
        doctor: "Dr.Ghita", doctorInitials: "DG", date: "OCT 14, 2023 · 10:30 AM", status: "COMPLETED",
        content: "Patient presented for a routine prophylaxis and periodontal assessment. Gingival tissues appear healthy with minimal inflammation in the lower anterior segment. Performed scaling and polishing. Discussed the importance of interdental cleaning in the molar regions. No new caries detected on visual exam. Scheduled for 6-month recall.",
      },
      {
        doctor: "Dr. John Vance", doctorInitials: "JV", date: "OCT 14, 2023 · 10:30 AM", status: "FOLLOW-UP REQUIRED",
        content: "Patient presented for a routine prophylaxis and periodontal assessment. Gingival tissues appear healthy with minimal inflammation in the lower anterior segment. Performed scaling and polishing. Discussed the importance of interdental cleaning in the molar regions. No new caries detected on visual exam. Scheduled for 6-month recall.",
      },
    ],
  },
  {
    id: "#PV-5723", name: "Theodore Finch",  email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 02, 1:00 PM", status: "PENDING",
    patientSince: "Mar 2022", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "02", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Aris Thorne", upcomingTime: "1:00 PM", upcomingStatus: "PENDING",
    clinicalNote: `"Patient scheduled for follow-up alignment check."`,
    clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [],
    historyEntries: [], notes: [],
  },
  {
    id: "#PV-3128", name: "Miranda Priestly", email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "None Scheduled", status: "COMPLETED",
    patientSince: "Jun 2020", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "—", upcomingMonth: "No upcoming", upcomingYear: "",
    upcomingService: "N/A", upcomingDoctor: "N/A", upcomingTime: "N/A", upcomingStatus: "COMPLETED",
    clinicalNote: `"Treatment completed successfully."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-2684", name: "Dorian Gray",      email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 06, 3:30 PM", status: "PENDING",
    patientSince: "Feb 2023", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "06", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Julian Thorne", upcomingTime: "3:30 PM", upcomingStatus: "PENDING",
    clinicalNote: `"Routine follow-up."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-3947", name: "Jay Gatsby",       email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 07, 9:00 AM", status: "PENDING",
    patientSince: "Sep 2022", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "07", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Aris Thorne", upcomingTime: "9:00 AM", upcomingStatus: "PENDING",
    clinicalNote: `"Check-in appointment."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-5839", name: "Holly Golightly",  email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 08, 4:00 PM", status: "PENDING",
    patientSince: "Jan 2022", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "08", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Julian Thorne", upcomingTime: "4:00 PM", upcomingStatus: "PENDING",
    clinicalNote: `"Adjustment appointment."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-6721", name: "Atticus Finch",    email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "None Scheduled", status: "COMPLETED",
    patientSince: "May 2019", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "—", upcomingMonth: "No upcoming", upcomingYear: "",
    upcomingService: "N/A", upcomingDoctor: "N/A", upcomingTime: "N/A", upcomingStatus: "COMPLETED",
    clinicalNote: `"Full treatment completed."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-7510", name: "Elizabeth Bennet", email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 10, 10:00 AM", status: "PENDING",
    patientSince: "Apr 2023", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "10", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Aris Thorne", upcomingTime: "10:00 AM", upcomingStatus: "PENDING",
    clinicalNote: `"Progress check."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-8921", name: "Fitzwilliam Darcy",email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 11, 11:30 AM", status: "PENDING",
    patientSince: "Jul 2021", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "11", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Julian Thorne", upcomingTime: "11:30 AM", upcomingStatus: "PENDING",
    clinicalNote: `"Monthly review."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-9864", name: "Sherlock Holmes",  email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 12, 1:45 PM", status: "PENDING",
    patientSince: "Nov 2022", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "12", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Aris Thorne", upcomingTime: "1:45 PM", upcomingStatus: "PENDING",
    clinicalNote: `"Tray replacement."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-7549", name: "Dr. John Watson",  email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "Dec 13, 3:45 PM", status: "CANCELLED",
    patientSince: "Aug 2021", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "13", upcomingMonth: "DEC,2023", upcomingYear: "",
    upcomingService: "Aligneurs", upcomingDoctor: "Dr. Julian Thorne", upcomingTime: "3:45 PM", upcomingStatus: "CANCELLED",
    clinicalNote: `"Appointment cancelled by patient."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
  {
    id: "#PV-4378", name: "Katniss Everdeen", email: "eleanorvance@gmail.com",   phone: "+971 00 000 0000",
    specialty: "Aligneurs", lastVisit: "Oct 12, 2023", nextAppt: "None Scheduled", status: "COMPLETED",
    patientSince: "Dec 2020", previousVisits: [{ specialty: "Aligneurs", date: "Oct 12, 2023" }],
    upcomingDate: "—", upcomingMonth: "No upcoming", upcomingYear: "",
    upcomingService: "N/A", upcomingDoctor: "N/A", upcomingTime: "N/A", upcomingStatus: "COMPLETED",
    clinicalNote: `"Retainer fitted. Treatment complete."`, clinicalNoteDate: "Recorded Oct 12, 2023",
    documents: [], postOpInstructions: [], historyEntries: [], notes: [],
  },
];

// ── Status style helper ───────────────────────────────────────────────────────
function statusStyle(status: string) {
  switch (status) {
    case "ACTIVE":            return "text-[#3DAA7A] border border-[#3DAA7A] bg-[#D1FAE5] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "PENDING":           return "text-[#753141] border border-[#D3D3D3] bg-[#d3d3d3] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "COMPLETED":         return "text-[#ffffff] border border-[#591727] bg-[#753141] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "CANCELLED":         return "text-[#C94A3A] border border-[#C94A3A] bg-[#FEE2E2] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "CONFIRMED":         return "text-[#591727] border border-[#591727] bg-[#99757e] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    case "FOLLOW-UP REQUIRED":return "text-[#C9922A] border border-[#C9922A] bg-[#FEF3C7] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    default:                  return "";
  }
}

// ── New Note Modal ────────────────────────────────────────────────────────────
function NewNoteModal({
  onClose, onSave, isDark,
}: { onClose: () => void; onSave: (note: string, status: string) => void; isDark: boolean }) {
  const [noteText, setNoteText]     = useState("");
  const [noteStatus, setNoteStatus] = useState("Completed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-[#681A2D]">New Notes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="border-l-4 border-[#681A2D] mb-5">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Type..."
            rows={5}
            className="w-full px-4 py-3 text-sm outline-none resize-none bg-[#F8F7F5] text-[#681A2D] placeholder-gray-400"
          />
        </div>
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-[#681A2D] mb-2">TREATMENT STATUS</p>
          <select
            value={noteStatus}
            onChange={e => setNoteStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#FFFFFF] text-sm text-[#3D0A1F] bg-white outline-none appearance-none"
          >
            <option>Completed</option>
            <option>Follow-up Required</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => { onSave(noteText, noteStatus); onClose(); }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#591727]"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border border-[#D9C9A8] text-[#3D0A1F]"
          >
            Discard Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Patient Detail View ───────────────────────────────────────────────────────
function PatientDetail({
  patient, onBack, isDark,
  card, cardBorder, cardInner, text1, text2, pageBg,
}: {
  patient: Patient; onBack: () => void; isDark: boolean;
  card: string; cardBorder: string; cardInner: string;
  text1: string; text2: string; pageBg: string;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [showNewNote, setShowNewNote] = useState(false);
  const [notes, setNotes] = useState(patient.notes);

  const inputBg     = isDark ? "#c1a694" : "#F8F7F5";
  const inputBorder = isDark ? "#5C2A3A" : "#D9C9A8";

  function handleSaveNote(content: string, status: string) {
    setNotes(prev => [
      { doctor: "Dr. User", doctorInitials: "DU", date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) + " · " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), status, content },
      ...prev,
    ]);
  }

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden" style={{ marginTop: "40px" }}>
      {showNewNote && <NewNoteModal onClose={() => setShowNewNote(false)} onSave={handleSaveNote} isDark={isDark} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:opacity-80 transition shrink-0"
          style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727", color: "#fff" }}
          title="Go back"
        >
          ←
        </button>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={onBack} className="text-xl sm:text-2xl font-bold hover:underline" style={{ color: isDark ? "#ffffff" : "#591727" }}>
            PATIENTS
          </button>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>/ Details</span>
        </div>
      </div>

      {/* Main layout — stacked on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Left sidebar — full width on mobile, fixed w-56 on lg+ */}
        <div className="w-full lg:w-56 lg:shrink-0 flex flex-col gap-4">

          {/* Patient Info */}
          <div className={`rounded-2xl p-5 sm:p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <h2 className="text-[19px] font-bold mb-1" style={{ color: text1 }}>{patient.name}</h2>
            <p className="text-sm mb-5" style={{ color: text2 }}>{patient.id}</p>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-md">✉</span>
                <span className="text-sm break-all" style={{ color: text2 }}>{patient.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#591727]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91 a16 16 0 0 0 6 6l1.58-1.58a2 2 0 0 1 2.11-.45 c.8.26 1.64.45 2.5.57A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <span className="text-sm" style={{ color: text2 }}>{patient.phone}</span>
              </div>
            </div>
          </div>

          {/* Key Dates */}
          <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className="text-[14px] font-bold numeric-font uppercase mb-3" style={{ color: text2 }}>KEY DATES</p>
            <p className="text-md mb-3" style={{ color: text2 }}>Previous Visits</p>
            <div className="flex flex-col gap-2">
              {patient.previousVisits.map((v, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <span className="text-sm" style={{ color: text2 }}>{v.specialty}</span>
                  <span className="text-xs font-semibold numeric-font shrink-0" style={{ color: text1 }}>{v.date}</span>
                </div>
              ))}
              <div className="flex items-center justify-between mt-1 pt-2 gap-2" style={{ borderTop: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}>
                <span className="text-xs" style={{ color: text2 }}>Patient Since</span>
                <span className="text-xs font-semibold shrink-0" style={{ color: text1 }}>{patient.patientSince}</span>
              </div>
            </div>
          </div>

          {/* Send Email Button */}
          <button
            className="w-full py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727" }}
          >
            Send Email
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Right main area */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Upcoming appointment banner */}
          {/* On mobile: stack date block + info vertically; on sm+: horizontal (unchanged) */}
          <div className={`rounded-2xl border ${cardBorder} flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden`} style={{ backgroundColor: card }}>
            {/* Date block */}
            <div
              className="flex flex-row sm:flex-col items-center justify-center px-6 py-4 sm:px-8 sm:py-6 sm:shrink-0 sm:self-stretch gap-3 sm:gap-0"
              style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727" }}
            >
              <span className="text-xs font-semibold text-white/70 sm:mb-1">Upcoming</span>
              <span className="text-4xl sm:text-5xl font-bold text-white leading-none numeric-font">{patient.upcomingDate}</span>
              <span className="text-xs text-white/70 sm:mt-1">{patient.upcomingMonth}</span>
            </div>
            {/* Service info */}
            <div className="flex-1 py-4 px-4 sm:px-0">
              <h3 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: text1 }}>{patient.upcomingService}</h3>
              <p className="text-sm mb-2" style={{ color: text2 }}>with {patient.upcomingDoctor}</p>
              <div className="flex items-center gap-1">
                <span className="text-[#591727]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span className="text-sm font-semibold numeric-font" style={{ color: text2 }}>{patient.upcomingTime}</span>
              </div>
            </div>
            {/* Status */}
            <div className="px-4 pb-4 sm:pb-0 sm:pr-6">
              <span className={statusStyle(patient.upcomingStatus)}>{patient.upcomingStatus}</span>
            </div>
          </div>

          {/* Tabs + Tab Content */}
          <div className={`rounded-2xl border ${cardBorder} flex-1`} style={{ backgroundColor: card }}>
            {/* Tab bar */}
            <div className="flex border-b" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}>
              {(["overview", "history", "notes"] as DetailTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-4 text-sm font-semibold capitalize transition-colors relative"
                  style={{ color: activeTab === tab ? "#591727" : text2 }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: isDark ? "#D4A574" : "#591727" }} />
                  )}
                </button>
              ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === "overview" && (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide" style={{ color: text1 }}>Clinical Observations</h3>
                  <button onClick={() => setShowNewNote(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: isDark ? "#D4A574" : "#591727" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#D4A574" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    New Note
                  </button>
                </div>
                <div className="rounded-md p-4 mb-6 border-l-4" style={{ backgroundColor: inputBg, borderLeftColor: isDark ? "#8B1A2E" : "#591727" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <p className="text-sm font-semibold tracking-wide" style={{ color: "#591727" }}>{patient.clinicalNoteDate}</p>
                  </div>
                  <p className="text-sm" style={{ color: text1 }}>{patient.clinicalNote}</p>
                </div>

                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-4" style={{ color: text1 }}>Recent Documents</h3>
                <div className="flex flex-col gap-3 mb-6">
                  {patient.documents.length === 0 && (
                    <p className="text-sm" style={{ color: text2 }}>No documents uploaded.</p>
                  )}
                  {patient.documents.map((doc, i) => (
                    <div key={i} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border gap-2 ${cardBorder}`} style={{ backgroundColor: cardInner }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#FEE2E2" }}>
                          {doc.icon === "img" ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#F5ECD7" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" />
                            </svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#F5ECD7" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: text1 }}>{doc.name}</p>
                          <p className="text-[13px] truncate" style={{ color: text2 }}>{doc.added} · {doc.size}</p>
                        </div>
                      </div>
                      <button className="shrink-0" style={{ color: text2 }}>⬇</button>
                    </div>
                  ))}
                </div>

                {patient.postOpInstructions.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#591727", color: "#F5ECD7" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="6" width="18" height="14" rx="2" /><path d="M9 6V4h6v2" />
                          <line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
                        </svg>
                      </span>
                      <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: text1 }}>Post-Op Instructions</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {patient.postOpInstructions.map((instr, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-[11px] font-semibold border" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: text2, backgroundColor: "#d8bcbc" }}>
                          {instr}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── History Tab ── */}
            {activeTab === "history" && (
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-5" style={{ color: text1 }}>History</h3>
                {patient.historyEntries.length === 0 && (
                  <p className="text-sm" style={{ color: text2 }}>No history records found.</p>
                )}
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D9C9A8" }} />
                  <div className="flex flex-col gap-8 pl-6 sm:pl-8">
                    {patient.historyEntries.map((entry, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727" }} />
                        <div className="mb-2">
                          <span className="font-bold text-base numeric-font" style={{ color: text1 }}>{entry.date}</span><br/>
                          <span className="text-xs ml-2 numeric-font" style={{ color: text2 }}>{entry.time}</span>
                        </div>
                        <div className="flex flex-col gap-4 sm:gap-6">
                          {/* Complaint */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                              </svg>
                              <span className="text-[13px] font-bold tracking-widest uppercase numeric-font" style={{ color: text2 }}>COMPLAINT</span>
                            </div>
                            <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: cardInner, color: text1 }}>{entry.complaint}</div>
                          </div>
                          {/* Clinical Obs */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" />
                              </svg>
                              <span className="text-[13px] font-bold numeric-font" style={{ color: text2 }}>CLINICAL OBSERVATIONS</span>
                            </div>
                            <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: cardInner, color: text1 }}>{entry.clinicalObs}</div>
                          </div>
                          {/* Diagnostics */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 5H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                              </svg>
                              <span className="text-[13px] font-bold tracking-widest uppercase numeric-font" style={{ color: text2 }}>DIAGNOSTICS</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {entry.diagnostics.map((d, di) => (
                                <span key={di}
                                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${d.tag ? "border" : ""}`}
                                  style={{
                                    backgroundColor: d.tag ? "#D3D3D3" : cardInner,
                                    borderColor: d.tag ? (isDark ? "#C9922A" : "#D3D3D3") : undefined,
                                    color: d.tag ? "#591727" : text1,
                                  }}
                                >
                                  {d.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* Treatment */}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12h4l2-4 4 8 2-4h6" /><path d="M3 3h18v18H3z" />
                              </svg>
                              <span className="text-[13px] numeric-font font-bold tracking-widest uppercase" style={{ color: text2 }}>TREATMENT & PROCEDURE PLAN</span>
                            </div>
                            <div className="flex flex-col gap-2">
                              {entry.treatment.map((t, ti) => (
                                <div key={ti} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: cardInner, color: text1 }}>{t}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {patient.historyEntries.length > 0 && (
                  <div className="flex justify-center gap-1 mt-6">
                    <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>‹</button>
                    {[1, 2].map(n => (
                      <button key={n} className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                        style={{ backgroundColor: n === 1 ? (isDark ? "#8B1A2E" : "#591727") : "transparent", color: n === 1 ? "#F5ECD7" : text2 }}>
                        {n}
                      </button>
                    ))}
                    <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>›</button>
                  </div>
                )}
              </div>
            )}

            {/* ── Notes Tab ── */}
            {activeTab === "notes" && (
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide" style={{ color: text1 }}>Notes</h3>
                  <button onClick={() => setShowNewNote(true)} className="flex items-center gap-1 text-xs font-semibold" style={{ color: isDark ? "#D4A574" : "#591727" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#D4A574" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    New Note
                  </button>
                </div>
                {notes.length === 0 && (
                  <p className="text-sm" style={{ color: text2 }}>No notes yet. Click "New Note" to add one.</p>
                )}
                <div className="flex flex-col gap-4">
                  {notes.map((note, i) => (
                    <div key={i} className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{ backgroundColor: cardInner }}>
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#8B5060", color: "#F5ECD7" }}>
                            {note.doctorInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: text1 }}>{note.doctor}</p>
                            <p className="text-xs numeric-font" style={{ color: "#2D0B14" }}>{note.date}</p>
                          </div>
                        </div>
                        <span className={`${statusStyle(note.status)} shrink-0`}>{note.status}</span>
                      </div>
                      <p className="text-sm mb-4" style={{ color: text2 }}>{note.content}</p>
                      <div className="flex gap-4">
                        <button className="text-xs flex items-center gap-1" style={{ color: "#591727" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                          </svg>
                          Edit
                        </button>
                        <button className="text-xs flex items-center gap-1" style={{ color: "#591727" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 3h7v7" /><path d="M21 3L10 14" /><path d="M21 14v7h-7" /><path d="M3 10v11h11" />
                          </svg>
                          Export
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Add / Edit Checkup Modal ──────────────────────────────────────────────────
function CheckupModal({
  patient, onClose, onSave, isDark, card, cardBorder, text1, text2,
}: {
  patient: Patient; onClose: () => void;
  onSave: (entry: Patient["historyEntries"][0]) => void;
  isDark: boolean; card: string; cardBorder: string; text1: string; text2: string;
}) {
  const [complaint, setComplaint]     = useState("");
  const [clinicalObs, setClinicalObs] = useState("");
  const [diagnostic, setDiagnostic]   = useState("");
  const [treatment, setTreatment]     = useState("");

  const inputBg     = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#5C2A3A" : "#D9C9A8";
  const pageBg      = isDark ? "#2A0D18" : "#FFFFFF";

  function handleSave() {
    const today = new Date();
    onSave({
      date: today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      complaint, clinicalObs,
      diagnostics: diagnostic ? [{ label: diagnostic }] : [],
      treatment: treatment ? [treatment] : [],
    });
    onClose();
  }

  const Icon = ({ d }: { d: string }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl h-full overflow-y-auto p-4 sm:p-8" style={{ backgroundColor: pageBg }}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "#591727" }}>PATIENTS /</h2>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>Add Checkup for {patient.name}</span>
        </div>
        <div className={`rounded-2xl p-4 sm:p-8 border ${cardBorder}`} style={{ backgroundColor: card }}>
          <div className="flex flex-col gap-5">
            {[
              { icon: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z", label: "COMPLAINT", val: complaint, set: setComplaint, ph: "Patient complaint..." },
              { icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z", label: "CLINICAL OBSERVATIONS", val: clinicalObs, set: setClinicalObs, ph: "Clinical observations..." },
              { icon: "M9 3h6v4H9z M5 7h14v14H5z", label: "DIAGNOSTICS", val: diagnostic, set: setDiagnostic, ph: "e.g. Localized Stage II Periodontitis" },
              { icon: "M3 12h4l2-4 4 8 2-4h6", label: "TREATMENT & PROCEDURE PLAN", val: treatment, set: setTreatment, ph: "e.g. Local anesthesia: 2% Lidocaine" },
            ].map(f => (
              <div key={f.label}>
                <label className="flex items-center gap-2 text-[13px] font-semibold numeric-font mb-2" style={{ color: "#681A2D" }}>
                  <span className="text-[#591727]"><Icon d={f.icon} /></span>
                  {f.label}
                </label>
                <textarea
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: "#591727" }}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border" style={{ borderColor: isDark ? "#5C2A3A" : "#3D0A1F", color: text1 }}>
              Discard Changes
            </button>
            <button onClick={handleSave} className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ backgroundColor: isDark ? "#8B1A2E" : "#3D0A1F" }}>
              Save Checkup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Calendar Dropdown ─────────────────────────────────────────────────────────
function CalendarDropdown({ onClose }: { onClose: () => void }) {
  const [currentDate] = useState(new Date(2025, 11, 1));
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = 31;
  const startDay = 1;

  return (
    <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl p-4 w-72" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#591727]">{monthName}</span>
        <div className="flex gap-1">
          <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800">‹</button>
          <button className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800">›</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-[#591727] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array(startDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
          <button key={day}
            className={`text-center text-xs py-1.5 rounded-full hover:bg-gray-100 transition-colors ${day === 2 ? "ring-1 ring-[#C9922A] text-[#C9922A] font-semibold" : "text-gray-600"}`}
            onClick={onClose}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Status Dropdown ───────────────────────────────────────────────────────────
function StatusDropdown({ onSelect, onClose }: { onSelect: (s: string) => void; onClose: () => void }) {
  const statuses = ["Active", "Pending", "Completed", "Cancelled"];
  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-2xl py-2 w-44" onClick={e => e.stopPropagation()}>
      {statuses.map((s, i) => (
        <button key={s}
          className="w-full text-left px-4 py-2.5 text-sm text-[#591727] hover:bg-gray-50 transition-colors"
          style={{ borderBottom: i < statuses.length - 1 ? "1px solid #F3F0E8" : "none" }}
          onClick={() => { onSelect(s); onClose(); }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ── Main Patients Page ────────────────────────────────────────────────────────
export default function PatientsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [patients, setPatients]               = useState<Patient[]>(initialPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [checkupPatient, setCheckupPatient]   = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery]         = useState("");
  const [statusFilter, setStatusFilter]       = useState("All Statuses");
  const [showCalendar, setShowCalendar]       = useState(false);
  const [showStatusDrop, setShowStatusDrop]   = useState(false);

  const card          = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder    = isDark ? "border-[#5C2A3A]" : "border-[#753141]";
  const cardInner     = isDark ? "#d0baa3" : "#FFFFFF";
  const text1         = isDark ? "#591727" : "#591727";
  const text2         = isDark ? "#591727" : "#591727";
  const pageBg        = isDark ? "#2A0D18" : "#FFFFFF";
  const inputBg       = isDark ? "#c1a694" : "#ffffff";
  const inputBorder   = isDark ? "#753141" : "#753141";
  const tableBg       = isDark ? "#c1a694" : "#FDFAF4";
  const tableRowHover = isDark ? "#ffffff" : "#EDE0C4";

  const totalPatients = patients.length;
  const newPatients   = 34;

  const filtered = patients.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.phone.includes(searchQuery);
    const matchStatus = statusFilter === "All Statuses" || p.status === statusFilter.toUpperCase() ||
                        (statusFilter === "Completed" && p.status === "COMPLETED");
    return matchSearch && matchStatus;
  });

  function handleDelete(id: string) {
    setPatients(prev => prev.filter(p => p.id !== id));
  }

  function handleSaveCheckup(patientId: string, entry: Patient["historyEntries"][0]) {
    setPatients(prev => prev.map(p =>
      p.id === patientId ? { ...p, historyEntries: [entry, ...p.historyEntries] } : p
    ));
  }

  if (selectedPatient) {
    return (
      <PatientDetail
        patient={selectedPatient}
        onBack={() => setSelectedPatient(null)}
        isDark={isDark}
        card={card} cardBorder={cardBorder} cardInner={cardInner}
        text1={text1} text2={text2} pageBg={pageBg}
      />
    );
  }

  return (
    <div
      className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden lg:overflow-x-visible"
      style={{ marginTop: "40px" }}
      onClick={() => { setShowCalendar(false); setShowStatusDrop(false); }}
    >
      {/* Checkup modal */}
      {checkupPatient && (
        <CheckupModal
          patient={checkupPatient}
          onClose={() => setCheckupPatient(null)}
          onSave={entry => handleSaveCheckup(checkupPatient.id, entry)}
          isDark={isDark} card={card} cardBorder={cardBorder} text1={text1} text2={text2}
        />
      )}

      {/* ── Page Header ── */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-wide mb-5" style={{ color: isDark ? "#ffffff" : "#591727" }}>
        PATIENTS
      </h1>

      {/* ── Stat Cards — stack on mobile, row on sm+ ── */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Total Patients */}
        <div className={`relative rounded-2xl p-6 border ${cardBorder} w-full sm:min-w-[300px] sm:max-w-xs`}
          style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}>
          <p className="text-sm mb-2" style={{ color: text2 }}>Total Patients</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold numeric-font" style={{ color: text1 }}>{totalPatients}</span>
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#711C314D] text-[#591727] mb-1">-2 today</span>
          </div>
          <p className="text-sm mt-1" style={{ color: "#591727" }}>↗ +12% from last month</p>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
            <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }} />
          </div>
        </div>
        {/* New Patients */}
        <div className={`relative rounded-2xl p-6 border ${cardBorder} w-full sm:min-w-[300px] sm:max-w-xs`}
          style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}>
          <p className="text-sm mb-2" style={{ color: text2 }}>New Patients</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold numeric-font" style={{ color: text1 }}>{newPatients}</span>
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#711C314D] text-[#591727] mb-1">-1 today</span>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
            <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }} />
          </div>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className={`rounded-2xl border ${cardBorder} overflow-hidden`} style={{ backgroundColor: tableBg }}>

        {/* Search & Filter — stacks on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4 border-b" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}>
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border" style={{ backgroundColor: inputBg, borderColor: inputBorder }}>
            <span style={{ color: text2 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, ID or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: text1 }}
            />
          </div>
          {/* Filters row */}
          <div className="flex gap-2">
            {/* Status filter */}
            <div className="relative flex-1 sm:flex-none">
              <button
                onClick={e => { e.stopPropagation(); setShowStatusDrop(p => !p); setShowCalendar(false); }}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text2 }}
              >
                <span className="truncate">{statusFilter}</span> <span className="text-xs shrink-0">▾</span>
              </button>
              {showStatusDrop && (
                <StatusDropdown onSelect={s => setStatusFilter(s)} onClose={() => setShowStatusDrop(false)} />
              )}
            </div>
            {/* Last Visit */}
            <div className="relative">
              <button
                onClick={e => { e.stopPropagation(); setShowCalendar(p => !p); setShowStatusDrop(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm whitespace-nowrap"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text2 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="hidden sm:inline">Last Visit</span>
              </button>
              {showCalendar && <CalendarDropdown onClose={() => setShowCalendar(false)} />}
            </div>
          </div>
        </div>

        {/* Table — horizontally scrollable on mobile */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${isDark ? "#5C2A3A" : "#591727"}` }}>
                {["Patient Name", "Email & Phone", "Spécialités", "Last Visit", "Next Appointment", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-3 sm:px-4 py-3 text-[13px] sm:text-[14px] font-semibold whitespace-nowrap" style={{ color: text2 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr
                  key={i}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${isDark ? "#5C2A3A" : "#591727"}` }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = tableRowHover)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-3 sm:px-4 py-3">
                    <div className="font-semibold whitespace-nowrap" style={{ color: text1 }}>{row.name}</div>
                    <div className="text-[13px]" style={{ color: text2 }}>ID: {row.id}</div>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="text-[13px] whitespace-nowrap" style={{ color: text2 }}>{row.email}</div>
                    <div className="text-[13px]" style={{ color: text2 }}>{row.phone}</div>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className="text-[13px] whitespace-nowrap" style={{ color: text2 }}>{row.specialty}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className="text-[13px] whitespace-nowrap" style={{ color: text2 }}>{row.lastVisit}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    {row.nextAppt === "None Scheduled" ? (
                      <span className="text-[13px] whitespace-nowrap" style={{ color: text2 }}>None Scheduled</span>
                    ) : (
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#711C31" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-[13px]" style={{ color: isDark ? "#711C31" : "#380c16" }}>{row.nextAppt}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={statusStyle(row.status)}>{row.status}</span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button title="Delete patient" onClick={() => handleDelete(row.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-100" style={{ color: text2 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                      <button title="View patient details" onClick={() => setSelectedPatient(row)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-blue-100" style={{ color: text2 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                      <button title="Add checkup" onClick={() => setCheckupPatient(row)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-green-100" style={{ color: text2 }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: text2 }}>
                    No patients found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3" style={{ borderTop: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}>
          <span className="text-xs" style={{ color: text2 }}>
            Showing 1 to {Math.min(12, filtered.length)} of {filtered.length} results
          </span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>‹</button>
            {[1, 2, 3].map(n => (
              <button key={n} className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                style={{ backgroundColor: n === 1 ? (isDark ? "#8B1A2E" : "#591727") : "transparent", color: n === 1 ? "#F5ECD7" : text2 }}>
                {n}
              </button>
            ))}
            <span className="text-xs px-1" style={{ color: text2 }}>...</span>
            <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>71</button>
            <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
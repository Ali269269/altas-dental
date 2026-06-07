"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";
import { apiUrl } from "@/utils/api";
import { getToken } from "@/utils/auth";
import type { Patient } from "@/types/patient";
import type { PatientTableRow } from "@/utils/patientsData";
import {
  DEFAULT_PATIENTS_OVERVIEW,
  type PatientsPageOverview,
} from "@/utils/patientsData";
import { PatientDetail } from "@/components/admin/patient/PatientDetail";
import { ClinicalRecordFormModal } from "@/components/admin/patient/ClinicalRecordFormModal";
import { PatientEmailModal } from "@/components/admin/patient/PatientEmailModal";
import { PatientListActions } from "@/components/admin/patient/PatientListActions";
import type { ClinicalRecordSavePayload } from "@/utils/clinicalRecord";
import { patientStatusStyle as statusStyle } from "@/utils/patientStatusStyle";
import { appointmentDetailToPatient } from "@/utils/patientMapper";
import type { AppointmentDetail } from "@/utils/appointmentsData";

const PAGE_SIZE = 12;

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTodayDelta(n: number) {
  return `${n >= 0 ? "+" : ""}${n} today`;
}

function formatMonthGrowth(pct: number | null) {
  if (pct === null) return null;
  const arrow = pct >= 0 ? "\u2197" : "\u2198";
  return `${arrow} ${pct >= 0 ? "+" : ""}${pct}% from last month`;
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DeletePatientModal({
  isDark,
  card,
  cardBorder,
  text1,
  text2,
  pageBg,
  row,
  loading,
  onConfirm,
  onClose,
}: {
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
  pageBg: string;
  row: PatientTableRow;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={loading ? undefined : onClose} />
      <div
        className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 ${cardBorder}`}
        style={{ backgroundColor: pageBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: isDark ? "#ffffff" : "#591727" }}>
          Delete appointment?
        </h2>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: text2 }}>
          This will permanently remove the appointment record for{" "}
          <strong style={{ color: text1 }}>{row.name}</strong>. This cannot be undone.
        </p>
        <div className={`rounded-xl border p-3 mb-5 text-sm ${cardBorder}`} style={{ backgroundColor: card }}>
          <p style={{ color: text1 }}>
            <span style={{ color: text2 }}>Email:</span> {row.email}
          </p>
          <p className="mt-1" style={{ color: text1 }}>
            <span style={{ color: text2 }}>Phone:</span> {row.phone}
          </p>
        </div>
        <div className="flex flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-60"
            style={{ borderColor: isDark ? "#5C2A3A" : "#3D0A1F", color: text1 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#8B1A2E" }}
          >
            {loading ? "Deleting..." : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CalendarDropdown({
  onClose,
  selectedDate,
  onSelectDate,
}: {
  onClose: () => void;
  selectedDate: string | null;
  onSelectDate: (dateKey: string) => void;
}) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate && /^\d{4}-\d{2}-\d{2}/.test(selectedDate)) {
      const [y, m, d] = selectedDate.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startDay = new Date(year, month, 1).getDay() - 1;
  if (startDay < 0) startDay = 6;

  const selectedKey = selectedDate?.slice(0, 10) ?? null;

  return (
    <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl p-4 w-72" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[#591727]">{monthName}</span>
        <div className="flex gap-1">
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
            onClick={() => setViewDate(new Date(year, month - 1, 1))}
          >
            {"\u2039"}
          </button>
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-800"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
          >
            {"\u203A"}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-[#591727] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array(startDay).fill(null).map((_, i) => (
          <div key={`e${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateKey = toDateKey(new Date(year, month, day));
          const isSelected = selectedKey === dateKey;
          return (
            <button
              key={day}
              type="button"
              className={`text-center text-xs py-1.5 rounded-full hover:bg-gray-100 transition-colors ${
                isSelected ? "ring-1 ring-[#C9922A] text-[#C9922A] font-semibold" : "text-gray-600"
              }`}
              onClick={() => {
                onSelectDate(dateKey);
                onClose();
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// â”€â”€ Status Dropdown â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatusDropdown({ onSelect, onClose }: { onSelect: (s: string) => void; onClose: () => void }) {
  const statuses = ["All Statuses", "Active", "Pending", "Completed", "Cancelled"];
  return (
    <div
      className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-2xl py-2 w-44 min-w-full"
      onClick={(e) => e.stopPropagation()}
    >
      {statuses.map((s, i) => (
        <button
          key={s}
          type="button"
          className="w-full text-left px-4 py-2.5 text-sm text-[#591727] hover:bg-gray-50 transition-colors"
          style={{ borderBottom: i < statuses.length - 1 ? "1px solid #F3F0E8" : "none" }}
          onClick={() => {
            onSelect(s);
            onClose();
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// â”€â”€ Main Patients Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function PatientsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [overview, setOverview] = useState<PatientsPageOverview>(DEFAULT_PATIENTS_OVERVIEW);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [listPage, setListPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [lastVisitFilter, setLastVisitFilter] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStatusDrop, setShowStatusDrop] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingAppointmentId, setViewingAppointmentId] = useState<string | null>(null);
  const [patientDetailLoading, setPatientDetailLoading] = useState(false);
  const [patientDetailError, setPatientDetailError] = useState<string | null>(null);

  const [clinicalModal, setClinicalModal] = useState<{
    mode: "create" | "edit";
    appointmentId: string;
    patientName: string;
    patientId: string;
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<PatientTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [emailTarget, setEmailTarget] = useState<PatientTableRow | null>(null);
  const [clinicalNotesPickerOpen, setClinicalNotesPickerOpen] = useState(false);
  const [clinicalNotesPickId, setClinicalNotesPickId] = useState("");
  const [clinicalNotesDropOpen, setClinicalNotesDropOpen] = useState(false);
  const [clinicalNotesPatients, setClinicalNotesPatients] = useState<PatientTableRow[]>([]);

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const card = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder = isDark ? "border-[#5C2A3A]" : "border-[#753141]";
  const cardInner = isDark ? "#d0baa3" : "#FFFFFF";
  const text1 = isDark ? "#591727" : "#591727";
  const text2 = isDark ? "#591727" : "#591727";
  const pageBg = isDark ? "#2A0D18" : "#FFFFFF";
  const inputBg = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#753141" : "#753141";
  const tableBg = isDark ? "#c1a694" : "#FDFAF4";
  const tableRowHover = isDark ? "#E5E7EB" : "#F3F4F6";

  const { patients, pagination } = overview;
  const totalPatients = overview.totalPatients;
  const newPatients = overview.newPatients;
  const monthGrowth = formatMonthGrowth(overview.patientsMonthGrowthPct);

  const fetchOverview = useCallback(async () => {
    if (!getToken()) {
      setOverviewError("Please sign in to view patients.");
      setOverviewLoading(false);
      return;
    }

    setOverviewLoading(true);
    setOverviewError(null);

    try {
      const params = new URLSearchParams({
        page: String(listPage),
        limit: String(PAGE_SIZE),
      });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (statusFilter !== "All Statuses") params.set("status", statusFilter);
      if (lastVisitFilter) params.set("lastVisit", lastVisitFilter);

      const response = await fetch(
        apiUrl(`/api/statistics/patients-overview?${params.toString()}`),
        { headers: authHeaders(), cache: "no-store" }
      );
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setOverviewError(json.message || "Failed to load patients.");
        return;
      }

      if (json.data) {
        setOverview({
          ...DEFAULT_PATIENTS_OVERVIEW,
          ...json.data,
          patients: json.data.patients ?? [],
          pagination: json.data.pagination ?? DEFAULT_PATIENTS_OVERVIEW.pagination,
        });
      }
    } catch {
      setOverviewError("Network error while loading patients.");
    } finally {
      setOverviewLoading(false);
    }
  }, [listPage, searchQuery, statusFilter, lastVisitFilter]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 300);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    setListPage(1);
  }, [searchQuery, statusFilter, lastVisitFilter]);

  const closePatientDetail = () => {
    setViewingAppointmentId(null);
    setSelectedPatient(null);
    setPatientDetailError(null);
    setPatientDetailLoading(false);
  };

  const fetchPatientDetailForAppointment = useCallback(async (appointmentId: string) => {
    if (!getToken()) {
      setPatientDetailError("Please sign in to view patient details.");
      setSelectedPatient(null);
      return null;
    }

    setPatientDetailLoading(true);
    setPatientDetailError(null);

    try {
      const response = await fetch(apiUrl(`/api/statistics/appointments/${appointmentId}`), {
        headers: authHeaders(),
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPatientDetailError(json.message || "Failed to load patient details.");
        setSelectedPatient(null);
        return null;
      }

      if (!json.data) {
        setPatientDetailError("Patient data was not found.");
        setSelectedPatient(null);
        return null;
      }

      const patient = appointmentDetailToPatient(json.data as AppointmentDetail);
      setSelectedPatient(patient);
      return patient;
    } catch {
      setPatientDetailError("Network error while loading patient details.");
      setSelectedPatient(null);
      return null;
    } finally {
      setPatientDetailLoading(false);
    }
  }, []);

  const handleViewPatient = (row: PatientTableRow) => {
    setViewingAppointmentId(row.id);
    setSelectedPatient(null);
    void fetchPatientDetailForAppointment(row.id);
  };

  const handleAddCheckup = (row: PatientTableRow) => {
    setClinicalModal({
      mode: "create",
      appointmentId: row.id,
      patientName: row.name,
      patientId: row.patientId,
    });
  };

  const handleEditCheckup = (row: PatientTableRow) => {
    setClinicalModal({
      mode: "edit",
      appointmentId: row.id,
      patientName: row.name,
      patientId: row.patientId,
    });
  };

  async function openClinicalNotesForm() {
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "500",
        sort: "recent",
      });
      const response = await fetch(
        apiUrl(`/api/statistics/patients-overview?${params.toString()}`),
        { headers: authHeaders(), cache: "no-store" }
      );
      const json = await response.json().catch(() => ({}));
      const list: PatientTableRow[] = json.data?.patients ?? [];

      if (!response.ok || list.length === 0) {
        window.alert("No patients available. Add an appointment first.");
        return;
      }
      if (list.length === 1) {
        handleAddCheckup(list[0]);
        return;
      }
      setClinicalNotesPatients(list);
      setClinicalNotesPickId(list[0].id);
      setClinicalNotesDropOpen(false);
      setClinicalNotesPickerOpen(true);
    } catch {
      window.alert("Could not load patients. Please try again.");
    }
  }

  function confirmClinicalNotesPatient() {
    const row = clinicalNotesPatients.find((p) => p.id === clinicalNotesPickId);
    if (!row) {
      window.alert("Please select a patient.");
      return;
    }
    setClinicalNotesPickerOpen(false);
    handleAddCheckup(row);
  }

  const confirmDeletePatient = async () => {
    if (!deleteTarget || deleteLoading) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(
        apiUrl(`/api/statistics/appointments/${deleteTarget.id}`),
        { method: "DELETE", headers: authHeaders() }
      );
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        window.alert(json.message || "Failed to delete appointment.");
        return;
      }

      if (viewingAppointmentId === deleteTarget.id) {
        closePatientDetail();
      }
      if (clinicalModal?.appointmentId === deleteTarget.id) {
        setClinicalModal(null);
      }

      setDeleteTarget(null);
      await fetchOverview();
    } catch {
      window.alert("Could not delete appointment. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaveClinicalRecord = async (payload: ClinicalRecordSavePayload) => {
    if (!clinicalModal) return;
    const appointmentId = clinicalModal.appointmentId;

    try {
      const response = await fetch(
        apiUrl(`/api/statistics/appointments/${appointmentId}/checkup`),
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        window.alert(json.message || "Failed to save clinical record.");
        return;
      }

      setClinicalModal(null);
      if (viewingAppointmentId === appointmentId) {
        void fetchPatientDetailForAppointment(appointmentId);
      }
      await fetchOverview();
    } catch {
      window.alert("Could not save clinical record. Please try again.");
    }
  };

  const listStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const listEnd = Math.min(pagination.page * pagination.limit, pagination.total);

  const paginationButtons = (() => {
    const tp = pagination.totalPages;
    if (tp <= 5) {
      return Array.from({ length: tp }, (_, i) => i + 1);
    }
    const pages = new Set<number>([1, listPage, tp]);
    if (listPage > 1) pages.add(listPage - 1);
    if (listPage < tp) pages.add(listPage + 1);
    if (listPage > 2) pages.add(listPage - 2);
    return [...pages].sort((a, b) => a - b);
  })();

  if (viewingAppointmentId) {
    return (
      <PatientDetail
        patient={selectedPatient}
        loading={patientDetailLoading}
        error={patientDetailError}
        onRetry={() => fetchPatientDetailForAppointment(viewingAppointmentId)}
        onBack={closePatientDetail}
        isDark={isDark}
        card={card}
        cardBorder={cardBorder}
        cardInner={cardInner}
        text1={text1}
        text2={text2}
        pageBg={pageBg}
        sectionLabel="PATIENTS"
      />
    );
  }

  return (
    <div
      className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden lg:overflow-x-visible"
      style={{ marginTop: "40px" }}
      onClick={() => { setShowCalendar(false); setShowStatusDrop(false); }}
    >
      {deleteTarget && (
        <DeletePatientModal
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          text1={text1}
          text2={text2}
          pageBg={pageBg}
          row={deleteTarget}
          loading={deleteLoading}
          onConfirm={() => void confirmDeletePatient()}
          onClose={() => {
            if (!deleteLoading) setDeleteTarget(null);
          }}
        />
      )}

      {emailTarget && (
        <PatientEmailModal
          row={emailTarget}
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          text1={text1}
          text2={text2}
          pageBg={pageBg}
          getAuthHeaders={authHeaders}
          onClose={() => setEmailTarget(null)}
        />
      )}
      {clinicalNotesPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              setClinicalNotesPickerOpen(false);
              setClinicalNotesDropOpen(false);
              setClinicalNotesPatients([]);
            }}
          />
          <div
            className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 ${cardBorder}`}
            style={{ backgroundColor: pageBg }}
            onClick={(e) => {
              e.stopPropagation();
              setClinicalNotesDropOpen(false);
            }}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-2" style={{ color: isDark ? "#ffffff" : "#591727" }}>
              Clinical Notes
            </h2>
            <p className="text-sm mb-4" style={{ color: text2 }}>
              Select a patient to open the clinical notes form.
            </p>
            <div className="relative mb-5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setClinicalNotesDropOpen((open) => !open);
                }}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border text-left flex items-center justify-between gap-2"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
              >
                <span className="truncate">
                  {clinicalNotesPatients.find((p) => p.id === clinicalNotesPickId)?.name ?? "Select patient"}
                  {clinicalNotesPickId
                    ? ` — ${clinicalNotesPatients.find((p) => p.id === clinicalNotesPickId)?.patientId ?? ""}`
                    : ""}
                </span>
                <svg width="12" height="7" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0, transform: clinicalNotesDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <path d="M1 1L6 7L11 1" stroke={text1} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {clinicalNotesDropOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border shadow-xl py-1 max-h-48 overflow-y-auto"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {clinicalNotesPatients.map((row, i) => (
                    <button
                      key={row.id}
                      type="button"
                      className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#F5ECD7]"
                      style={{
                        color: text1,
                        borderBottom: i < clinicalNotesPatients.length - 1 ? `1px solid ${isDark ? "#5C2A3A" : "#F0E8DC"}` : "none",
                        fontWeight: clinicalNotesPickId === row.id ? 700 : 400,
                      }}
                      onClick={() => {
                        setClinicalNotesPickId(row.id);
                        setClinicalNotesDropOpen(false);
                      }}
                    >
                      {row.name} — {row.patientId}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setClinicalNotesPickerOpen(false);
                  setClinicalNotesDropOpen(false);
                  setClinicalNotesPatients([]);
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold border"
                style={{ borderColor: isDark ? "#5C2A3A" : "#3D0A1F", color: text1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setClinicalNotesDropOpen(false);
                  confirmClinicalNotesPatient();
                }}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727" }}
              >
                Open Form
              </button>
            </div>
          </div>
        </div>
      )}
      {clinicalModal && (
        <ClinicalRecordFormModal
          mode={clinicalModal.mode}
          appointmentId={clinicalModal.appointmentId}
          patientName={clinicalModal.patientName}
          patientId={clinicalModal.patientId}
          getAuthHeaders={authHeaders}
          onClose={() => setClinicalModal(null)}
          onSave={handleSaveClinicalRecord}
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          text1={text1}
          text2={text2}
        />
      )}

      {/* â”€â”€ Page Header â”€â”€ */}
      <h1 className="text-2xl sm:text-3xl font-bold tracking-wide mb-5" style={{ color: isDark ? "#ffffff" : "#591727" }}>
        PATIENTS
      </h1>

      {/* â”€â”€ Stat Cards â€” stack on mobile, row on sm+ â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-4 mb-6">
        {/* Total Patients */}
        <div className={`relative rounded-2xl p-6 border ${cardBorder} w-full sm:min-w-[300px] sm:max-w-xs`}
          style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3" }}>
          <p className="text-sm mb-2" style={{ color: text2 }}>Total Patients</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold numeric-font" style={{ color: text1 }}>{totalPatients}</span>
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#711C314D] text-[#591727] mb-1">
              {formatTodayDelta(overview.totalPatientsTodayDelta)}
            </span>
          </div>
          {monthGrowth && (
            <p className="text-sm mt-1" style={{ color: "#591727" }}>{monthGrowth}</p>
          )}
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
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#711C314D] text-[#591727] mb-1">
              {formatTodayDelta(overview.newPatientsTodayDelta)}
            </span>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[70%] w-[14px]">
            <div className="h-full w-full" style={{ backgroundColor: isDark ? "#c9a898" : "#D3D3D3", borderTopLeftRadius: "9999px", borderBottomLeftRadius: "9999px", boxShadow: "inset 4px 0 8px rgba(0,0,0,0.15)" }} />
          </div>
        </div>
        <div className="flex w-full sm:w-auto sm:ml-auto sm:self-end sm:pb-1 sm:pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openClinicalNotesForm();
            }}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors inline-flex items-center justify-center gap-2 ${isDark ? "border-[#FFFFFF] text-white hover:bg-[#c9a898] hover:text-[#3D0A1F]" : "border-[#711C31] bg-[#591727] text-white hover:bg-[#711C31]"}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Clinical Notes
          </button>
        </div>
      </div>

      {overviewError && (
        <p className="text-sm mb-4" style={{ color: isDark ? "#8B1A2E" : "#C94A3A" }}>
          {overviewError}{" "}
          <button type="button" className="underline font-semibold" onClick={() => void fetchOverview()}>
            Retry
          </button>
        </p>
      )}

      {/* Table card */}
      <div className={`rounded-2xl border ${cardBorder} overflow-hidden`} style={{ backgroundColor: tableBg }}>

        {/* Search & Filter â€” stacks on mobile */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4 border-b" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}>
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border" style={{ backgroundColor: inputBg, borderColor: inputBorder }}>
            <span className="shrink-0 flex items-center justify-center" style={{ color: text2 }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search by name, ID or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none"
              style={{ color: text1 }}
            />
          </div>
          {/* Filters row */}
          <div className="flex gap-2">
            {/* Status filter */}
            <div className="relative flex-1 sm:flex-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusDrop((p) => !p);
                  setShowCalendar(false);
                }}
                className="w-full min-w-[140px] flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-sm"
                style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text2 }}
              >
                <span className="truncate text-left">{statusFilter}</span>
                <span className="shrink-0 flex items-center justify-center" style={{ color: text2 }}>
                  <ChevronDownIcon />
                </span>
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
              {showCalendar && (
                <CalendarDropdown
                  selectedDate={lastVisitFilter}
                  onSelectDate={(dateKey) => {
                    setLastVisitFilter(dateKey);
                    setShowCalendar(false);
                  }}
                  onClose={() => setShowCalendar(false)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden">
          <table className="w-full text-xs sm:text-sm table-fixed">
            <colgroup>
              <col className="w-[14%]" />
              <col className="w-[18%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[21%]" />
            </colgroup>
            <thead>
              <tr style={{ borderBottom: `1px solid ${isDark ? "#5C2A3A" : "#591727"}` }}>
                {["Patient Name", "Email & Phone", "Spécialités", "Last Visit", "Next Appointment", "Status", "Actions"].map(h => (
                  <th key={h} className={`px-2 py-2.5 text-[11px] sm:text-[13px] font-semibold ${h === "Actions" ? "text-center" : "text-left"}`} style={{ color: text2 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {overviewLoading && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm animate-pulse" style={{ color: text2 }}>
                    Loading patients...
                  </td>
                </tr>
              )}
              {!overviewLoading &&
                patients.map((row) => (
                <tr
                  key={row.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: `1px solid ${isDark ? "#5C2A3A" : "#591727"}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tableRowHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td className="px-2 py-2.5 align-top">
                    <div className="font-semibold truncate" style={{ color: text1 }} title={row.name}>{row.name}</div>
                    <div className="text-[11px] truncate" style={{ color: text2 }} title={row.patientId}>ID: {row.patientId}</div>
                  </td>
                  <td className="px-2 py-2.5 align-top">
                    <div className="truncate text-[11px]" style={{ color: text2 }} title={row.email}>{row.email}</div>
                    <div className="truncate text-[11px]" style={{ color: text2 }} title={row.phone}>{row.phone}</div>
                  </td>
                  <td className="px-2 py-2.5 align-top">
                    <span className="text-[11px] line-clamp-2" style={{ color: text2 }} title={row.specialty}>{row.specialty}</span>
                  </td>
                  <td className="px-2 py-2.5 align-top">
                    <span className="text-[11px] truncate block" style={{ color: text2 }} title={row.lastVisit}>{row.lastVisit}</span>
                  </td>
                  <td className="px-2 py-2.5 align-top">
                    {row.nextAppt === "None Scheduled" ? (
                      <span className="text-[11px] truncate block" style={{ color: text2 }}>None Scheduled</span>
                    ) : (
                      <div className="flex items-center gap-1 min-w-0">
                        <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#711C31" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-[11px] truncate" style={{ color: isDark ? "#711C31" : "#380c16" }} title={row.nextAppt}>{row.nextAppt}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2.5 align-top">
                    <span className={statusStyle(row.status)}>{row.status}</span>
                  </td>
                  <td className="px-2 py-2.5 align-middle text-center">
                    <PatientListActions
                      variant="patients"
                      row={row}
                      text2={text2}
                      onDelete={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(row);
                      }}
                      onView={(e) => {
                        e.stopPropagation();
                        handleViewPatient(row);
                      }}
                      onEditClinical={(e) => {
                        e.stopPropagation();
                        handleEditCheckup(row);
                      }}
                      onSendEmail={(e) => {
                        e.stopPropagation();
                        setEmailTarget(row);
                      }}
                    />
                  </td>
                </tr>
              ))}
              {!overviewLoading && patients.length === 0 && (
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
            Showing {listStart} to {listEnd} of {pagination.total} results
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={listPage <= 1 || overviewLoading}
              onClick={() => setListPage((p) => Math.max(1, p - 1))}
              className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40"
              style={{ color: text2 }}
            >
              {"\u2039"}
            </button>
            {paginationButtons.map((n, idx) => {
              const prev = paginationButtons[idx - 1];
              const showEllipsis = prev !== undefined && n - prev > 1;
              return (
                <span key={n} className="flex items-center gap-1">
                  {showEllipsis && (
                    <span className="text-xs px-1" style={{ color: text2 }}>
                      ...
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={overviewLoading}
                    onClick={() => setListPage(n)}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                    style={{
                      backgroundColor:
                        n === listPage ? (isDark ? "#8B1A2E" : "#591727") : "transparent",
                      color: n === listPage ? "#F5ECD7" : text2,
                    }}
                  >
                    {n}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              disabled={listPage >= pagination.totalPages || overviewLoading}
              onClick={() => setListPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40"
              style={{ color: text2 }}
            >
              {"\u203A"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

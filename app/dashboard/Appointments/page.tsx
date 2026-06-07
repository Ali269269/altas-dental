"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import { getToken } from "@/utils/auth";
import { apiUrl } from "@/utils/api";
import {
  DEFAULT_APPOINTMENTS_OVERVIEW,
  type AppointmentsPageOverview,
  type AppointmentListItem,
  type PendingConfirmationItem,
  type AppointmentDetail,
  type CalendarEvent,
  type WeekCalendarEvent,
  type DayCalendarEvent,
} from "@/utils/appointmentsData";
import {
  applyAppointmentSeenLocally,
  mergeOverviewLists,
} from "@/utils/appointmentsOverviewPatch";
import {
  chunkIntoGroups,
  getCarouselSlideStyle,
  getCarouselTrackStyle,
  useAutoCarousel,
} from "@/utils/carousel";
import {
  formatAppointmentDateLabels,
  getTodayAnchorDate,
} from "@/utils/appointmentDateLabels";
import type { Patient } from "@/types/patient";
import type { AppointmentTableRow } from "@/utils/appointmentsData";
import { appointmentRowToPatient, appointmentDetailToPatient } from "@/utils/patientMapper";
import { PatientDetail } from "@/components/admin/patient/PatientDetail";
import { ClinicalRecordFormModal } from "@/components/admin/patient/ClinicalRecordFormModal";
import { PatientEmailModal } from "@/components/admin/patient/PatientEmailModal";
import { PatientListActions } from "@/components/admin/patient/PatientListActions";
import type { ClinicalRecordSavePayload } from "@/utils/clinicalRecord";

// ── Types ──────────────────────────────────────────────────────────────────────
type ViewMode    = "month" | "week" | "day";
type DisplayMode = "list" | "calendar";
type ModalType   = "none" | "pending" | "addPatient";

const MONTH_DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function shiftAnchorDate(anchor: string, viewMode: ViewMode, direction: -1 | 1): string {
  const [y, m, d] = anchor.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (viewMode === "month") {
    date.setMonth(date.getMonth() + direction);
    date.setDate(1);
  } else if (viewMode === "week") {
    date.setDate(date.getDate() + direction * 7);
  } else {
    date.setDate(date.getDate() + direction);
  }
  return toDateKey(date);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusStyle(status:string){
  switch(status){
    case"CONFIRMED": return"text-[#711c31] border border-[#C94A3A] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
    case"PENDING":   return"text-[#753141] border border-[#D3D3D3] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
    case"CANCELLED": return"text-[#C94A3A] border border-[#C94A3A] text-[10px] bg-[#bfafaa] font-bold px-2 py-0.5 rounded tracking-wide";
    case"SEEN":      return"text-[#ffffff] border border-[#591727] text-[10px] bg-[#591727] font-bold px-2 py-0.5 rounded tracking-wide";
    case"ACTIVE":    return"text-[#711c31] border border-[#C94A3A] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
    case"NEW":       return"text-[#C94A3A] border border-[#C94A3A] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    default:         return"";
  }
}
function eventColor(color:string){
  switch(color){
    case"blue":  return"bg-blue-100 border-l-2 border-blue-400 text-blue-700";
    case"red":   return"bg-red-50 border-l-2 border-red-400 text-red-700";
    case"gold":  return"bg-yellow-50 border-l-2 border-yellow-500 text-yellow-700";
    case"green": return"bg-green-50 border-l-2 border-green-500 text-green-700";
    default:     return"bg-gray-100 border-l-2 border-gray-400 text-gray-700";
  }
}
function eventColorDay(color:string){
  switch(color){
    case"blue":  return{bar:"#3B82F6",text:"#1D4ED8"};
    case"red":   return{bar:"#EF4444",text:"#DC2626"};
    case"gold":  return{bar:"#D97706",text:"#92400E"};
    case"green": return{bar:"#10B981",text:"#065F46"};
    default:     return{bar:"#6B7280",text:"#374151"};
  }
}

// ── AddForm type ──────────────────────────────────────────────────────────────
type AddForm = { name:string; email:string; phone:string; specialty:string; date:string; time:string; notes:string };

// ── Pending Modal ─────────────────────────────────────────────────────────────
interface PendingModalProps {
  isDark:boolean; card:string; cardBorder:string; text1:string; text2:string;
  pageBg:string; cardInner:string; inputBg:string; inputBorder:string;
  pendingConfirmations: PendingConfirmationItem[];
  onConfirm:(id:string)=>void;
  onCancel:(id:string)=>void;
  onClose:()=>void;
}
function PendingModal({ isDark,card,cardBorder,text1,text2,pageBg,cardInner,pendingConfirmations,onConfirm,onCancel,onClose }:PendingModalProps){
  return(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative ml-auto w-full max-w-2xl h-full overflow-y-auto p-4 sm:p-8" style={{backgroundColor:pageBg}}>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border transition hover:scale-105 shrink-0"
            style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", backgroundColor: isDark ? "#4A2030" : "#FDFAF4", color: isDark ? "#F5ECD7" : "#3D0A1F" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h2 className="text-lg sm:text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "#711C31" }}>APPOINTMENTS /</h2>
          <span className="text-lg sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>Pending Confirmations</span>
        </div>
        <div className="inline-block text-xs px-3 py-1 rounded-full border mb-6"
          style={{borderColor:isDark?"#5C2A3A":"#D9C9A8",color:text2,backgroundColor:cardInner}}>
          {pendingConfirmations.length} Appointments need confirmation
        </div>
        <div className="flex flex-col gap-4">
          {pendingConfirmations.map((p)=>(
            <div key={p.id} className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <div className="flex items-center justify-between mb-1 gap-2">
                <span className="text-base font-semibold truncate" style={{color:isDark?"#711C31":"#7A3048"}}>{p.name}</span>
                <span className="text-xs shrink-0" style={{color:text2}}>{p.timeAgo}</span>
              </div>
              <p className="text-sm mb-1" style={{color:text2}}>{p.service} · {p.date}</p>
              <p className="text-xs mb-4 flex items-center gap-1" style={{color:text2}}><span>⏰</span>{p.time}</p>
              <div className="flex gap-3">
                <button type="button" onClick={()=>onCancel(p.id)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{backgroundColor:"#8B1A2E"}}>Cancel</button>
                <button type="button" onClick={()=>onConfirm(p.id)}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold border`}
                  style={{borderColor:"#591727",color:isDark?"#591727":"#3D0A1F"}}>Confirm</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Appointment Detail Modal ──────────────────────────────────────────────────
interface AppointmentDetailModalProps {
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
  pageBg: string;
  inputBg: string;
  inputBorder: string;
  appointment: AppointmentDetail;
  loading: boolean;
  actionLoading: boolean;
  showCancelForm: boolean;
  cancelReason: string;
  onCancelReasonChange: (value: string) => void;
  onShowCancelForm: () => void;
  onHideCancelForm: () => void;
  onConfirm: () => void;
  onCancelSubmit: () => void;
  onClose: () => void;
}

function AppointmentDetailModal({
  isDark,
  card,
  cardBorder,
  text1,
  text2,
  pageBg,
  inputBg,
  inputBorder,
  appointment,
  loading,
  actionLoading,
  showCancelForm,
  cancelReason,
  onCancelReasonChange,
  onShowCancelForm,
  onHideCancelForm,
  onConfirm,
  onCancelSubmit,
  onClose,
}: AppointmentDetailModalProps) {
  const canConfirm = ["NEW", "PENDING"].includes(appointment.status);
  const canCancel = appointment.status !== "CANCELLED" && appointment.status !== "SEEN";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 ${cardBorder}`}
        style={{ backgroundColor: pageBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : "#591727" }}>
            Appointment Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border shrink-0"
            style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: text1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ color: text2 }}>Loading appointment...</p>
        ) : (
          <>
            <div className={`rounded-2xl border p-4 sm:p-5 ${cardBorder} flex flex-col gap-3`} style={{ backgroundColor: card }}>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Patient</p>
                <p className="text-base font-semibold" style={{ color: text1 }}>{appointment.patientName}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Email</p>
                  <p className="text-sm break-all" style={{ color: text1 }}>{appointment.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Phone</p>
                  <p className="text-sm" style={{ color: text1 }}>{appointment.phone}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Speciality</p>
                <p className="text-sm" style={{ color: text1 }}>{appointment.specialty}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Date</p>
                  <p className="text-sm" style={{ color: text1 }}>{appointment.appointmentDateLabel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Time</p>
                  <p className="text-sm" style={{ color: text1 }}>{appointment.appointmentTime}</p>
                </div>
              </div>
              {appointment.notes ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Notes</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: text1 }}>{appointment.notes}</p>
                </div>
              ) : null}
              {appointment.cancellationReason ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>Cancellation reason</p>
                  <p className="text-sm" style={{ color: text1 }}>{appointment.cancellationReason}</p>
                </div>
              ) : null}
            </div>

            {!showCancelForm && (
              <div
                className="flex flex-row items-center justify-between gap-4 mt-4 pt-4"
                style={{ borderTop: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}
              >
                <div className="flex flex-col gap-1.5 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: text2 }}>
                    Current Status
                  </p>
                  <span className={`inline-block w-fit ${statusStyle(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="flex flex-row items-center gap-2 sm:gap-3 shrink-0">
                  {canConfirm && (
                    <button
                      type="button"
                      onClick={onConfirm}
                      disabled={actionLoading || loading}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border whitespace-nowrap disabled:opacity-60"
                      style={{ borderColor: "#591727", color: isDark ? "#591727" : "#3D0A1F" }}
                    >
                      {actionLoading ? "Confirming..." : "Confirm appointment"}
                    </button>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      onClick={onShowCancelForm}
                      disabled={actionLoading || loading}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white whitespace-nowrap disabled:opacity-60"
                      style={{ backgroundColor: "#8B1A2E" }}
                    >
                      Cancel appointment
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {showCancelForm && canCancel && (
          <div className="mt-4">
            <label className="text-[11px] font-semibold tracking-wider uppercase mb-2 block" style={{ color: text2 }}>
              Cancellation reason (sent to patient by email)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => onCancelReasonChange(e.target.value)}
              rows={3}
              placeholder="Explain why this appointment is cancelled..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
              style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
            />
          </div>
        )}

        {showCancelForm && (
          <div className="flex flex-row items-center justify-end gap-3 mt-5">
            <button
              type="button"
              onClick={onHideCancelForm}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border"
              style={{ borderColor: isDark ? "#5C2A3A" : "#3D0A1F", color: text1 }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={onCancelSubmit}
              disabled={actionLoading || !cancelReason.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#8B1A2E" }}
            >
              {actionLoading ? "Cancelling..." : "Confirm cancellation"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Delete Appointment Confirmation Modal ─────────────────────────────────────
interface DeleteAppointmentModalProps {
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
  pageBg: string;
  row: AppointmentTableRow;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteAppointmentModal({
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
}: DeleteAppointmentModalProps) {
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
          This will permanently remove the appointment for{" "}
          <strong style={{ color: text1 }}>{row.name}</strong> ({row.nextAppt}). This action cannot be
          undone and the record will not be kept as cancelled.
        </p>
        <div className={`rounded-xl border p-3 mb-5 text-sm ${cardBorder}`} style={{ backgroundColor: card }}>
          <p style={{ color: text1 }}>
            <span style={{ color: text2 }}>Email:</span> {row.email}
          </p>
          <p className="mt-1" style={{ color: text1 }}>
            <span style={{ color: text2 }}>Phone:</span> {row.phone}
          </p>
          <p className="mt-1" style={{ color: text1 }}>
            <span style={{ color: text2 }}>Service:</span> {row.specialty}
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
            Keep appointment
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

// ── Add Patient Modal ─────────────────────────────────────────────────────────
interface AddPatientModalProps {
  isDark:boolean; card:string; cardBorder:string; text1:string; text2:string;
  pageBg:string; inputBg:string; inputBorder:string;
  addForm:AddForm; setAddForm:React.Dispatch<React.SetStateAction<AddForm>>;
  booking:boolean;
  onBook:()=>void;
  onClose:()=>void;
}
function AddPatientModal({isDark,card,cardBorder,text1,text2,pageBg,inputBg,inputBorder,addForm,setAddForm,booking,onBook,onClose}:AddPatientModalProps){
  const minAppointmentDate = getTodayAnchorDate();
  const fields = [
    {label:"👤 PATIENT NAME",  key:"name",    type:"text",  ph:"Enter Name"},
    {label:"✉️ EMAIL ADDRESS", key:"email",   type:"email", ph:"Enter Email"},
    {label:"📞 PHONE NUMBER",  key:"phone",   type:"tel",   ph:"Contact Number"},
  ];
  return(
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
      <div className="relative w-full max-w-3xl h-full overflow-y-auto p-4 sm:p-8" style={{backgroundColor:pageBg}}>
        <div className="flex items-center gap-3 mb-6 sm:mb-8 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold" style={{color:isDark ? "#ffffff": ""}}>APPOINTMENTS /</h2>
          <span className="text-xl sm:text-2xl font-bold" style={{color:isDark?"#B09070":"#7A6040"}}>Add Patient</span>
        </div>
        <div className={`rounded-2xl p-4 sm:p-8 border ${cardBorder}`} style={{backgroundColor:card}}>
          {/* Mobile: 1 col; sm+: 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left */}
            <div className="flex flex-col gap-5">
              {fields.map(f=>(
                <div key={f.key}>
                  <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                    style={{color:isDark?"#591727":"#7A6040"}}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.ph}
                    value={(addForm as any)[f.key]}
                    onChange={e=>setAddForm(prev=>({...prev,[f.key]:e.target.value}))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                    style={{backgroundColor:inputBg,borderColor:inputBorder,color:text1}}
                  />
                </div>
              ))}
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>➕ SPECIALITIES</label>
                <select value={addForm.specialty}
                  onChange={e=>setAddForm(prev=>({...prev,specialty:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border appearance-none"
                  style={{backgroundColor:inputBg,borderColor:inputBorder,color:addForm.specialty?text1:text2}}>
                  <option value="">Select Speciality</option>
                  <option>Aligneurs</option><option>Parodontologie</option>
                  <option>Endodontie</option><option>Réhabilitation totale du sourire</option>
                  <option>Complex Surgery</option>
                </select>
              </div>
            </div>
            {/* Right */}
            <div className="flex flex-col gap-5">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>
                  <span style={{color:"#591727"}}>📅</span> SELECT DATE
                </label>
                <input
                  type="date"
                  value={addForm.date}
                  min={minAppointmentDate}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (next && next < minAppointmentDate) return;
                    setAddForm((prev) => ({ ...prev, date: next }));
                  }}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                  style={{ backgroundColor: inputBg, borderColor: inputBorder, color: text1 }}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>⏰ SELECT TIME</label>
                <select value={addForm.time}
                  onChange={e=>setAddForm(prev=>({...prev,time:e.target.value}))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border appearance-none"
                  style={{backgroundColor:inputBg,borderColor:inputBorder,color:addForm.time?text1:text2}}>
                  <option value="">Select Time</option>
                  {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM",
                    "01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map(t=>(
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider uppercase mb-2"
                  style={{color:isDark?"#591727":"#7A6040"}}>📋 NOTES</label>
                <textarea placeholder="Message" value={addForm.notes}
                  onChange={e=>setAddForm(prev=>({...prev,notes:e.target.value}))}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
                  style={{backgroundColor:inputBg,borderColor:inputBorder,color:text1}}/>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <button onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold border"
              style={{borderColor:isDark?"#5C2A3A":"#3D0A1F",color:text1}}>
              Discard Changes
            </button>
            <button type="button" disabled={booking} onClick={onBook}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>
              {booking ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AppointmentsPage(){
  const {theme}=useTheme();
  const isDark=theme==="dark";

  const [viewMode,   setViewMode]   = useState<ViewMode>("month");
  const [displayMode,setDisplayMode]= useState<DisplayMode>("calendar");
  const [modal,      setModal]      = useState<ModalType>("none");
  const [addForm,    setAddForm]    = useState<AddForm>({name:"",email:"",phone:"",specialty:"",date:"",time:"",notes:""});
  const [booking,    setBooking]    = useState(false);
  const todayAnchor = getTodayAnchorDate();
  const [data,       setData]       = useState<AppointmentsPageOverview>(() => ({
    ...DEFAULT_APPOINTMENTS_OVERVIEW,
    anchorDate: todayAnchor,
    dateLabels: formatAppointmentDateLabels(todayAnchor),
  }));
  const [anchorDate, setAnchorDate] = useState(todayAnchor);
  const [listPage,   setListPage]   = useState(1);
  const [search,     setSearch]     = useState("");
  const [searchInput,setSearchInput]= useState("");
  const [statusFilter,setStatusFilter]= useState("ALL");
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const datePickerRef = useRef<HTMLInputElement | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewingPatientAppointmentId, setViewingPatientAppointmentId] = useState<string | null>(null);
  const [patientDetailLoading, setPatientDetailLoading] = useState(false);
  const [patientDetailError, setPatientDetailError] = useState<string | null>(null);
  const [clinicalModal, setClinicalModal] = useState<{
    mode: "create" | "edit";
    appointmentId: string;
    patientName: string;
    patientId: string;
  } | null>(null);
  const [patientHistoryByAppointment, setPatientHistoryByAppointment] = useState<
    Record<string, Patient["historyEntries"]>
  >({});
  const [appointmentDetailId, setAppointmentDetailId] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetail | null>(null);
  const [appointmentDetailLoading, setAppointmentDetailLoading] = useState(false);
  const [appointmentActionLoading, setAppointmentActionLoading] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AppointmentTableRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [emailTarget, setEmailTarget] = useState<AppointmentTableRow | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const overviewLoadedRef = useRef(false);

  const buildPatientFromRow = useCallback(
    (row: AppointmentTableRow): Patient =>
      appointmentRowToPatient(row, {
        historyEntries: patientHistoryByAppointment[row.id] ?? [],
      }),
    [patientHistoryByAppointment]
  );

  const overviewQueryPayload = useCallback(
    () => ({
      date: anchorDate,
      view: viewMode,
      page: listPage,
      limit: 12,
      search: search || undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    }),
    [anchorDate, viewMode, listPage, search, statusFilter]
  );

  const fetchOverview = useCallback(async (): Promise<boolean> => {
    if (!getToken()) return false;

    try {
      const params = new URLSearchParams({
        date: anchorDate,
        view: viewMode,
        page: String(listPage),
        limit: "12",
      });
      if (search) params.set("search", search);
      if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);

      const response = await fetch(
        apiUrl(`/api/statistics/appointments-overview?${params.toString()}`),
        {
          headers: authHeaders(),
          cache: "no-store",
        }
      );

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          const nextAnchor = json.data.anchorDate ?? anchorDate;
          setData({
            statCards: json.data.statCards ?? DEFAULT_APPOINTMENTS_OVERVIEW.statCards,
            pendingConfirmations: json.data.pendingConfirmations ?? [],
            dateLabels: json.data.dateLabels ?? DEFAULT_APPOINTMENTS_OVERVIEW.dateLabels,
            anchorDate: nextAnchor,
            monthCalendar: json.data.monthCalendar ?? DEFAULT_APPOINTMENTS_OVERVIEW.monthCalendar,
            weekCalendar: json.data.weekCalendar ?? DEFAULT_APPOINTMENTS_OVERVIEW.weekCalendar,
            dayCalendar: json.data.dayCalendar ?? DEFAULT_APPOINTMENTS_OVERVIEW.dayCalendar,
            upcomingAppointments: json.data.upcomingAppointments ?? [],
            patientsSeen: json.data.patientsSeen ?? [],
            calendarAppointments: json.data.calendarAppointments ?? [],
            allAppointments: json.data.allAppointments ?? [],
            pagination: json.data.pagination ?? DEFAULT_APPOINTMENTS_OVERVIEW.pagination,
          });
          overviewLoadedRef.current = true;
          setOverviewLoading(false);
          return true;
        }
      } else {
        console.error(
          "Appointments overview request failed:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Failed to fetch appointments overview:", error);
    }
    return false;
  }, [anchorDate, viewMode, listPage, search, statusFilter]);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | null = null;
    let retryAttempt = 0;
    const maxRetries = 8;

    const scheduleRetry = (load: () => void) => {
      if (cancelled || retryAttempt >= maxRetries) {
        if (!cancelled && !overviewLoadedRef.current) {
          setOverviewLoading(false);
        }
        return;
      }
      retryAttempt += 1;
      retryTimer = window.setTimeout(load, Math.min(250 * retryAttempt, 2000));
    };

    const load = async () => {
      if (cancelled) return;

      if (!getToken()) {
        scheduleRetry(load);
        return;
      }

      const ok = await fetchOverview();
      if (cancelled) return;

      if (ok) {
        retryAttempt = 0;
        return;
      }

      scheduleRetry(load);
    };

    if (!overviewLoadedRef.current) {
      setOverviewLoading(true);
    }
    load();

    const intervalId = window.setInterval(() => {
      retryAttempt = 0;
      load();
    }, 5000);
    const onFocus = () => {
      retryAttempt = 0;
      load();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchOverview]);

  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(searchInput);
      setListPage(1);
    }, 350);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput]);

  const closeAppointmentDetail = () => {
    setAppointmentDetailId(null);
    setSelectedAppointment(null);
    setShowCancelForm(false);
    setCancelReason("");
    setAppointmentDetailLoading(false);
    setAppointmentActionLoading(false);
  };

  const normalizeCalendarKey = (s: string) =>
    s.trim().toLowerCase().replace(/\s+/g, " ");

  const calendarIdLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const ref of data.calendarAppointments ?? []) {
      const time = normalizeCalendarKey(ref.appointmentTime);
      const name = normalizeCalendarKey(ref.patientName);
      map.set(`${ref.day}|${time}|${name}`, ref.id);
      map.set(`date:${ref.appointmentDate}|${time}|${name}`, ref.id);
    }
    return map;
  }, [data.calendarAppointments]);

  const resolveCalendarEventId = useCallback(
    (
      ev: CalendarEvent,
      opts?: { day?: number | null; date?: string }
    ): string | null => {
      if (ev.appointmentId) return ev.appointmentId;

      const timeKey = normalizeCalendarKey(ev.time || "");
      let nameKey = normalizeCalendarKey(ev.patientName || "");

      if (!nameKey && ev.label) {
        const parts = ev.label.split("·").map((p) => p.trim());
        if (parts.length >= 2) nameKey = normalizeCalendarKey(parts[1]);
      }

      if (opts?.date && timeKey && nameKey) {
        const byDate = calendarIdLookup.get(`date:${opts.date}|${timeKey}|${nameKey}`);
        if (byDate) return byDate;
      }

      if (opts?.day != null && timeKey && nameKey) {
        const byDay = calendarIdLookup.get(`${String(opts.day)}|${timeKey}|${nameKey}`);
        if (byDay) return byDay;
      }

      if (ev.label) {
        const parts = ev.label.split("·").map((p) => p.trim());
        if (parts.length >= 2) {
          const t = normalizeCalendarKey(parts[0]);
          const n = normalizeCalendarKey(parts[1]);
          if (opts?.day != null) {
            const hit = calendarIdLookup.get(`${String(opts.day)}|${t}|${n}`);
            if (hit) return hit;
          }
          if (opts?.date) {
            const hit = calendarIdLookup.get(`date:${opts.date}|${t}|${n}`);
            if (hit) return hit;
          }
        }
      }

      return null;
    },
    [calendarIdLookup]
  );

  const openAppointmentDetail = useCallback(async (id: string, options?: { showCancelForm?: boolean }) => {
    if (!getToken()) return;
    setAppointmentDetailId(id);
    setSelectedAppointment(null);
    setShowCancelForm(Boolean(options?.showCancelForm));
    setCancelReason("");
    setAppointmentDetailLoading(true);

    try {
      const response = await fetch(apiUrl(`/api/statistics/appointments/${id}`), {
        headers: authHeaders(),
      });
      if (response.ok) {
        const json = await response.json();
        if (json.data) setSelectedAppointment(json.data as AppointmentDetail);
      }
    } catch (error) {
      console.error("Failed to load appointment:", error);
    } finally {
      setAppointmentDetailLoading(false);
    }
  }, []);

  const handleCalendarEventClick = useCallback(
    (ev: CalendarEvent, opts?: { day?: number | null; date?: string }) => {
      const id = resolveCalendarEventId(ev, opts);
      if (id) {
        openAppointmentDetail(id);
        return;
      }
      console.warn("Could not open appointment for calendar event:", ev);
    },
    [resolveCalendarEventId, openAppointmentDetail]
  );

  const handleDeleteAppointment = (row: AppointmentTableRow) => {
    setDeleteTarget(row);
  };

  const confirmDeleteAppointment = async () => {
    if (!deleteTarget || deleteLoading) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(
        apiUrl(`/api/statistics/appointments/${deleteTarget.id}`),
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );
      const json = await response.json().catch(() => ({}));

      if (!response.ok) {
        window.alert(json.message || "Failed to delete appointment.");
        return;
      }

      if (appointmentDetailId === deleteTarget.id) {
        closeAppointmentDetail();
      }
      if (viewingPatientAppointmentId === deleteTarget.id) {
        closePatientDetail();
      }
      if (clinicalModal?.appointmentId === deleteTarget.id) {
        setClinicalModal(null);
      }

      setDeleteTarget(null);
      await fetchOverview();
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      window.alert("Could not delete appointment. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const closePatientDetail = () => {
    setViewingPatientAppointmentId(null);
    setSelectedPatient(null);
    setPatientDetailError(null);
    setPatientDetailLoading(false);
  };

  const fetchPatientDetailForAppointment = useCallback(async (appointmentId: string) => {
    if (!getToken()) {
      setPatientDetailError("Please sign in to view appointment details.");
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
        setPatientDetailError(json.message || "Failed to load appointment details.");
        setSelectedPatient(null);
        return null;
      }

      if (!json.data) {
        setPatientDetailError("Appointment data was not found.");
        setSelectedPatient(null);
        return null;
      }

      const patient = appointmentDetailToPatient(json.data as AppointmentDetail);
      setSelectedPatient(patient);
      setPatientHistoryByAppointment((prev) => ({
        ...prev,
        [appointmentId]: patient.historyEntries,
      }));
      return patient;
    } catch (error) {
      console.error("Failed to load patient appointment details:", error);
      setPatientDetailError("Network error while loading appointment details.");
      setSelectedPatient(null);
      return null;
    } finally {
      setPatientDetailLoading(false);
    }
  }, []);

  const handleViewPatient = (row: AppointmentTableRow) => {
    setViewingPatientAppointmentId(row.id);
    setSelectedPatient(null);
    void fetchPatientDetailForAppointment(row.id);
  };

  const handleAddCheckup = (row: AppointmentTableRow) => {
    setClinicalModal({
      mode: "create",
      appointmentId: row.id,
      patientName: row.name,
      patientId: row.patientId,
    });
  };

  const handleEditCheckup = (row: AppointmentTableRow) => {
    setClinicalModal({
      mode: "edit",
      appointmentId: row.id,
      patientName: row.name,
      patientId: row.patientId,
    });
  };

  const updateAppointmentStatus = async (
    id: string,
    status: string,
    cancellationReason?: string
  ) => {
    const normalized = status.toUpperCase() === "COMPLETED" ? "SEEN" : status.toUpperCase();
    const body: { status: string; cancellationReason?: string } = { status: normalized };
    if (normalized === "CANCELLED") {
      const reason = cancellationReason?.trim();
      if (!reason) {
        window.alert("Please provide a cancellation reason.");
        return false;
      }
      body.cancellationReason = reason;
    }

    try {
      const response = await fetch(apiUrl(`/api/statistics/appointments/${id}`), {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        window.alert(err.message || "Failed to update appointment.");
        return false;
      }

      const json = await response.json();
      const listItem = json.data?.listItem as AppointmentListItem | undefined;
      const detail = json.data?.detail as AppointmentDetail | undefined;

      if (detail) setSelectedAppointment(detail);

      if (normalized === "SEEN" && listItem) {
        setData((prev) =>
          applyAppointmentSeenLocally(prev, id, { ...listItem, status: "SEEN" })
        );
        return true;
      }

      await fetchOverview();
      return true;
    } catch (error) {
      console.error("Failed to update appointment:", error);
      return false;
    }
  };

  const handleSaveClinicalRecord = async (payload: ClinicalRecordSavePayload) => {
    if (!clinicalModal) return;
    const appointmentId = clinicalModal.appointmentId;
    const isCreate = clinicalModal.mode === "create";

    if (isCreate) {
      setData((prev) => {
        const fromUpcoming = prev.upcomingAppointments.find(
          (a) => a.id === appointmentId
        );
        if (!fromUpcoming) return prev;
        return applyAppointmentSeenLocally(prev, appointmentId, {
          ...fromUpcoming,
          status: "SEEN",
        });
      });
    }

    try {
      const response = await fetch(
        apiUrl(`/api/statistics/appointments/${appointmentId}/checkup`),
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            ...payload,
            ...overviewQueryPayload(),
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        window.alert(err.message || "Failed to save clinical record.");
        return;
      }

      const json = await response.json();
      const listItem = json.data?.listItem as AppointmentListItem | undefined;

      if (json.data?.overview) {
        setData((prev) => mergeOverviewLists(prev, json.data.overview));
      } else if (listItem && isCreate) {
        setData((prev) =>
          applyAppointmentSeenLocally(prev, appointmentId, {
            ...listItem,
            status: "SEEN",
          })
        );
      } else {
        await fetchOverview();
      }

      if (viewingPatientAppointmentId === appointmentId) {
        void fetchPatientDetailForAppointment(appointmentId);
      }

      setClinicalModal(null);
    } catch (error) {
      console.error("Failed to save clinical record:", error);
      window.alert("Could not save clinical record. Please try again.");
    }
  };

  const handleConfirmPending = async (id: string) => {
    setAppointmentActionLoading(true);
    const ok = await updateAppointmentStatus(id, "CONFIRMED");
    setAppointmentActionLoading(false);
    if (ok) {
      setModal("none");
      closeAppointmentDetail();
    }
  };

  const handleCancelPending = (id: string) => {
    setModal("none");
    openAppointmentDetail(id, { showCancelForm: true });
  };

  const handleConfirmFromDetail = async () => {
    if (!selectedAppointment) return;
    setAppointmentActionLoading(true);
    const ok = await updateAppointmentStatus(selectedAppointment.id, "CONFIRMED");
    setAppointmentActionLoading(false);
    if (ok) closeAppointmentDetail();
  };

  const handleCancelFromDetail = async () => {
    if (!selectedAppointment) return;
    setAppointmentActionLoading(true);
    const ok = await updateAppointmentStatus(
      selectedAppointment.id,
      "CANCELLED",
      cancelReason
    );
    setAppointmentActionLoading(false);
    if (ok) closeAppointmentDetail();
  };

  const handleBookAppointment = async () => {
    if (!addForm.name || !addForm.email || !addForm.phone || !addForm.specialty || !addForm.date || !addForm.time) {
      return;
    }
    setBooking(true);
    try {
      const response = await fetch(apiUrl("/api/statistics/appointments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: addForm.name,
          email: addForm.email,
          phone: addForm.phone,
          specialty: addForm.specialty,
          appointmentDate: addForm.date,
          appointmentTime: addForm.time,
          notes: addForm.notes,
          isNewPatient: true,
        }),
      });
      if (response.ok) {
        setModal("none");
        setAddForm({ name:"", email:"", phone:"", specialty:"", date:"", time:"", notes:"" });
        await fetchOverview();
      }
    } catch (error) {
      console.error("Failed to book appointment:", error);
    } finally {
      setBooking(false);
    }
  };

  const navigateDate = (direction: -1 | 1) => {
    setAnchorDate((prev) => shiftAnchorDate(prev, viewMode, direction));
  };

  const openDatePicker = () => {
    const picker = datePickerRef.current;
    if (!picker) return;
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
    } else {
      picker.click();
    }
  };

  const statCards = data.statCards;
  const pendingConfirmations = data.pendingConfirmations;
  const upcomingAppointments = data.upcomingAppointments;
  const patientsSeen = data.patientsSeen;
  const allAppointments = data.allAppointments;
  const { pagination } = data;
  const clientDateLabels = formatAppointmentDateLabels(anchorDate);
  const upcomingGroups = chunkIntoGroups(upcomingAppointments, 3);
  const seenGroups = chunkIntoGroups(patientsSeen, 3);
  const carouselEnabled = displayMode === "calendar";
  const upcomingCarousel = useAutoCarousel(
    upcomingGroups.length,
    4000,
    carouselEnabled
  );
  const seenCarousel = useAutoCarousel(
    seenGroups.length,
    4000,
    carouselEnabled
  );

  const currentMonth = data.dateLabels.month || clientDateLabels.month;
  const currentWeek  = data.dateLabels.week || clientDateLabels.week;
  const currentDay   = data.dateLabels.day || clientDateLabels.day;

  // Color tokens
  const card        = isDark ? "#c9a898" : "#f0f0f0";
  const cardBorder  = isDark?"border-[#753141]":"border-[#753141]";
  const cardInner   = isDark ? "#d0baa3" : "#FFFFFF";
  const text1       = isDark ? "#591727" : "#591727";
  const text2       = isDark ? "#591727" : "#591727";
  const pageBg      = isDark ? "#2A0D18" : "#FFFFFF";
  const inputBg     = isDark?"#c1a694":"#ffffff";
  const inputBorder = isDark?"#5C2A3A":"#D9C9A8";
  const tableBg     = isDark?"#c1a694":"#FDFAF4";
  const tableRowHover = isDark ? "#E5E7EB" : "#F3F4F6";

  const dateTop    = viewMode==="week"?"WEEK":viewMode==="day"?"TODAY":"MONTH";
  const dateBottom = viewMode==="month"?currentMonth:viewMode==="week"?currentWeek:currentDay;

  if (viewingPatientAppointmentId) {
    return (
      <PatientDetail
        patient={selectedPatient}
        loading={patientDetailLoading}
        error={patientDetailError}
        onRetry={() => fetchPatientDetailForAppointment(viewingPatientAppointmentId)}
        onBack={closePatientDetail}
        isDark={isDark}
        card={card}
        cardBorder={cardBorder}
        cardInner={cardInner}
        text1={text1}
        text2={text2}
        pageBg={pageBg}
        sectionLabel="APPOINTMENTS"
      />
    );
  }

  // ── Calendar renderers ────────────────────────────────────────────────────
  function renderMonthCalendar(){
    const { offset, daysInMonth, today, events } = data.monthCalendar;
    const cells:(number|null)[]=[...Array(offset).fill(null),...Array.from({length:daysInMonth},(_,i)=>i+1)];
    while(cells.length%7!==0)cells.push(null);
    const weeks:(number|null)[][]=[];
    for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
    return(
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="grid grid-cols-7 gap-px mb-1">
            {MONTH_DAYS.map(d=><div key={d} className="text-[11px] font-semibold text-center py-2" style={{color:text2}}>{d}</div>)}
          </div>
          <div className="flex flex-col gap-px">
            {weeks.map((week,wi)=>(
              <div key={wi} className="grid grid-cols-7 gap-px">
                {week.map((day,di)=>{
                  const dayEvents=day?(events[String(day)]||[]):[];
                  const isToday=day!==null&&today!==null&&day===today;
                  return(
                    <div key={di} className={`min-h-[70px] sm:min-h-[80px] p-1 sm:p-1.5 rounded-lg border transition-colors ${cardBorder}`}
                      style={{backgroundColor:day?cardInner:"transparent"}}>
                      {day&&(
                        <>
                          <div className={`text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-full mb-1 numeric-font`}
                            style={{backgroundColor:isToday?(isDark?"#8B1A2E":"#3D0A1F"):"transparent",color:isToday?"#F5ECD7":text1}}>
                            {day}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            {dayEvents.map((ev: CalendarEvent, ei)=>(
                              <button
                                key={ev.appointmentId || `${day}-${ei}-${ev.label}`}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCalendarEventClick(ev, { day: day ?? undefined });
                                }}
                                className={`text-left w-full cursor-pointer text-[10px] sm:text-[11px] px-1 py-0.5 rounded truncate ${eventColor(ev.color)} hover:opacity-90 hover:ring-1 hover:ring-[#591727]/40`}
                                title={`${ev.patientName || ""} — ${ev.status || ""}`}
                              >
                                {ev.label || `${ev.time} · ${ev.patientName}`}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderWeekCalendar(){
    const { days: weekDays, timeSlots: weekTimes, events: weekEvents } = data.weekCalendar;
    return(
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] gap-px mb-1">
            <div/>
            {weekDays.map(d=>(
              <div key={d.fullDate} className="text-center py-2 numeric-font">
                <div className="text-[11px]" style={{color:text2}}>{d.label}</div>
                <div className="text-base font-bold" style={{color:text1}}>{d.date}</div>
              </div>
            ))}
          </div>
          <div>
            {weekTimes.map(t=>(
              <div key={t} className="grid grid-cols-[50px_repeat(7,1fr)] sm:grid-cols-[60px_repeat(7,1fr)] gap-px min-h-[70px] numeric-font">
                <div className="text-[11px] pt-1 pr-2 text-right" style={{color:text2}}>{t}</div>
                {weekDays.map((wd,di)=>{
                  const evs=weekEvents.filter(e=>e.day===di&&e.gridSlot===t);
                  return(
                    <div key={di} className={`border-t ${cardBorder} p-1 flex flex-col gap-0.5`}>
                      {evs.map((ev: WeekCalendarEvent, ei)=>(
                        <button
                          key={ev.appointmentId || `${di}-${ei}-${ev.label}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCalendarEventClick(ev, { date: wd.fullDate });
                          }}
                          className={`text-left w-full cursor-pointer text-[10px] sm:text-[11px] px-1 py-0.5 rounded truncate ${eventColor(ev.color)} hover:opacity-90 hover:ring-1 hover:ring-[#591727]/40`}
                          title={`${ev.patientName || ""} — ${ev.status || ""}`}
                        >
                          {ev.label || `${ev.time} · ${ev.patientName}`}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderDayCalendar(){
    const { dayNumber, dayName, monthLabel, timeSlots, events: dayEvents, nextUp } = data.dayCalendar;
    return(
      /* On mobile stack vertically; on sm+ side-by-side */
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="text-center mb-4">
            <div className="inline-flex flex-col items-center justify-center w-14 h-14 rounded-full"
              style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>
              <span className="text-2xl font-bold text-white numeric-font">{dayNumber}</span>
            </div>
            <div className="text-lg font-bold mt-1" style={{color:text1}}>{dayName}</div>
            <div className="text-xs" style={{color:text2}}>{monthLabel}</div>
          </div>
          <div className="relative">
            {timeSlots.map(t=>{
              const evs=dayEvents.filter(e=>e.time===t);
              return(
                <div key={t} className="flex gap-3 min-h-[60px]">
                  <div className="w-14 sm:w-16 text-right text-[11px] pt-1 shrink-0" style={{color:text2}}>
                    <div className="numeric-font">{t.split(" ")[0]}</div><div className="numeric-font">{t.split(" ")[1]}</div>
                  </div>
                  <div className={`flex-1 border-t ${cardBorder} pt-1 flex flex-col gap-1`}>
                    {evs.map((ev: DayCalendarEvent, i)=>{
                      const c=eventColorDay(ev.color);
                      return(
                        <button
                          key={ev.appointmentId || `${i}-${ev.label}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCalendarEventClick(ev, { date: anchorDate });
                          }}
                          className="rounded-lg px-3 py-2 text-left w-full cursor-pointer hover:opacity-90 transition-opacity hover:ring-1 hover:ring-[#591727]/30"
                          style={{borderLeft:`3px solid ${c.bar}`,backgroundColor:isDark?"#4A2030":"#FDFAF4"}}
                          title={`${ev.patientName || ev.name || ""} — ${ev.status || ""}`}
                        >
                          <div className="text-[12px] font-semibold uppercase tracking-wide" style={{color:c.bar}}>{ev.label || `${ev.time} · ${ev.patientName}`}</div>
                          <div className="text-sm font-semibold" style={{color:text1}}>{ev.name || ev.patientName}</div>
                          <div className="text-[10px]" style={{color:text2}}>⏰ {ev.time || t}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Next Up panel — full width on mobile, fixed sidebar on sm+ */}
        <div className="w-full sm:w-56 shrink-0">
          <div className={`rounded-2xl p-4 border ${cardBorder}`} style={{backgroundColor:cardInner}}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold tracking-widest uppercase" style={{color:text2}}>NEXT UP</span>
              <span className="text-base">🔔</span>
            </div>
            {nextUp ? (
            <div className={`rounded-xl p-3 border ${cardBorder}`} style={{backgroundColor:card}}>
              <div className="text-[10px] font-bold" style={{color:text2}}>{nextUp.date}</div>
              <div className="text-sm font-bold my-0.5" style={{color:text1}}>{nextUp.name}</div>
              <div className="text-[11px] mb-2" style={{color:text2}}>{nextUp.detail}</div>
              <div className="flex gap-2">
                {nextUp.phone ? (
                  <a href={`tel:${nextUp.phone}`}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white text-center"
                    style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>Call</a>
                ) : (
                  <button type="button"
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{backgroundColor:isDark?"#8B1A2E":"#3D0A1F"}}>Call</button>
                )}
                <button type="button"
                  onClick={() => updateAppointmentStatus(nextUp.appointmentId, "CANCELLED")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border`}
                  style={{borderColor:isDark?"#5C2A3A":"#3D0A1F",color:text1}}>Cancel</button>
              </div>
            </div>
            ) : (
              <p className="text-xs italic" style={{color:text2}}>No upcoming appointments.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return(
    <div className="min-h-full transition-colors duration-300 overflow-x-hidden sm:pl-10" style={{marginTop:"40px"}}>

      {/* Modals */}
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
      {deleteTarget && (
        <DeleteAppointmentModal
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          text1={text1}
          text2={text2}
          pageBg={pageBg}
          row={deleteTarget}
          loading={deleteLoading}
          onConfirm={confirmDeleteAppointment}
          onClose={() => {
            if (!deleteLoading) setDeleteTarget(null);
          }}
        />
      )}
      {modal==="pending" && (
        <PendingModal
          isDark={isDark} card={card} cardBorder={cardBorder} cardInner={cardInner}
          text1={text1} text2={text2} pageBg={pageBg} inputBg={inputBg} inputBorder={inputBorder}
          pendingConfirmations={pendingConfirmations}
          onConfirm={handleConfirmPending}
          onCancel={handleCancelPending}
          onClose={()=>setModal("none")}
        />
      )}
      {appointmentDetailId && (
        <AppointmentDetailModal
          isDark={isDark}
          card={card}
          cardBorder={cardBorder}
          text1={text1}
          text2={text2}
          pageBg={pageBg}
          inputBg={inputBg}
          inputBorder={inputBorder}
          appointment={
            selectedAppointment ?? {
              id: appointmentDetailId,
              patientName: "",
              email: "",
              phone: "",
              specialty: "",
              appointmentDateLabel: "",
              appointmentTime: "",
              notes: "",
              status: "PENDING",
              cancellationReason: "",
              isNewPatient: false,
            }
          }
          loading={appointmentDetailLoading}
          actionLoading={appointmentActionLoading}
          showCancelForm={showCancelForm}
          cancelReason={cancelReason}
          onCancelReasonChange={setCancelReason}
          onShowCancelForm={() => setShowCancelForm(true)}
          onHideCancelForm={() => {
            setShowCancelForm(false);
            setCancelReason("");
          }}
          onConfirm={handleConfirmFromDetail}
          onCancelSubmit={handleCancelFromDetail}
          onClose={closeAppointmentDetail}
        />
      )}
      {modal==="addPatient" && (
        <AddPatientModal
          isDark={isDark} card={card} cardBorder={cardBorder}
          text1={text1} text2={text2} pageBg={pageBg} inputBg={inputBg} inputBorder={inputBorder}
          addForm={addForm} setAddForm={setAddForm}
          booking={booking}
          onBook={handleBookAppointment}
          onClose={()=>{setModal("none");setAddForm({name:"",email:"",phone:"",specialty:"",date:"",time:"",notes:""}); }}
        />
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-wide" style={{ color: isDark ? "#ffffff":"#591727"}}>APPOINTMENTS</h1>
        <div className="flex flex-col mt-2 sm:flex-row gap-4 pr-2 sm:gap-8 w-full sm:w-auto">
          <button onClick={()=>setModal("pending")}
            className={`relative w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${isDark?"border-[#FFFFFF] text-white hover:bg-[#c9a898] hover:text-[#3D0A1F]":"border-[#711C31] text-[#711C31] hover:bg-[#711C31] hover:text-[#F5ECD7]"}`}>
            Pending Confirmations
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center text-white bg-[#8B1A2E] border-2 border-white sm:border-none">
              {pendingConfirmations.length}
            </span>
          </button>
          <button
            onClick={() => {
              const today = getTodayAnchorDate();
              setAddForm((prev) => ({
                ...prev,
                date: prev.date && prev.date >= today ? prev.date : "",
              }));
              setModal("addPatient");
            }}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-colors ${isDark?"border-[#FFFFFF] text-white hover:bg-[#c9a898] hover:text-[#3D0A1F]":"border-[#711C31] bg-[#591727] text-white hover:bg-[#711C31]"}`}>
            + Add Patient
          </button>
        </div>
      </div>

      {overviewLoading && (
        <p className="text-sm text-center mb-4 italic" style={{ color: text2 }}>
          Loading appointments...
        </p>
      )}

      {/* Stat Cards — 1 col on mobile, 2 on medium, 4 on sm+ */}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(c=>(
          <div key={c.label} className={`relative rounded-2xl p-5 border ${cardBorder} transition-colors duration-300`}
            style={{backgroundColor:isDark?"#c9a898":"#D3D3D3"}}>
            <p className="mb-3 text-sm" style={{color:text2}}>{c.label}</p>
            <div className="flex items-end justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-bold numeric-font" style={{color:text1, fontFamily: "var(--font-cinzel)"}}>{c.value}</span>
              {c.badge&&<span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-[#711C314D] text-[#591727] whitespace-nowrap">{c.badge}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        {/* Date indicator */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${cardBorder} w-full sm:w-auto`} style={{backgroundColor:card}}>
          <button
            type="button"
            onClick={openDatePicker}
            className="shrink-0"
            aria-label="Select date"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#711C31" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
          <input
            ref={datePickerRef}
            type="date"
            value={anchorDate}
            onChange={(e) => {
              if (e.target.value) {
                setAnchorDate(e.target.value);
                setViewMode("month");
              }
            }}
            className="absolute opacity-0 pointer-events-none w-0 h-0"
            aria-hidden="true"
            tabIndex={-1}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold tracking-widest uppercase" style={{color:text2}}>{dateTop}</div>
            <div className="text-xs sm:text-sm font-semibold truncate" style={{color:text1}}>{dateBottom}</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button type="button" onClick={()=>navigateDate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-black/5" style={{color:text2}}>‹</button>
            <button type="button" onClick={()=>navigateDate(1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent hover:bg-black/5" style={{color:text2}}>›</button>
          </div>
        </div>

        {/* View controls */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Display mode icons */}
          <div className={`flex p-1 rounded-xl border ${cardBorder}`} style={{backgroundColor:card}}>
            <button
              onClick={() => setDisplayMode("calendar")}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${displayMode==="calendar"?(isDark?"bg-[#8B1A2E] text-[#F5ECD7]":"bg-[#3D0A1F] text-[#F5ECD7]"):""}`}
              style={{ color: displayMode==="calendar"?"#F5ECD7":text2 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
            <button
              onClick={() => setDisplayMode("list")}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${displayMode==="list"?(isDark?"bg-[#8B1A2E] text-[#F5ECD7]":"bg-[#3D0A1F] text-[#F5ECD7]"):""}`}
              style={{ color: displayMode==="list"?"#F5ECD7":text2 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="8" y1="9" x2="12" y2="9" />
              </svg>
            </button>
          </div>
          {/* Month/Week/Day toggle */}
          <div className={`flex p-1 rounded-xl border ${cardBorder}`} style={{backgroundColor:card}}>
            {(["month","week","day"] as ViewMode[]).map(v=>(
              <button key={v} onClick={()=>setViewMode(v)}
                className={`px-4 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all ${viewMode===v?(isDark?"bg-[#8B1A2E] text-[#F5ECD7]":"bg-[#3D0A1F] text-[#F5ECD7]"):""}`}
                style={{color:viewMode===v?"#F5ECD7":text2}}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {displayMode==="calendar"?(
        <>
          <div className={`rounded-2xl p-4 sm:p-6 border ${cardBorder} mb-6 transition-colors duration-300 overflow-x-hidden min-w-0`} style={{backgroundColor:card}}>
            {viewMode==="month"&&renderMonthCalendar()}
            {viewMode==="week"&&renderWeekCalendar()}
            {viewMode==="day"&&renderDayCalendar()}
          </div>
          {/* Bottom cards — stacked on mobile, 2-cols on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Upcoming */}
            <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <h3 className="text-base font-semibold mb-3" style={{color:text1}}>
                Upcoming Appointments ({viewMode==="month"?"This Month":viewMode==="week"?"This week":"Today"})
              </h3>
              <div
                className="overflow-hidden min-h-[208px] w-full"
                onMouseEnter={upcomingCarousel.onMouseEnter}
                onMouseLeave={upcomingCarousel.onMouseLeave}
              >
                {upcomingAppointments.length === 0 ? (
                  <p className="text-center py-4 text-sm italic" style={{color:text2}}>No upcoming appointments.</p>
                ) : (
                  <div style={getCarouselTrackStyle(upcomingCarousel.slide, upcomingGroups.length)}>
                    {upcomingGroups.map((group, gi) => (
                      <div key={gi} className="flex flex-col gap-2" style={getCarouselSlideStyle(upcomingGroups.length)}>
                        {group.map((a,i)=>(
                          <div
                            key={a.id ?? `${gi}-${i}`}
                            role={a.id ? "button" : undefined}
                            tabIndex={a.id ? 0 : undefined}
                            onClick={() => a.id && openAppointmentDetail(a.id)}
                            onKeyDown={(e) => {
                              if (a.id && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                openAppointmentDetail(a.id);
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border gap-2 ${cardBorder} ${a.id ? "cursor-pointer hover:opacity-90" : ""}`}
                            style={{backgroundColor:cardInner}}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-center min-w-[36px] shrink-0">
                                <div className="text-sm font-bold numeric-font" style={{color:text1}}>{a.time}</div>
                                <div className="text-[10px]" style={{color:text2}}>{a.period}</div>
                              </div>
                              <div className="w-px h-8 shrink-0" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate" style={{color:text1}}>{a.name}</div>
                                <div className="text-[11px] truncate" style={{color:text2}}>{a.type}</div>
                              </div>
                            </div>
                            <span className={`${statusStyle(a.status)} shrink-0`}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-1.5 mt-3">
                {upcomingGroups.length <= 1 ? (
                  <div className="w-5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#D4A574":"#3D0A1F"}}/>
                ) : (
                  upcomingGroups.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => upcomingCarousel.setSlide(idx)}
                      className={`${upcomingCarousel.slide === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"} rounded-full transition-all duration-300`}
                      style={{backgroundColor: upcomingCarousel.slide === idx ? (isDark?"#D4A574":"#3D0A1F") : (isDark?"#5C2A3A":"#D4B896")}}
                      aria-label={`Show upcoming group ${idx + 1}`}
                    />
                  ))
                )}
              </div>
            </div>
            {/* Patients seen */}
            <div className={`rounded-2xl p-4 sm:p-5 border ${cardBorder}`} style={{backgroundColor:card}}>
              <h3 className="text-base font-semibold mb-3" style={{color:text1}}>
                Patients seen ({viewMode==="month"?"This Month":viewMode==="week"?"This week":"Today"})
              </h3>
              <div
                className="overflow-hidden min-h-[208px] w-full"
                onMouseEnter={seenCarousel.onMouseEnter}
                onMouseLeave={seenCarousel.onMouseLeave}
              >
                {patientsSeen.length === 0 ? (
                  <p className="text-center py-4 text-sm italic" style={{color:text2}}>No patients seen yet.</p>
                ) : (
                  <div style={getCarouselTrackStyle(seenCarousel.slide, seenGroups.length)}>
                    {seenGroups.map((group, gi) => (
                      <div key={gi} className="flex flex-col gap-2" style={getCarouselSlideStyle(seenGroups.length)}>
                        {group.map((a,i)=>(
                          <div
                            key={a.id ?? `${gi}-${i}`}
                            role={a.id ? "button" : undefined}
                            tabIndex={a.id ? 0 : undefined}
                            onClick={() => a.id && openAppointmentDetail(a.id)}
                            onKeyDown={(e) => {
                              if (a.id && (e.key === "Enter" || e.key === " ")) {
                                e.preventDefault();
                                openAppointmentDetail(a.id);
                              }
                            }}
                            className={`flex items-center justify-between p-3 rounded-xl border gap-2 ${cardBorder} ${a.id ? "cursor-pointer hover:opacity-90" : ""}`}
                            style={{backgroundColor:cardInner}}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="text-center min-w-[36px] shrink-0">
                                <div className="text-sm font-bold" style={{color:text1}}>{a.time}</div>
                                <div className="text-[10px]" style={{color:text2}}>{a.period}</div>
                              </div>
                              <div className="w-px h-8 shrink-0" style={{backgroundColor:isDark?"#5C2A3A":"#D4B896"}}/>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate" style={{color:text1}}>{a.name}</div>
                                <div className="text-[11px] truncate" style={{color:text2}}>{a.type}</div>
                              </div>
                            </div>
                            <span className={`${statusStyle(a.status)} shrink-0`}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-center gap-1.5 mt-3">
                {seenGroups.length <= 1 ? (
                  <div className="w-5 h-1.5 rounded-full" style={{backgroundColor:isDark?"#D4A574":"#3D0A1F"}}/>
                ) : (
                  seenGroups.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => seenCarousel.setSlide(idx)}
                      className={`${seenCarousel.slide === idx ? "w-5 h-1.5" : "w-1.5 h-1.5"} rounded-full transition-all duration-300`}
                      style={{backgroundColor: seenCarousel.slide === idx ? (isDark?"#D4A574":"#3D0A1F") : (isDark?"#5C2A3A":"#D4B896")}}
                      aria-label={`Show seen group ${idx + 1}`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      ):(
        /* List View — table scrolls horizontally on mobile */
        <div className={`rounded-2xl border ${cardBorder} overflow-hidden`} style={{backgroundColor:tableBg}}>
          {/* Search/filter bar — stacks on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4 border-b" style={{borderColor:isDark?"#5C2A3A":"#D9C9A8"}}>
            <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border"
              style={{backgroundColor:inputBg,borderColor:inputBorder}}>
              <span style={{color:text2}}>🔍</span>
              <input type="text" placeholder="Search by name, ID or phone..."
                value={searchInput}
                onChange={(e)=>setSearchInput(e.target.value)}
                className="flex-1 text-sm bg-transparent outline-none" style={{color:text1}}/>
            </div>
            <div className="flex gap-2">
              <select value={statusFilter}
                onChange={(e)=>{ setStatusFilter(e.target.value); setListPage(1); }}
                className="flex-1 sm:flex-none px-3 py-2 rounded-xl border text-sm outline-none"
                style={{backgroundColor:inputBg,borderColor:inputBorder,color:text2}}>
                <option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="SEEN">Seen</option><option value="CANCELLED">Cancelled</option>
              </select>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm"
                style={{backgroundColor:inputBg,borderColor:inputBorder,color:text2}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="hidden sm:inline">Last Visit</span>
              </button>
            </div>
          </div>

          {/* Table — fixed layout so actions stay visible */}
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
                <tr style={{borderBottom:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}>
                  {["Patient Name","Email & Phone","Spécialités","Last Visit","Next Appointment","Status","Actions"].map(h=>(
                    <th key={h} className={`px-2 py-2.5 text-[11px] sm:text-[13px] font-semibold ${h==="Actions"?"text-center":"text-left"}`} style={{color:text2}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allAppointments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm italic" style={{color:text2}}>
                      No appointments found.
                    </td>
                  </tr>
                )}
                {allAppointments.map((row)=>(
                  <tr
                    key={row.id}
                    className="transition-colors cursor-pointer"
                    style={{borderBottom:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}
                    onClick={() => openAppointmentDetail(row.id)}
                    onMouseEnter={e=>(e.currentTarget.style.backgroundColor=tableRowHover)}
                    onMouseLeave={e=>(e.currentTarget.style.backgroundColor="transparent")}
                  >
                    <td className="px-2 py-2.5 align-top">
                      <div className="font-semibold truncate" style={{color:text1}} title={row.name}>{row.name}</div>
                      <div className="text-[11px] numeric-font truncate" style={{color:text2}} title={row.patientId}>ID: {row.patientId}</div>
                    </td>
                    <td className="px-2 py-2.5 align-top">
                      <div className="truncate text-[11px]" style={{color:text2}} title={row.email}>{row.email}</div>
                      <div className="truncate text-[11px]" style={{color:text2}} title={row.phone}>{row.phone}</div>
                    </td>
                    <td className="px-2 py-2.5 align-top"><span className="text-[11px] line-clamp-2" style={{color:text2}} title={row.specialty}>{row.specialty}</span></td>
                    <td className="px-2 py-2.5 align-top"><span className="text-[11px] truncate block" style={{color:text2}} title={row.lastVisit}>{row.lastVisit}</span></td>
                    <td className="px-2 py-2.5 align-top">
                      <div className="flex items-center gap-1 min-w-0">
                        <svg className="shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#711C31" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-[11px] truncate" style={{color:isDark?"#711C31":"#7A3048"}} title={row.nextAppt}>{row.nextAppt}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 align-top"><span className={statusStyle(row.status)}>{row.status}</span></td>
                    <td className="px-2 py-2.5 align-middle text-center">
                      <PatientListActions
                        variant="appointments"
                        row={row}
                        text2={text2}
                        onDelete={(e) => {
                          e.stopPropagation();
                          handleDeleteAppointment(row);
                        }}
                        onView={(e) => {
                          e.stopPropagation();
                          handleViewPatient(row);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-3" style={{borderTop:`1px solid ${isDark?"#5C2A3A":"#D9C9A8"}`}}>
            <span className="text-xs" style={{color:text2}}>
              {pagination.total === 0
                ? "Showing 0 results"
                : `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} results`}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" disabled={pagination.page <= 1}
                onClick={()=>setListPage((p)=>Math.max(1, p - 1))}
                className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40" style={{color:text2}}>‹</button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button key={pageNum} type="button" onClick={()=>setListPage(pageNum)}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                    style={{backgroundColor:pageNum===pagination.page?(isDark?"#8B1A2E":"#3D0A1F"):"transparent",color:pageNum===pagination.page?"#F5ECD7":text2}}>
                    {pageNum}
                  </button>
                );
              })}
              {pagination.totalPages > 5 && pagination.page < pagination.totalPages - 2 && (
                <>
                  <span className="text-xs px-1" style={{color:text2}}>...</span>
                  <button type="button" onClick={()=>setListPage(pagination.totalPages)}
                    className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{color:text2}}>
                    {pagination.totalPages}
                  </button>
                </>
              )}
              <button type="button" disabled={pagination.page >= pagination.totalPages}
                onClick={()=>setListPage((p)=>Math.min(pagination.totalPages, p + 1))}
                className="w-7 h-7 rounded flex items-center justify-center text-xs disabled:opacity-40" style={{color:text2}}>›</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


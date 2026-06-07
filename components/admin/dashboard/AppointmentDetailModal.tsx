"use client";

import type { AppointmentDetail } from "@/utils/appointmentsData";

function statusStyle(status: string) {
  switch (status) {
    case "CONFIRMED":
      return "text-[#711c31] border border-[#C94A3A] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
    case "PENDING":
      return "text-[#753141] border border-[#D3D3D3] text-[10px] bg-[#d3d3d3] font-bold px-2 py-0.5 rounded tracking-wide";
    case "CANCELLED":
      return "text-[#C94A3A] border border-[#C94A3A] text-[10px] bg-[#bfafaa] font-bold px-2 py-0.5 rounded tracking-wide";
    case "SEEN":
      return "text-[#ffffff] border border-[#591727] text-[10px] bg-[#591727] font-bold px-2 py-0.5 rounded tracking-wide";
    case "NEW":
      return "text-[#C94A3A] border border-[#C94A3A] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide";
    default:
      return "";
  }
}

type AppointmentDetailModalProps = {
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
  pageBg: string;
  appointment: AppointmentDetail | null;
  loading: boolean;
  onClose: () => void;
};

export function AppointmentDetailModal({
  isDark,
  card,
  cardBorder,
  text1,
  text2,
  pageBg,
  appointment,
  loading,
  onClose,
}: AppointmentDetailModalProps) {
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

        {loading || !appointment ? (
          <p className="text-sm py-8 text-center" style={{ color: text2 }}>
            {loading ? "Loading appointment..." : "Appointment not found."}
          </p>
        ) : (
          <>
            <div
              className={`rounded-2xl border p-4 sm:p-5 ${cardBorder} flex flex-col gap-3`}
              style={{ backgroundColor: card }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>
                  Patient
                </p>
                <p className="text-base font-semibold" style={{ color: text1 }}>
                  {appointment.patientName}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>
                    Email
                  </p>
                  <p className="text-sm break-all" style={{ color: text1 }}>
                    {appointment.email}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>
                    Phone
                  </p>
                  <p className="text-sm" style={{ color: text1 }}>
                    {appointment.phone}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>
                  Speciality
                </p>
                <p className="text-sm" style={{ color: text1 }}>
                  {appointment.specialty}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>
                    Date
                  </p>
                  <p className="text-sm" style={{ color: text1 }}>
                    {appointment.appointmentDateLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>
                    Time
                  </p>
                  <p className="text-sm" style={{ color: text1 }}>
                    {appointment.appointmentTime}
                  </p>
                </div>
              </div>
              {appointment.notes ? (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: text2 }}>
                    Notes
                  </p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: text1 }}>
                    {appointment.notes}
                  </p>
                </div>
              ) : null}
            </div>

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
            </div>
          </>
        )}
      </div>
    </div>
  );
}

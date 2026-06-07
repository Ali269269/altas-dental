"use client";

import type { StaffMember } from "@/utils/dashboardData";

type AllStaffModalProps = {
  isDark: boolean;
  card: string;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  pageBg: string;
  staff: StaffMember[];
  onClose: () => void;
};

export function AllStaffModal({
  isDark,
  card,
  cardBorder,
  cardInner,
  text1,
  text2,
  pageBg,
  staff,
  onClose,
}: AllStaffModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 ${cardBorder}`}
        style={{ backgroundColor: pageBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold" style={{ color: isDark ? "#ffffff" : "#591727" }}>
              All Staff
            </h2>
            <p className="text-sm mt-0.5" style={{ color: text2 }}>
              Doctors and clinical team productivity
            </p>
          </div>
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

        <div
          className="hidden sm:grid grid-cols-[1fr_120px_160px] px-3 py-2 rounded-lg mb-2 text-[10px] font-semibold tracking-wider uppercase"
          style={{ backgroundColor: cardInner, color: text2 }}
        >
          <span>Staff</span>
          <span className="text-center">Patients Seen</span>
          <span className="text-center">Avg. Procedure Time</span>
        </div>

        <div className="flex flex-col gap-2">
          {staff.length === 0 ? (
            <p className="text-center py-10 italic text-sm" style={{ color: text2 }}>
              No staff data available yet.
            </p>
          ) : (
            staff.map((member) => (
              <div
                key={member.name}
                className={`flex flex-col sm:grid sm:grid-cols-[1fr_120px_160px] items-start sm:items-center px-3 py-3 rounded-xl border gap-2 sm:gap-0 ${cardBorder}`}
                style={{ backgroundColor: card }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0"
                    style={{
                      backgroundColor: isDark ? "#6B2A40" : "#8B5060",
                      color: "#F5ECD7",
                    }}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: text1 }}>
                      {member.name}
                    </div>
                    <div className="text-[11px]" style={{ color: text2 }}>
                      {member.role}
                    </div>
                  </div>
                </div>
                <div className="flex sm:contents gap-4 pl-12 sm:pl-0 text-sm">
                  <div className="sm:text-center">
                    <span className="sm:hidden text-[10px] font-semibold uppercase mr-1" style={{ color: text2 }}>
                      Seen:
                    </span>
                    <span className="font-semibold numeric-font" style={{ color: "var(--font-cinzel)" }}>
                      {member.seen}
                    </span>
                  </div>
                  <div className="sm:text-center">
                    <span className="sm:hidden text-[10px] font-semibold uppercase mr-1" style={{ color: text2 }}>
                      Avg:
                    </span>
                    <span style={{ color: "var(--font-cinzel)" }}>{member.avg}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import type { PatientTableRow } from "@/utils/patientsData";
import { apiUrl } from "@/utils/api";

export type PatientEmailType = "reminder" | "follow_up" | "treatment_summary";

const EMAIL_OPTIONS: { id: PatientEmailType; label: string; description: string }[] = [
  {
    id: "reminder",
    label: "Reminder Email",
    description: "Remind the patient of their upcoming visit date and time.",
  },
  {
    id: "follow_up",
    label: "You Need a Follow-Up",
    description: "Send follow-up guidance from the clinical record.",
  },
  {
    id: "treatment_summary",
    label: "Clinical Notes Summary",
    description: "Send appointment and clinical record summary to the patient.",
  },
];

export function PatientEmailModal({
  row,
  isDark,
  card,
  cardBorder,
  text1,
  text2,
  pageBg,
  getAuthHeaders,
  onClose,
}: {
  row: PatientTableRow;
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
  pageBg: string;
  getAuthHeaders: () => HeadersInit;
  onClose: () => void;
}) {
  const [emailType, setEmailType] = useState<PatientEmailType>("reminder");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setFeedback(null);
    try {
      const response = await fetch(
        apiUrl(`/api/statistics/appointments/${row.id}/email`),
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ type: emailType }),
        }
      );
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        setFeedback(json.message || "Failed to send email.");
        return;
      }
      setFeedback(json.message || "Email sent successfully.");
      setTimeout(() => onClose(), 1200);
    } catch {
      setFeedback("Network error while sending email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={sending ? undefined : onClose} />
      <div
        className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 ${cardBorder}`}
        style={{ backgroundColor: pageBg }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-1" style={{ color: isDark ? "#ffffff" : "#591727" }}>
          Email patient
        </h2>
        <p className="text-sm mb-4" style={{ color: text2 }}>
          Send to <strong style={{ color: text1 }}>{row.email}</strong>
        </p>
        <div className={`rounded-xl border p-3 mb-4 text-sm ${cardBorder}`} style={{ backgroundColor: card }}>
          <p style={{ color: text1 }}>{row.name}</p>
          <p className="mt-1" style={{ color: text2 }}>
            {row.nextAppt}
          </p>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {EMAIL_OPTIONS.map((opt) => (
            <label
              key={opt.id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer ${cardBorder}`}
              style={{
                backgroundColor: emailType === opt.id ? (isDark ? "#d0baa3" : "#FDFAF4") : card,
              }}
            >
              <input
                type="radio"
                name="emailType"
                checked={emailType === opt.id}
                onChange={() => setEmailType(opt.id)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-semibold" style={{ color: text1 }}>
                  {opt.label}
                </span>
                <span className="block text-xs mt-0.5" style={{ color: text2 }}>
                  {opt.description}
                </span>
              </span>
            </label>
          ))}
        </div>
        {feedback && (
          <p className="text-xs mb-3 leading-snug" style={{ color: text2 }}>
            {feedback}
          </p>
        )}
        <div className="flex flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-60"
            style={{ borderColor: isDark ? "#5C2A3A" : "#3D0A1F", color: text1 }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={sending}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: "#8B1A2E" }}
          >
            {sending ? "Sending..." : "Send email"}
          </button>
        </div>
      </div>
    </div>
  );
}

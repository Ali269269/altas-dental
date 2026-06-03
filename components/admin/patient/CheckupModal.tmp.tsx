"use client";

import { useState } from "react";
import type { Patient } from "@/types/patient";

export function CheckupModal({
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

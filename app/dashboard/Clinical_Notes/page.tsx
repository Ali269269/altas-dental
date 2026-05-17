"use client";

import { useState, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProcedureStep {
  id: string;
  text: string;
}

interface DiagnosticTag {
  id: string;
  label: string;
}

interface ScanFile {
  id: string;
  url: string;
  name: string;
}

// ── Patient options ───────────────────────────────────────────────────────────
const PATIENTS = [
  { id: "#PV-4492", name: "Eleanor Vance" },
  { id: "#PV-5723", name: "Theodore Finch" },
  { id: "#PV-2684", name: "Dorian Gray" },
  { id: "#PV-5839", name: "Holly Golightly" },
  { id: "#PV-7510", name: "Elizabeth Bennet" },
  { id: "#PV-8921", name: "Fitzwilliam Darcy" },
  { id: "#PV-9864", name: "Sherlock Holmes" },
  { id: "#PV-7549", name: "Dr. John Watson" },
];

const POST_OP_OPTIONS = [
  "Avoid hot liquids for 24 hours",
  "Prescribed Ibuprofen 600mg tid",
  "Soft diet recommended",
];

const DEFAULT_TAGS: DiagnosticTag[] = [
  { id: "1", label: "CARIES SUSPECTED" },
  { id: "2", label: "HIGH SENSITIVITY" },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function ClinicalNotesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // ── Color tokens (matching Appointment page exactly) ──────────────────────
  const card        = isDark ? "#c9a898" : "#EDE0C4";
  const cardBorder  = isDark ? "border-[#5C2A3A]" : "border-[#D9C9A8]";
  const cardInner   = isDark ? "#d0baa3" : "#E4D5B8";
  const text1       = isDark ? "#591727" : "#591727";
  const text2       = isDark ? "#591727" : "#7A6040";
  const pageBg      = isDark ? "#2A0D18" : "#ffe9bf";
  const inputBg     = isDark ? "#c1a694" : "#ffffff";
  const inputBorder = isDark ? "#5C2A3A" : "#D9C9A8";

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedPatient, setSelectedPatient] = useState("");
  const [complaint,       setComplaint]       = useState("");
  const [clinicalObs,     setClinicalObs]     = useState("");
  const [primaryDiag,     setPrimaryDiag]     = useState("");
  const [diagTags,        setDiagTags]        = useState<DiagnosticTag[]>(DEFAULT_TAGS);
  const [newTagInput,     setNewTagInput]     = useState(false);
  const [newTagText,      setNewTagText]      = useState("");
  const [procedures,      setProcedures]      = useState<ProcedureStep[]>([
    { id: "1", text: "Local anesthesia: 2% Lidocaine w/ 1:100k epi" },
    { id: "2", text: "Composite Restoration · Tooth #14 (MOD)" },
  ]);
  const [scans,           setScans]           = useState<ScanFile[]>([
    { id: "1", url: "", name: "X-Ray-001.png" },
    { id: "2", url: "", name: "X-Ray-002.png" },
  ]);
  const [postOpChecked,   setPostOpChecked]   = useState<Record<string, boolean>>({});
  const [additionalPostOp, setAdditionalPostOp] = useState("");
  const [additionalNotes,  setAdditionalNotes]  = useState("");
  const [saved,           setSaved]           = useState(false);

  const scanInputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "2-digit", year: "numeric",
  });
  const subtitle = `${today} · General Examination & Consultation`;

  function addProcedureStep() {
    const id = Date.now().toString();
    setProcedures(p => [...p, { id, text: "" }]);
  }

  function updateProcedure(id: string, text: string) {
    setProcedures(p => p.map(s => s.id === id ? { ...s, text } : s));
  }

  function deleteProcedure(id: string) {
    setProcedures(p => p.filter(s => s.id !== id));
  }

  function addTag() {
    if (newTagText.trim()) {
      setDiagTags(t => [...t, { id: Date.now().toString(), label: newTagText.trim().toUpperCase() }]);
      setNewTagText("");
      setNewTagInput(false);
    }
  }

  function removeTag(id: string) {
    setDiagTags(t => t.filter(tag => tag.id !== id));
  }

  function handleScanUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newScans: ScanFile[] = files.map(f => ({
      id: Date.now().toString() + f.name,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setScans(s => [...s, ...newScans]);
  }

  function removeScam(id: string) {
    setScans(s => s.filter(sc => sc.id !== id));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleDiscard() {
    setSelectedPatient("");
    setComplaint("");
    setClinicalObs("");
    setPrimaryDiag("");
    setDiagTags(DEFAULT_TAGS);
    setProcedures([
      { id: "1", text: "Local anesthesia: 2% Lidocaine w/ 1:100k epi" },
      { id: "2", text: "Composite Restoration · Tooth #14 (MOD)" },
    ]);
    setScans([{ id: "1", url: "", name: "X-Ray-001.png" }, { id: "2", url: "", name: "X-Ray-002.png" }]);
    setPostOpChecked({});
    setAdditionalPostOp("");
    setAdditionalNotes("");
  }

  // ── Section label style ───────────────────────────────────────────────────
  const sectionLabel = "text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 mb-3";

  // ── Shared input style ────────────────────────────────────────────────────
  const sharedInput: React.CSSProperties = {
    backgroundColor: inputBg,
    borderColor: inputBorder,
    color: text1,
  };

  const sharedTextarea = `w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none transition-colors`;

  return (
    <div
      className="min-h-full ml-10 transition-colors duration-300"
      style={{ marginTop: "40px" }}
    >
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-wide" style={{ color: isDark ? "#ffffff" : "#591727" }}>
            Clinical Notes
          </h1>
          <p className="text-sm mt-1" style={{ color: text2 }}>{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDiscard}
            className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              isDark
                ? "border-[#5C2A3A] text-[#591727] hover:bg-[#5C2A3A]"
                : "border-[#D9C9A8] text-[#591727] hover:bg-[#EDE0C4]"
            }`}
            style={{ backgroundColor: isDark ? "#c9a898" : "#EDE0C4" }}
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: saved ? "#3DAA7A" : (isDark ? "#8B1A2E" : "#591727") }}
          >
            {saved ? "✓ Saved!" : "Save"}
          </button>
        </div>
      </div>

      {/* ── Main Two-Column Grid ──────────────────────────────── */}
      <div className="grid grid-cols-[1fr_320px] gap-5">

        {/* ── LEFT COLUMN ─────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* SELECT PATIENT */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>👥</span> SELECT PATIENT
            </p>
            <div className="relative">
              <select
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border appearance-none"
                style={{ ...sharedInput, color: selectedPatient ? text1 : text2 }}
              >
                <option value="">Select Name</option>
                {PATIENTS.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — {p.id}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: text2 }}>▾</div>
            </div>
          </div>

          {/* PATIENT CHIEF COMPLAINT */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>💬</span> PATIENT CHIEF COMPLAINT (SUBJECTIVE)
            </p>
            <textarea
              value={complaint}
              onChange={e => setComplaint(e.target.value)}
              placeholder="Describe the patient's concerns, pain level, and duration..."
              rows={5}
              className={sharedTextarea}
              style={sharedInput}
            />
          </div>

          {/* CLINICAL OBSERVATIONS */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>👁</span> CLINICAL OBSERVATIONS
            </p>
            <textarea
              value={clinicalObs}
              onChange={e => setClinicalObs(e.target.value)}
              placeholder="Record intraoral findings, gingival health, tooth mobility, and soft tissue examination..."
              rows={5}
              className={sharedTextarea}
              style={sharedInput}
            />
          </div>

          {/* DIAGNOSTICS */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>📋</span> DIAGNOSTICS
            </p>
            <input
              type="text"
              value={primaryDiag}
              onChange={e => setPrimaryDiag(e.target.value)}
              placeholder="Primary diagnosis (e.g., Localized Stage II Periodontitis)"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border mb-3"
              style={sharedInput}
            />
            {/* Tags row */}
            <div className="flex flex-wrap gap-2 items-center">
              {diagTags.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border cursor-pointer group"
                  style={{
                    borderColor: isDark ? "#C9922A" : "#C9922A",
                    color: "#C9922A",
                    backgroundColor: "transparent",
                  }}
                >
                  {tag.label}
                  <button
                    onClick={() => removeTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-xs leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* Add Tag input */}
              {newTagInput ? (
                <input
                  autoFocus
                  type="text"
                  value={newTagText}
                  onChange={e => setNewTagText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTag(); if (e.key === "Escape") { setNewTagInput(false); setNewTagText(""); } }}
                  onBlur={addTag}
                  placeholder="Tag name..."
                  className="px-3 py-1 rounded-full text-[11px] outline-none border"
                  style={{ borderColor: inputBorder, backgroundColor: inputBg, color: text1, width: "120px" }}
                />
              ) : (
                <button
                  onClick={() => setNewTagInput(true)}
                  className="px-3 py-1 rounded-full text-[11px] font-semibold border transition-colors hover:opacity-80"
                  style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: text2, backgroundColor: cardInner }}
                >
                  + ADD TAG
                </button>
              )}
            </div>
          </div>

          {/* TREATMENT & PROCEDURE PLAN */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>📋</span> TREATMENT & PROCEDURE PLAN
            </p>
            <div className="flex flex-col gap-2 mb-3">
              {procedures.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${cardBorder}`}
                  style={{ backgroundColor: cardInner }}
                >
                  {/* Drag handle */}
                  <span className="text-base cursor-grab select-none" style={{ color: text2 }}>⠿</span>
                  <input
                    type="text"
                    value={step.text}
                    onChange={e => updateProcedure(step.id, e.target.value)}
                    className="flex-1 text-sm outline-none bg-transparent"
                    style={{ color: text1 }}
                    placeholder="Describe procedure..."
                  />
                  <button
                    onClick={() => deleteProcedure(step.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-100 shrink-0"
                    style={{ color: text2 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addProcedureStep}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-colors hover:opacity-80`}
              style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: text2, backgroundColor: "transparent" }}
            >
              + Add Procedure Step
            </button>
          </div>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* DIAGNOSTICS & IMAGING */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>🖼</span> DIAGNOSTICS & IMAGING
            </p>

            {/* Scan grid */}
            {scans.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-2">
                {scans.map(scan => (
                  <div
                    key={scan.id}
                    className={`relative rounded-xl overflow-hidden border ${cardBorder} group`}
                    style={{ backgroundColor: cardInner, aspectRatio: "1.3" }}
                  >
                    {scan.url ? (
                      <img src={scan.url} alt={scan.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                        <span className="text-2xl">🦷</span>
                        <span className="text-[10px] text-center px-1 leading-tight" style={{ color: text2 }}>{scan.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeScam(scan.id)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/80 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input
              ref={scanInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleScanUpload}
            />
            <button
              onClick={() => scanInputRef.current?.click()}
              className={`w-full py-4 rounded-xl border-2 border-dashed flex flex-col items-center gap-1 transition-colors hover:opacity-80`}
              style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", backgroundColor: cardInner }}
            >
              <span className="text-xl">⬆</span>
              <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: text2 }}>UPLOAD SCANS</span>
            </button>
          </div>

          {/* POST-OP INSTRUCTIONS */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>📋</span> POST-OP INSTRUCTIONS
            </p>
            <div className="flex flex-col gap-2.5 mb-3">
              {POST_OP_OPTIONS.map(opt => (
                <label key={opt} className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!postOpChecked[opt]}
                    onChange={e => setPostOpChecked(prev => ({ ...prev, [opt]: e.target.checked }))}
                    className="w-4 h-4 rounded border accent-[#591727]"
                    style={{ borderColor: inputBorder }}
                  />
                  <span className="text-sm" style={{ color: text1 }}>{opt}</span>
                </label>
              ))}
            </div>
            <textarea
              value={additionalPostOp}
              onChange={e => setAdditionalPostOp(e.target.value)}
              placeholder="Additional post-op instructions..."
              rows={3}
              className={sharedTextarea}
              style={sharedInput}
            />
          </div>

          {/* ADDITIONAL NOTES */}
          <div className={`rounded-2xl p-5 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <p className={sectionLabel} style={{ color: text2 }}>
              <span>✏</span> ADDITIONAL NOTES
            </p>
            <textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={6}
              className={sharedTextarea}
              style={sharedInput}
            />
          </div>

          {/* ACTION BUTTONS */}
          <div className={`rounded-2xl p-4 border ${cardBorder} grid grid-cols-3 gap-2`} style={{ backgroundColor: card }}>
            {/* Follow Up */}
            <button
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors hover:opacity-80"
              style={{ backgroundColor: cardInner }}
              onClick={() => alert("Follow Up action triggered")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: text2 }}>FOLLOW UP</span>
            </button>
            {/* Referral */}
            <button
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors hover:opacity-80"
              style={{ backgroundColor: cardInner }}
              onClick={() => alert("Referral action triggered")}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: text2 }}>REFERRAL</span>
            </button>
            {/* Print Rx */}
            <button
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors hover:opacity-80"
              style={{ backgroundColor: cardInner }}
              onClick={() => window.print()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={text1} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: text2 }}>PRINT RX</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

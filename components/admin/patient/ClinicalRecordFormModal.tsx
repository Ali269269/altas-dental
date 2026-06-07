"use client";

import { useEffect, useRef, useState } from "react";
import { apiUrl } from "@/utils/api";
import type { CheckupApiData, ClinicalRecordSavePayload } from "@/utils/clinicalRecord";

const POST_OP_OPTIONS = [
  "Avoid hot liquids for 24 hours",
  "Prescribed Ibuprofen 600mg tid",
  "Soft diet recommended",
];

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
  storedName?: string;
  mimeType?: string;
  uploading?: boolean;
}

function authHeaderOnly(getAuthHeaders?: () => HeadersInit): HeadersInit {
  const h = getAuthHeaders?.() ?? {};
  if (h instanceof Headers) {
    const auth = h.get("Authorization");
    return auth ? { Authorization: auth } : {};
  }
  if (Array.isArray(h)) {
    const pair = h.find(([k]) => k.toLowerCase() === "authorization");
    return pair ? { Authorization: pair[1] } : {};
  }
  const rec = h as Record<string, string>;
  return rec.Authorization ? { Authorization: rec.Authorization } : {};
}

function tagsFromCheckup(checkup?: CheckupApiData | null): DiagnosticTag[] {
  if (!checkup?.diagnostics?.length) return [];
  return checkup.diagnostics
    .filter((d) => typeof d === "object" && d.tag)
    .map((d, i) => ({
      id: `tag-${i}`,
      label: String(d.label || "").toUpperCase(),
    }));
}

function primaryDiagnosisFromCheckup(checkup?: CheckupApiData | null): string {
  if (checkup?.primaryDiagnosis?.trim()) return checkup.primaryDiagnosis.trim();
  const first = checkup?.diagnostics?.[0];
  if (first && typeof first === "object" && !first.tag) {
    return String(first.label || "").trim();
  }
  return "";
}

function proceduresFromCheckup(checkup?: CheckupApiData | null): ProcedureStep[] {
  const steps = checkup?.treatment?.filter(Boolean) ?? [];
  if (!steps.length) return [{ id: "1", text: "" }];
  return steps.map((text, i) => ({ id: String(i + 1), text: String(text) }));
}

function postOpFromCheckup(checkup?: CheckupApiData | null): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const opt of checkup?.postOpInstructions ?? []) {
    if (POST_OP_OPTIONS.includes(opt)) out[opt] = true;
  }
  return out;
}

function scansFromCheckup(checkup?: CheckupApiData | null): ScanFile[] {
  if (checkup?.scans?.length) {
    return checkup.scans.map((s) => ({
      id: s.storedName,
      url: s.url,
      name: s.originalName,
      storedName: s.storedName,
      mimeType: s.mimeType,
    }));
  }
  return (checkup?.scanNames ?? []).map((name, i) => ({
    id: `legacy-${i}`,
    url: "",
    name,
  }));
}

export function ClinicalRecordFormModal({
  mode,
  appointmentId,
  patientName,
  patientId,
  initialCheckup,
  getAuthHeaders,
  onClose,
  onSave,
  isDark,
  card,
  cardBorder,
  text1,
  text2,
}: {
  mode: "create" | "edit";
  appointmentId: string;
  patientName: string;
  patientId?: string;
  initialCheckup?: CheckupApiData | null;
  getAuthHeaders?: () => HeadersInit;
  onClose: () => void;
  onSave: (payload: ClinicalRecordSavePayload) => Promise<void>;
  isDark: boolean;
  card: string;
  cardBorder: string;
  text1: string;
  text2: string;
}) {
  const pageBg = "#F3F4F6";
  const cardBg = "#FFFFFF";
  const cardInner = "#F9FAFB";
  const inputBg = "#FFFFFF";
  const inputBorder = "#753141";
  const formText1 = "#591727";
  const formText2 = "#7A3048";
  const sectionColor = "#711C31";
  const accent = "#591727";

  const [loading, setLoading] = useState(mode === "edit" && !initialCheckup);
  const [complaint, setComplaint] = useState(initialCheckup?.complaint ?? "");
  const [clinicalObs, setClinicalObs] = useState(initialCheckup?.clinicalObs ?? "");
  const [primaryDiag, setPrimaryDiag] = useState(() =>
    primaryDiagnosisFromCheckup(initialCheckup)
  );
  const [diagTags, setDiagTags] = useState<DiagnosticTag[]>(() =>
    tagsFromCheckup(initialCheckup)
  );
  const [newTagInput, setNewTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [procedures, setProcedures] = useState<ProcedureStep[]>(() =>
    proceduresFromCheckup(initialCheckup)
  );
  const [scans, setScans] = useState<ScanFile[]>(() =>
    scansFromCheckup(initialCheckup)
  );
  const [postOpChecked, setPostOpChecked] = useState<Record<string, boolean>>(
    () => postOpFromCheckup(initialCheckup)
  );
  const [additionalPostOp, setAdditionalPostOp] = useState(() => {
    const listed = new Set(POST_OP_OPTIONS);
    const extra = (initialCheckup?.postOpInstructions ?? []).filter(
      (x) => !listed.has(x)
    );
    return extra.join("\n");
  });
  const [additionalNotes, setAdditionalNotes] = useState(
    initialCheckup?.additionalNotes ?? ""
  );
  const [prescriptions, setPrescriptions] = useState(
    initialCheckup?.prescriptions ?? ""
  );
  const [followUp, setFollowUp] = useState(initialCheckup?.followUp ?? "");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "edit" || initialCheckup) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const headers = getAuthHeaders?.() ?? {};
        const res = await fetch(
          apiUrl(`/api/statistics/appointments/${appointmentId}`),
          { headers }
        );
        const json = await res.json();
        if (cancelled || !json?.data?.checkup) return;
        applyCheckup(json.data.checkup as CheckupApiData);
      } catch {
        /* keep empty form */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, appointmentId, initialCheckup, getAuthHeaders]);

  function applyCheckup(c: CheckupApiData) {
    setComplaint(c.complaint ?? "");
    setClinicalObs(c.clinicalObs ?? "");
    setPrimaryDiag(primaryDiagnosisFromCheckup(c));
    setDiagTags(tagsFromCheckup(c));
    setProcedures(proceduresFromCheckup(c));
    setScans(scansFromCheckup(c));
    setPostOpChecked(postOpFromCheckup(c));
    const listed = new Set(POST_OP_OPTIONS);
    const extra = (c.postOpInstructions ?? []).filter((x) => !listed.has(x));
    setAdditionalPostOp(extra.join("\n"));
    setAdditionalNotes(c.additionalNotes ?? "");
    setPrescriptions(c.prescriptions ?? "");
    setFollowUp(c.followUp ?? "");
  }

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
  });

  function addProcedureStep() {
    setProcedures((p) => [...p, { id: Date.now().toString(), text: "" }]);
  }

  function updateProcedure(id: string, text: string) {
    setProcedures((p) => p.map((s) => (s.id === id ? { ...s, text } : s)));
  }

  function deleteProcedure(id: string) {
    setProcedures((p) => {
      const next = p.filter((s) => s.id !== id);
      return next.length ? next : [{ id: "1", text: "" }];
    });
  }

  function addTag() {
    if (newTagText.trim()) {
      setDiagTags((t) => [
        ...t,
        { id: Date.now().toString(), label: newTagText.trim().toUpperCase() },
      ]);
      setNewTagText("");
      setNewTagInput(false);
    }
  }

  function removeTag(id: string) {
    setDiagTags((t) => t.filter((tag) => tag.id !== id));
  }

  async function handleScanUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = "";
    setUploadError(null);
    setUploading(true);

    const tempIds = files.map((f) => `pending-${Date.now()}-${f.name}`);
    setScans((s) => [
      ...s,
      ...files.map((f, i) => ({
        id: tempIds[i],
        url: URL.createObjectURL(f),
        name: f.name,
        uploading: true,
      })),
    ]);

    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("scans", f));
      const res = await fetch(
        apiUrl(`/api/statistics/appointments/${appointmentId}/clinical-scans`),
        {
          method: "POST",
          headers: authHeaderOnly(getAuthHeaders),
          body: fd,
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || "Failed to upload images");
      }
      const uploaded = (json.data?.scans ?? []) as CheckupApiData["scans"];
      setScans((prev) => {
        const withoutPending = prev.filter((p) => !tempIds.includes(p.id));
        const fromServer = (uploaded ?? []).map((s) => ({
          id: s!.storedName,
          url: s!.url,
          name: s!.originalName,
          storedName: s!.storedName,
          mimeType: s!.mimeType,
        }));
        const seen = new Set<string>();
        return [...withoutPending, ...fromServer].filter((x) => {
          const key = x.storedName || x.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    } catch (err) {
      setScans((s) => s.filter((p) => !tempIds.includes(p.id)));
      setUploadError(
        err instanceof Error ? err.message : "Could not upload images"
      );
    } finally {
      setUploading(false);
    }
  }

  async function removeScan(id: string, storedName?: string) {
    const sn = storedName || scans.find((s) => s.id === id)?.storedName;
    if (sn) {
      try {
        await fetch(
          apiUrl(
            `/api/statistics/appointments/${appointmentId}/clinical-scans/${encodeURIComponent(sn)}`
          ),
          { method: "DELETE", headers: authHeaderOnly(getAuthHeaders) }
        );
      } catch {
        setUploadError("Could not remove image from server.");
        return;
      }
    }
    setScans((s) => s.filter((sc) => sc.id !== id));
  }

  function buildPayload(): ClinicalRecordSavePayload {
    const postOpFromChecks = POST_OP_OPTIONS.filter((o) => postOpChecked[o]);
    const postOpExtra = additionalPostOp
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const diagnostics = [
      ...(primaryDiag.trim()
        ? [{ label: primaryDiag.trim(), tag: false }]
        : []),
      ...diagTags.map((t) => ({ label: t.label, tag: true })),
    ];

    return {
      complaint: complaint.trim(),
      clinicalObs: clinicalObs.trim(),
      primaryDiagnosis: primaryDiag.trim(),
      diagnostics,
      treatment: procedures.map((p) => p.text.trim()).filter(Boolean),
      prescriptions: prescriptions.trim(),
      followUp: followUp.trim(),
      postOpInstructions: [...postOpFromChecks, ...postOpExtra],
      additionalNotes: additionalNotes.trim(),
      scanNames: scans.map((s) => s.name),
      isEdit: mode === "edit",
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(buildPayload());
      setSavedFlash(true);
      setTimeout(() => {
        setSavedFlash(false);
        onClose();
      }, 600);
    } finally {
      setSaving(false);
    }
  }

  const sectionLabel =
    "text-[13px] font-bold numeric-font flex items-center gap-2 mb-3";
  const sharedInput: React.CSSProperties = {
    backgroundColor: inputBg,
    borderColor: inputBorder,
    color: formText1,
  };
  const sharedTextarea =
    "w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none transition-colors";

  return (
    <>
      <style>{`
        .cr-modal-grid { display: grid; grid-template-columns: 1fr 300px; gap: 16px; }
        @media (max-width: 900px) {
          .cr-modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto p-3 sm:p-6"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-6xl rounded-2xl border border-[#753141] shadow-2xl my-4"
          style={{ backgroundColor: pageBg }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#753141] bg-white rounded-t-2xl"
          >
            <div>
              <h2
                className="text-xl sm:text-2xl font-bold tracking-wide"
                style={{ color: accent }}
              >
                {mode === "edit" ? "Edit Clinical Record" : "Clinical Record"}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: formText2 }}>
                {today} · {patientName}
                {patientId ? ` · ${patientId}` : ""}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-[#753141] bg-white hover:bg-[#F3F4F6]"
                style={{ color: formText1, borderColor: inputBorder }}
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving || loading || uploading}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                style={{
                  backgroundColor: savedFlash ? "#3DAA7A" : accent,
                  opacity: saving || loading || uploading ? 0.7 : 1,
                }}
              >
                {saving ? "Saving…" : savedFlash ? "Saved!" : "Save"}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-sm" style={{ color: formText2 }}>
              Loading clinical record…
            </div>
          ) : (
            <div className="px-4 sm:px-6 py-5 cr-modal-grid">
              <div className="flex flex-col gap-4 min-w-0">
                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    PATIENT
                  </p>
                  <p className="text-sm font-semibold" style={{ color: formText1 }}>
                    {patientName}
                  </p>
                </div>

                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    PATIENT CHIEF COMPLAINT (SUBJECTIVE)
                  </p>
                  <textarea
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Describe the patient's concerns..."
                    rows={4}
                    className={sharedTextarea}
                    style={sharedInput}
                  />
                </div>

                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    CLINICAL OBSERVATIONS
                  </p>
                  <textarea
                    value={clinicalObs}
                    onChange={(e) => setClinicalObs(e.target.value)}
                    placeholder="Record intraoral findings..."
                    rows={4}
                    className={sharedTextarea}
                    style={sharedInput}
                  />
                </div>

                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    DIAGNOSTICS
                  </p>
                  <input
                    type="text"
                    value={primaryDiag}
                    onChange={(e) => setPrimaryDiag(e.target.value)}
                    placeholder="Primary diagnosis"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border mb-3"
                    style={sharedInput}
                  />
                  <div className="flex flex-wrap gap-2 items-center">
                    {diagTags.map((tag) => (
                      <div
                        key={tag.id}
                        className="numeric-font flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold border cursor-pointer group"
                        style={{
                          borderColor: inputBorder,
                          color: "#FFFFFF",
                          backgroundColor: "#681A2D",
                        }}
                      >
                        {tag.label}
                        <button
                          type="button"
                          onClick={() => removeTag(tag.id)}
                          className="opacity-70 group-hover:opacity-100 ml-1 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {newTagInput ? (
                      <input
                        autoFocus
                        type="text"
                        value={newTagText}
                        onChange={(e) => setNewTagText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addTag();
                          if (e.key === "Escape") {
                            setNewTagInput(false);
                            setNewTagText("");
                          }
                        }}
                        onBlur={addTag}
                        placeholder="Tag name..."
                        className="px-3 py-1 rounded-full text-[11px] outline-none border"
                        style={{
                          borderColor: inputBorder,
                          backgroundColor: inputBg,
                          color: formText1,
                          width: "120px",
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setNewTagInput(true)}
                        className="px-3 numeric-font py-1 rounded-full text-[11px] font-semibold border"
                        style={{
                          borderColor: inputBorder,
                          color: formText2,
                          backgroundColor: cardInner,
                        }}
                      >
                        + ADD TAG
                      </button>
                    )}
                  </div>
                </div>

                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    TREATMENT & PROCEDURE PLAN
                  </p>
                  <div className="flex flex-col gap-2 mb-3">
                    {procedures.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#753141]"
                        style={{ backgroundColor: cardInner }}
                      >
                        <input
                          type="text"
                          value={step.text}
                          onChange={(e) =>
                            updateProcedure(step.id, e.target.value)
                          }
                          className="flex-1 text-sm outline-none bg-transparent min-w-0"
                          style={{ color: formText1 }}
                          placeholder="Describe procedure..."
                        />
                        <button
                          type="button"
                          onClick={() => deleteProcedure(step.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-100 shrink-0"
                          style={{ color: formText2 }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addProcedureStep}
                    className="w-full py-2 rounded-xl text-sm font-semibold border-2 border-dashed border-[#753141]"
                    style={{ color: formText2 }}
                  >
                    + Add Procedure Step
                  </button>
                </div>

                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    PRESCRIPTIONS & FOLLOW-UP
                  </p>
                  <textarea
                    value={prescriptions}
                    onChange={(e) => setPrescriptions(e.target.value)}
                    placeholder="Prescriptions..."
                    rows={2}
                    className={`${sharedTextarea} mb-2`}
                    style={sharedInput}
                  />
                  <input
                    type="text"
                    value={followUp}
                    onChange={(e) => setFollowUp(e.target.value)}
                    placeholder="Follow-up date or instructions"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                    style={sharedInput}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 min-w-0">
                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    DIAGNOSTICS & IMAGING
                  </p>
                  {uploadError && (
                    <p className="text-xs text-red-600 mb-2">{uploadError}</p>
                  )}
                  {scans.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {scans.map((scan) => (
                        <div
                          key={scan.id}
                          className="relative rounded-xl overflow-hidden border border-[#753141]"
                          style={{ backgroundColor: cardInner, aspectRatio: "1.3" }}
                        >
                          {scan.uploading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-xs" style={{ color: formText2 }}>
                              Uploading…
                            </div>
                          )}
                          {scan.url &&
                          (/^image\//i.test(scan.mimeType || "") ||
                            /\.(jpe?g|png|gif|webp|bmp)$/i.test(scan.name)) ? (
                            <img
                              src={scan.url}
                              alt={scan.name}
                              className="w-full h-full object-cover"
                            />
                          ) : scan.url ? (
                            <a
                              href={scan.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full h-full flex flex-col items-center justify-center p-2 text-center no-underline"
                              style={{ color: formText1 }}
                            >
                              <span className="text-2xl">📄</span>
                              <span className="text-[10px] line-clamp-2" style={{ color: formText2 }}>
                                {scan.name}
                              </span>
                            </a>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-1">
                              <span className="text-[10px] text-center" style={{ color: formText2 }}>
                                {scan.name}
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              void removeScan(scan.id, scan.storedName)
                            }
                            disabled={scan.uploading}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 text-xs text-red-500 disabled:opacity-40"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    ref={scanInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => void handleScanUpload(e)}
                  />
                  <button
                    type="button"
                    onClick={() => scanInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-[#753141] bg-[#F9FAFB] text-[11px] font-semibold uppercase tracking-widest hover:bg-[#F3F4F6] disabled:opacity-60"
                    style={{ color: formText2 }}
                  >
                    {uploading ? "Uploading…" : "Upload Scans"}
                  </button>
                </div>

                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    POST-OP INSTRUCTIONS
                  </p>
                  <div className="flex flex-col gap-2 mb-2">
                    {POST_OP_OPTIONS.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 cursor-pointer text-sm"
                        style={{ color: formText1 }}
                      >
                        <input
                          type="checkbox"
                          checked={!!postOpChecked[opt]}
                          onChange={(e) =>
                            setPostOpChecked((prev) => ({
                              ...prev,
                              [opt]: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 accent-[#591727]"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={additionalPostOp}
                    onChange={(e) => setAdditionalPostOp(e.target.value)}
                    placeholder="Additional post-op instructions..."
                    rows={2}
                    className={sharedTextarea}
                    style={sharedInput}
                  />
                </div>

                <div
                  className="rounded-2xl p-4 border border-[#753141]"
                  style={{ backgroundColor: cardBg }}
                >
                  <p className={sectionLabel} style={{ color: sectionColor }}>
                    ADDITIONAL NOTES
                  </p>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Additional notes..."
                    rows={4}
                    className={sharedTextarea}
                    style={sharedInput}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

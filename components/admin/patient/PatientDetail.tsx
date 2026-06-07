"use client";

import { useState, useEffect, useMemo } from "react";
import type { Patient, DetailTab, ClinicalHistoryEntry } from "@/types/patient";
import { patientStatusStyle as statusStyle } from "@/utils/patientStatusStyle";
import { ClinicalRecordDetailModal } from "@/components/admin/patient/ClinicalRecordDetailModal";

const HISTORY_PAGE_SIZE = 1;

function MailIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {direction === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

export function PatientDetail({
  patient,
  onBack,
  isDark,
  card,
  cardBorder,
  cardInner,
  text1,
  text2,
  pageBg,
  sectionLabel = "PATIENTS",
  loading = false,
  error = null,
  onRetry,
}: {
  patient: Patient | null;
  onBack: () => void;
  isDark: boolean;
  card: string;
  cardBorder: string;
  cardInner: string;
  text1: string;
  text2: string;
  pageBg: string;
  sectionLabel?: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("history");
  const [historyPage, setHistoryPage] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalHistoryEntry | null>(
    null
  );

  useEffect(() => {
    setHistoryPage(0);
    setActiveTab("history");
    setSelectedRecord(null);
  }, [patient?.id]);

  const historyTotalPages = useMemo(() => {
    const count = patient?.historyEntries.length ?? 0;
    return Math.max(1, Math.ceil(count / HISTORY_PAGE_SIZE));
  }, [patient?.historyEntries.length]);

  const paginatedHistory = useMemo(() => {
    if (!patient) return [];
    const start = historyPage * HISTORY_PAGE_SIZE;
    return patient.historyEntries.slice(start, start + HISTORY_PAGE_SIZE);
  }, [patient, historyPage]);

  const inputBg = isDark ? "#c1a694" : "#F8F7F5";

  if (loading) {
    return (
      <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden" style={{ marginTop: "40px" }}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:opacity-80 transition shrink-0"
            style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727", color: "#fff" }}
            title="Go back"
          >
            ←
          </button>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "#591727" }}>
            {sectionLabel} / Details
          </span>
        </div>
        <div className={`rounded-2xl border p-8 text-center ${cardBorder}`} style={{ backgroundColor: card }}>
          <p className="text-sm animate-pulse" style={{ color: text2 }}>Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden" style={{ marginTop: "40px" }}>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:opacity-80 transition shrink-0"
            style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727", color: "#fff" }}
            title="Go back"
          >
            ←
          </button>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#ffffff" : "#591727" }}>
            {sectionLabel} / Details
          </span>
        </div>
        <div className={`rounded-2xl border p-6 sm:p-8 text-center ${cardBorder}`} style={{ backgroundColor: card }}>
          <p className="text-sm mb-4" style={{ color: isDark ? "#8B1A2E" : "#C94A3A" }}>
            {error || "Could not load patient details."}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727" }}
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const tabLabels: { id: DetailTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "history", label: "History" },
    { id: "notes", label: "Records" },
  ];

  return (
    <div className="min-h-full ml-0 lg:ml-10 transition-colors duration-300 px-3 sm:px-4 lg:px-0 overflow-x-hidden" style={{ marginTop: "40px" }}>
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
            {sectionLabel}
          </button>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>/ Details</span>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-full border" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8", color: text2 }}>
          View only
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-auto lg:min-w-[17rem] lg:max-w-sm shrink-0 flex flex-col gap-4">
          <div className={`rounded-2xl p-5 sm:p-6 border w-full min-w-0 ${cardBorder}`} style={{ backgroundColor: card }}>
            <h2 className="text-[19px] font-bold mb-1" style={{ color: text1 }}>{patient.name}</h2>
            <p className="text-sm mb-5" style={{ color: text2 }}>{patient.id}</p>
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-2.5 w-max max-w-full">
                <span className="shrink-0 flex items-center justify-center w-[14px] h-[14px]" style={{ color: isDark ? "#D4A574" : "#591727" }}>
                  <MailIcon color={isDark ? "#D4A574" : "#591727"} />
                </span>
                <span className="text-sm whitespace-nowrap" style={{ color: text2 }}>{patient.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 flex items-center justify-center w-[14px] h-[14px]" style={{ color: isDark ? "#D4A574" : "#591727" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 A19.79 19.79 0 0 1 2.11 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 c.12.86.31 1.7.57 2.5a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.58-1.58a2 2 0 0 1 2.11-.45 c.8.26 1.64.45 2.5.57A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span className="text-sm" style={{ color: text2 }}>{patient.phone}</span>
              </div>
            </div>
          </div>

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
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div className={`rounded-2xl border ${cardBorder} flex flex-col sm:flex-row items-stretch sm:items-center overflow-hidden`} style={{ backgroundColor: card }}>
            <div
              className="flex flex-row sm:flex-col items-center justify-center px-6 py-4 sm:px-8 sm:py-6 sm:shrink-0 sm:self-stretch gap-3 sm:gap-0"
              style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727" }}
            >
              <span className="text-xs font-semibold text-white/70 sm:mb-1">Upcoming</span>
              <span className="text-4xl sm:text-5xl font-bold text-white leading-none numeric-font">{patient.upcomingDate}</span>
              <span className="text-xs text-white/70 sm:mt-1">{patient.upcomingMonth}</span>
            </div>
            <div className="flex-1 py-4 px-4 sm:px-0">
              <h3 className="text-xl sm:text-2xl font-bold mb-1 ml-6" style={{ color: text1 }}>{patient.upcomingService}</h3>
              <p className="text-sm mb-2 ml-6" style={{ color: text2 }}>with {patient.upcomingDoctor}</p>
              <div className="flex items-center gap-1 ml-6">
                <span className="text-[#591727]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </span>
                <span className="text-sm font-semibold numeric-font" style={{ color: text2 }}>{patient.upcomingTime}</span>
              </div>
            </div>
            <div className="px-4 pb-4 sm:pb-0 sm:pr-6">
              <span className={statusStyle(patient.upcomingStatus)}>{patient.upcomingStatus}</span>
            </div>
          </div>

          <div className={`rounded-2xl border ${cardBorder} flex-1`} style={{ backgroundColor: card }}>
            <div className="flex border-b" style={{ borderColor: isDark ? "#5C2A3A" : "#D9C9A8" }}>
              {tabLabels.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className="flex-1 py-4 text-sm font-semibold transition-colors relative"
                  style={{ color: activeTab === id ? "#591727" : text2 }}
                >
                  {label}
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: isDark ? "#D4A574" : "#591727" }} />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-4" style={{ color: text1 }}>
                  Clinical Observations
                </h3>
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
                  {patient.documents.map((doc, i) => {
                    const row = (
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: isDark ? "#6B2A40" : "#FEE2E2" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#F5ECD7" : "#591727"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: text1 }}>{doc.name}</p>
                          <p className="text-[13px] truncate" style={{ color: text2 }}>{doc.added} · {doc.size}</p>
                        </div>
                      </div>
                    );
                    return doc.url ? (
                      <a
                        key={i}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border gap-2 hover:bg-[#F3F4F6] transition-colors no-underline ${cardBorder}`}
                        style={{ backgroundColor: cardInner, color: text1 }}
                      >
                        {row}
                      </a>
                    ) : (
                      <div key={i} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border gap-2 ${cardBorder}`} style={{ backgroundColor: cardInner }}>
                        {row}
                      </div>
                    );
                  })}
                </div>

                {patient.postOpInstructions.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: "#591727", color: "#F5ECD7" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="6" width="18" height="14" rx="2" /><path d="M9 6V4h6v2" />
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

            {activeTab === "history" && (
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-5" style={{ color: text1 }}>Medical History & Checkups</h3>
                {patient.historyEntries.length === 0 && (
                  <p className="text-sm" style={{ color: text2 }}>No clinical records yet. Use the + action from the list to add a clinical record.</p>
                )}
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5" style={{ backgroundColor: isDark ? "#5C2A3A" : "#D9C9A8" }} />
                  <div className="flex flex-col gap-8 pl-6 sm:pl-8">
                    {paginatedHistory.map((entry, i) => (
                      <div key={`${historyPage}-${i}`} className="relative">
                        <div className="absolute -left-6 sm:-left-8 top-1 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: isDark ? "#8B1A2E" : "#591727" }} />
                        <div className="mb-2">
                          <span className="font-bold text-base numeric-font" style={{ color: text1 }}>{entry.date}</span>
                          <br />
                          <span className="text-xs ml-2 numeric-font" style={{ color: text2 }}>{entry.time}</span>
                        </div>
                        <div className="flex flex-col gap-4 sm:gap-6">
                          {[
                            { label: "COMPLAINT", value: entry.complaint, icon: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" },
                            { label: "CLINICAL OBSERVATIONS", value: entry.clinicalObs, icon: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" },
                          ].map((block) => (
                            <div key={block.label}>
                              <div className="flex items-center gap-1 mb-1">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#591727" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d={block.icon} />
                                </svg>
                                <span className="text-[13px] font-bold tracking-widest uppercase numeric-font" style={{ color: text2 }}>{block.label}</span>
                              </div>
                              <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: cardInner, color: text1 }}>{block.value}</div>
                            </div>
                          ))}
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-[13px] font-bold tracking-widest uppercase numeric-font" style={{ color: text2 }}>DIAGNOSTICS</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {entry.diagnostics.map((d, di) => (
                                <span key={di} className={`px-3 py-1 rounded-lg text-xs font-semibold ${d.tag ? "border" : ""}`} style={{ backgroundColor: d.tag ? "#D3D3D3" : cardInner, color: text1 }}>
                                  {d.label}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-[13px] font-bold tracking-widest uppercase numeric-font" style={{ color: text2 }}>TREATMENT & PROCEDURE PLAN</span>
                            <div className="flex flex-col gap-2 mt-1">
                              {entry.treatment.map((t, ti) => (
                                <div key={ti} className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: cardInner, color: text1 }}>{t}</div>
                              ))}
                            </div>
                          </div>
                          {entry.prescriptions && (
                            <div>
                              <span className="text-[13px] font-bold tracking-widest uppercase numeric-font" style={{ color: text2 }}>PRESCRIPTIONS</span>
                              <div className="px-3 py-2 rounded-lg text-sm mt-1" style={{ backgroundColor: cardInner, color: text1 }}>{entry.prescriptions}</div>
                            </div>
                          )}
                          {entry.followUp && (
                            <div>
                              <span className="text-[13px] font-bold tracking-widest uppercase numeric-font" style={{ color: text2 }}>FOLLOW-UP RECOMMENDATIONS</span>
                              <div className="px-3 py-2 rounded-lg text-sm mt-1" style={{ backgroundColor: cardInner, color: text1 }}>{entry.followUp}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {patient.historyEntries.length > 0 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button type="button" disabled={historyPage <= 0} onClick={() => setHistoryPage((p) => Math.max(0, p - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-35" style={{ color: text2, border: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}>
                      <ChevronIcon direction="left" />
                    </button>
                    {Array.from({ length: historyTotalPages }, (_, idx) => idx + 1).map((n) => (
                      <button key={n} type="button" onClick={() => setHistoryPage(n - 1)} className="w-8 h-8 rounded-lg text-xs font-semibold" style={{ backgroundColor: historyPage === n - 1 ? (isDark ? "#8B1A2E" : "#591727") : "transparent", color: historyPage === n - 1 ? "#F5ECD7" : text2 }}>
                        {n}
                      </button>
                    ))}
                    <button type="button" disabled={historyPage >= historyTotalPages - 1} onClick={() => setHistoryPage((p) => Math.min(historyTotalPages - 1, p + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-35" style={{ color: text2, border: `1px solid ${isDark ? "#5C2A3A" : "#D9C9A8"}` }}>
                      <ChevronIcon direction="right" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide mb-2" style={{ color: text1 }}>
                  Clinical Records
                </h3>
                <p className="text-xs mb-5" style={{ color: text2 }}>
                  Tap a record to view the full clinical details and attachments.
                </p>
                {patient.historyEntries.length === 0 && (
                  <p className="text-sm" style={{ color: text2 }}>
                    No clinical records on file. Use the + action from the patient list to add a record.
                  </p>
                )}
                <div className="flex flex-col gap-3">
                  {patient.historyEntries.map((entry, i) => {
                    const summary =
                      entry.complaint !== "—"
                        ? entry.complaint
                        : entry.clinicalObs !== "—"
                          ? entry.clinicalObs
                          : "Clinical visit record";
                    const truncated =
                      summary.length > 120 ? `${summary.slice(0, 120)}…` : summary;
                    return (
                      <button
                        key={entry.appointmentId || `${entry.date}-${i}`}
                        type="button"
                        onClick={() => setSelectedRecord(entry)}
                        className={`text-left rounded-2xl p-4 sm:p-5 border transition-colors hover:bg-[#F3F4F6] ${cardBorder}`}
                        style={{ backgroundColor: cardInner }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="text-sm font-bold numeric-font" style={{ color: text1 }}>
                              {entry.date}
                            </p>
                            <p className="text-xs" style={{ color: text2 }}>
                              {entry.time}
                              {entry.specialty ? ` · ${entry.specialty}` : ""}
                            </p>
                          </div>
                          <span
                            className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: "#F3F4F6",
                              color: isDark ? "#F5ECD7" : "#591727",
                            }}
                          >
                            View details →
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2" style={{ color: text2 }}>
                          {truncated}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {entry.treatment.length > 0 && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "#F3F4F6",
                                color: isDark ? text2 : "#7A3048",
                              }}
                            >
                              {entry.treatment.length} procedure
                              {entry.treatment.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {(entry.scans?.length ?? 0) > 0 && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: "#F3F4F6",
                                color: isDark ? text2 : "#7A3048",
                              }}
                            >
                              {entry.scans!.length} attachment
                              {entry.scans!.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {entry.primaryDiagnosis && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-full"
                              style={{ backgroundColor: "#681A2D", color: "#fff" }}
                            >
                              {entry.primaryDiagnosis}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRecord && (
        <ClinicalRecordDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import type { Patient, DetailTab } from "@/types/patient";
import { patientStatusStyle as statusStyle } from "@/utils/patientStatusStyle";
import { NewNoteModal } from "./NewNoteModal";

export function PatientDetail({
  patient, onBack, isDark,
  card, cardBorder, cardInner, text1, text2, pageBg,
  sectionLabel = "PATIENTS",
}: {
  patient: Patient; onBack: () => void; isDark: boolean;
  card: string; cardBorder: string; cardInner: string;
  text1: string; text2: string; pageBg: string;
  sectionLabel?: string;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [showNewNote, setShowNewNote] = useState(false);
  const [notes, setNotes] = useState(patient.notes);

  const inputBg     = isDark ? "#c1a694" : "#F8F7F5";
  const inputBorder = isDark ? "#5C2A3A" : "#D9C9A8";

  function handleSaveNote(content: string, status: string) {
    setNotes(prev => [
      { doctor: "Dr. User", doctorInitials: "DU", date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) + " Â· " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), status, content },
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
            {sectionLabel}
          </button>
          <span className="text-xl sm:text-2xl font-bold" style={{ color: isDark ? "#B09070" : "#7A6040" }}>/ Details</span>
        </div>
      </div>

      {/* Main layout — stacked on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* Left sidebar â€” full width on mobile, fixed w-56 on lg+ */}
        <div className="w-full lg:w-56 lg:shrink-0 flex flex-col gap-4">

          {/* Patient Info */}
          <div className={`rounded-2xl p-5 sm:p-6 border ${cardBorder}`} style={{ backgroundColor: card }}>
            <h2 className="text-[19px] font-bold mb-1" style={{ color: text1 }}>{patient.name}</h2>
            <p className="text-sm mb-5" style={{ color: text2 }}>{patient.id}</p>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-md">âœ‰</span>
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

            {/* â”€â”€ Overview Tab â”€â”€ */}
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
                          <p className="text-[13px] truncate" style={{ color: text2 }}>{doc.added} Â· {doc.size}</p>
                        </div>
                      </div>
                      <button className="shrink-0" style={{ color: text2 }}>â¬‡</button>
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

            {/* â”€â”€ History Tab â”€â”€ */}
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
                    <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>â€¹</button>
                    {[1, 2].map(n => (
                      <button key={n} className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold"
                        style={{ backgroundColor: n === 1 ? (isDark ? "#8B1A2E" : "#591727") : "transparent", color: n === 1 ? "#F5ECD7" : text2 }}>
                        {n}
                      </button>
                    ))}
                    <button className="w-7 h-7 rounded flex items-center justify-center text-xs" style={{ color: text2 }}>â€º</button>
                  </div>
                )}
              </div>
            )}

            {/* â”€â”€ Notes Tab â”€â”€ */}
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
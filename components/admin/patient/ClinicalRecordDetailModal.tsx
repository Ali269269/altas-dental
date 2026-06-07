"use client";

import type { ClinicalHistoryEntry } from "@/types/patient";

const MAROON = "#591727";
const MAROON_DARK = "#711C31";
const MAROON_MUTED = "#7A3048";

function FieldBlock({
  label,
  value,
  multiline,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  if (!value?.trim() || value === "—") return null;
  return (
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-widest mb-1.5"
        style={{ color: MAROON_DARK }}
      >
        {label}
      </p>
      <div
        className={`px-3 py-2.5 rounded-lg text-sm bg-[#F9FAFB] border border-[#E5E7EB] ${multiline ? "whitespace-pre-wrap" : ""}`}
        style={{ color: MAROON }}
      >
        {value}
      </div>
    </div>
  );
}

export function ClinicalRecordDetailModal({
  record,
  onClose,
}: {
  record: ClinicalHistoryEntry;
  onClose: () => void;
}) {
  const tagDiagnostics = record.diagnostics.filter((d) => d.tag);
  const primaryFromTags = record.diagnostics.find((d) => !d.tag);

  return (
    <>
      <style>{`
        .cr-detail-modal a,
        .cr-detail-modal a:visited,
        .cr-detail-modal a:hover {
          color: ${MAROON};
          text-decoration: none;
        }
        .cr-detail-modal a:hover {
          color: ${MAROON_DARK};
        }
      `}</style>
    <div
      className="cr-detail-modal fixed inset-0 z-[210] flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-[#E5E7EB] shadow-2xl my-4 bg-[#F3F4F6]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E5E7EB] bg-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold" style={{ color: MAROON }}>
              Clinical Record
            </h2>
            <p className="text-sm mt-0.5" style={{ color: MAROON_MUTED }}>
              {record.date} · {record.time}
              {record.specialty ? ` · ${record.specialty}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F4F6] border border-[#E5E7EB]"
            style={{ color: MAROON_MUTED }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          <FieldBlock label="Chief complaint" value={record.complaint} multiline />
          <FieldBlock
            label="Clinical observations"
            value={record.clinicalObs}
            multiline
          />
          <FieldBlock
            label="Primary diagnosis"
            value={
              record.primaryDiagnosis ||
              (primaryFromTags && !primaryFromTags.tag
                ? primaryFromTags.label
                : "")
            }
          />

          {tagDiagnostics.length > 0 && (
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: MAROON_DARK }}
              >
                Diagnostic tags
              </p>
              <div className="flex flex-wrap gap-2">
                {tagDiagnostics.map((d, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#681A2D]"
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {record.treatment.length > 0 && (
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: MAROON_DARK }}
              >
                Treatment & procedure plan
              </p>
              <div className="flex flex-col gap-2">
                {record.treatment.map((t, i) => (
                  <div
                    key={i}
                    className="px-3 py-2 rounded-lg text-sm bg-[#F9FAFB] border border-[#E5E7EB]"
                    style={{ color: MAROON }}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          )}

          <FieldBlock label="Prescriptions" value={record.prescriptions} multiline />
          <FieldBlock label="Follow-up" value={record.followUp} />

          {record.postOpInstructions && record.postOpInstructions.length > 0 && (
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: MAROON_DARK }}
              >
                Post-op instructions
              </p>
              <ul className="list-disc pl-5 text-sm space-y-1" style={{ color: MAROON }}>
                {record.postOpInstructions.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}

          <FieldBlock
            label="Additional notes"
            value={record.additionalNotes}
            multiline
          />

          {record.scans && record.scans.length > 0 && (
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-2"
                style={{ color: MAROON_DARK }}
              >
                Diagnostics & imaging
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {record.scans.map((scan) => (
                  <a
                    key={scan.storedName}
                    href={scan.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl overflow-hidden border border-[#E5E7EB] bg-white hover:shadow-md transition-shadow no-underline"
                    style={{ color: MAROON }}
                  >
                    {/^image\//i.test(scan.mimeType || "") ? (
                      <img
                        src={scan.url}
                        alt={scan.originalName}
                        className="w-full h-28 object-cover"
                      />
                    ) : (
                      <div className="h-28 flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-2xl mb-1">📄</span>
                        <span
                          className="text-[10px] line-clamp-2"
                          style={{ color: MAROON_MUTED }}
                        >
                          {scan.originalName}
                        </span>
                      </div>
                    )}
                    <p
                      className="text-[10px] px-2 py-1 truncate border-t border-[#E5E7EB]"
                      style={{ color: MAROON }}
                    >
                      {scan.originalName}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

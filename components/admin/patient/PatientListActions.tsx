"use client";

import { rowCanEditClinicalRecord } from "@/utils/clinicalRecord";

type RowStatus = { status: string; rawStatus?: string };

export function SendEmailActionIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function PatientListActions({
  row,
  text2,
  variant = "patients",
  onDelete,
  onView,
  onEditClinical,
  onSendEmail,
}: {
  row: RowStatus;
  text2: string;
  variant?: "appointments" | "patients";
  onDelete: (e: React.MouseEvent) => void;
  onView: (e: React.MouseEvent) => void;
  onEditClinical?: (e: React.MouseEvent) => void;
  onSendEmail?: (e: React.MouseEvent) => void;
}) {
  const canEdit = rowCanEditClinicalRecord(row.status, row.rawStatus);
  const btn =
    "w-7 h-7 flex items-center justify-center rounded-lg transition-colors shrink-0";

  return (
    <div
      className="flex items-center justify-center gap-1 w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title="View patient (read-only)"
        onClick={onView}
        className={`${btn} hover:bg-blue-100`}
        style={{ color: text2 }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        type="button"
        title="Delete appointment permanently"
        onClick={onDelete}
        className={`${btn} hover:bg-red-100`}
        style={{ color: text2 }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>

      {variant === "patients" && (
        <>
          <button
            type="button"
            title={canEdit ? "Edit clinical record" : "No clinical record to edit"}
            onClick={onEditClinical}
            disabled={!canEdit}
            className={`${btn} hover:bg-amber-100 disabled:opacity-35 disabled:pointer-events-none`}
            style={{ color: text2 }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            title="Send Email"
            onClick={onSendEmail}
            className={`${btn} hover:bg-blue-100`}
            style={{ color: text2 }}
          >
            <SendEmailActionIcon />
          </button>
        </>
      )}
    </div>
  );
}

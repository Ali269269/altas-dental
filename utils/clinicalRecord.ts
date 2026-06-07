export type ClinicalScanApi = {
  storedName: string;
  originalName: string;
  url: string;
  mimeType?: string;
  size?: number;
};

export type CheckupApiData = {
  complaint?: string;
  clinicalObs?: string;
  primaryDiagnosis?: string;
  diagnostics?: { label: string; tag?: boolean }[];
  treatment?: string[];
  prescriptions?: string;
  followUp?: string;
  postOpInstructions?: string[];
  additionalNotes?: string;
  scanNames?: string[];
  scans?: ClinicalScanApi[];
  completedAt?: string;
};

export type ClinicalRecordSavePayload = {
  complaint: string;
  clinicalObs: string;
  primaryDiagnosis: string;
  diagnostics: { label: string; tag?: boolean }[];
  treatment: string[];
  prescriptions: string;
  followUp: string;
  postOpInstructions: string[];
  additionalNotes: string;
  scanNames: string[];
  isEdit?: boolean;
};

export function hasStoredCheckup(checkup?: CheckupApiData | null): boolean {
  if (!checkup) return false;
  return (
    Boolean(checkup.complaint?.trim()) ||
    Boolean(checkup.clinicalObs?.trim()) ||
    Boolean(checkup.primaryDiagnosis?.trim()) ||
    (Array.isArray(checkup.diagnostics) && checkup.diagnostics.length > 0) ||
    (Array.isArray(checkup.treatment) && checkup.treatment.length > 0) ||
    Boolean(checkup.prescriptions?.trim()) ||
    Boolean(checkup.followUp?.trim()) ||
    (Array.isArray(checkup.postOpInstructions) &&
      checkup.postOpInstructions.length > 0) ||
    Boolean(checkup.additionalNotes?.trim())
  );
}

export function rowCanEditClinicalRecord(
  status: string,
  rawStatus?: string
): boolean {
  const raw = (rawStatus || status || "").toUpperCase();
  return raw === "SEEN" || raw === "COMPLETED";
}

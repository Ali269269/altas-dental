function getApiBaseUrl() {
  const raw =
    process.env.API_BASE_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  return raw.replace(/\/$/, '');
}

const { signClinicalScanDownload } = require('./clinicalScanDownloadToken');

function clinicalScanPublicUrl(appointmentId, storedName) {
  return `${getApiBaseUrl()}/uploads/clinical/${appointmentId}/${storedName}`;
}

/** Patient-facing download link (signed, forces file download). */
function clinicalScanDownloadUrl(appointmentId, storedName) {
  const token = signClinicalScanDownload(appointmentId, storedName);
  return `${getApiBaseUrl()}/api/statistics/clinical-scans/download?token=${encodeURIComponent(token)}`;
}

function mapScansForClient(appointmentId, scans) {
  if (!Array.isArray(scans)) return [];
  return scans.map((s) => {
    const storedName = s.storedName || s.filename;
    if (!storedName) return null;
    return {
      storedName,
      originalName: s.originalName || storedName,
      mimeType: s.mimeType || 'application/octet-stream',
      size: s.size || 0,
      url: clinicalScanDownloadUrl(appointmentId, storedName),
    };
  }).filter(Boolean);
}

module.exports = {
  getApiBaseUrl,
  clinicalScanPublicUrl,
  clinicalScanDownloadUrl,
  mapScansForClient,
};

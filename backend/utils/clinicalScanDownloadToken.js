const jwt = require('jsonwebtoken');

const DOWNLOAD_EXPIRE = '72h';
const ACTION = 'clinical_scan_download';

function getSecret() {
  return process.env.JWT_SECRET || process.env.APPOINTMENT_ACTION_SECRET;
}

function signClinicalScanDownload(appointmentId, storedName) {
  const secret = getSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured for clinical scan download links');
  }
  return jwt.sign(
    {
      appointmentId: String(appointmentId),
      storedName: String(storedName),
      action: ACTION,
    },
    secret,
    { expiresIn: DOWNLOAD_EXPIRE }
  );
}

function verifyClinicalScanDownload(token) {
  const secret = getSecret();
  if (!secret || !token) return null;
  try {
    const payload = jwt.verify(token, secret);
    if (payload.action !== ACTION) return null;
    if (!payload.appointmentId || !payload.storedName) return null;
    return {
      appointmentId: String(payload.appointmentId),
      storedName: String(payload.storedName),
    };
  } catch {
    return null;
  }
}

module.exports = {
  signClinicalScanDownload,
  verifyClinicalScanDownload,
};

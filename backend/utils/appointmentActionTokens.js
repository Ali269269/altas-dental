const jwt = require('jsonwebtoken');

const ACTION_EXPIRE = '7d';

function getActionSecret() {
  return process.env.JWT_SECRET || process.env.APPOINTMENT_ACTION_SECRET;
}

function signAppointmentAction(appointmentId, action) {
  const secret = getActionSecret();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured for appointment email actions');
  }
  return jwt.sign(
    {
      appointmentId: String(appointmentId),
      action,
    },
    secret,
    { expiresIn: ACTION_EXPIRE }
  );
}

function verifyAppointmentAction(token, expectedAction) {
  const secret = getActionSecret();
  if (!secret) return null;
  try {
    const payload = jwt.verify(token, secret);
    if (payload.action !== expectedAction) return null;
    if (!payload.appointmentId) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  signAppointmentAction,
  verifyAppointmentAction,
};

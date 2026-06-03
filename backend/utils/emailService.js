const nodemailer = require('nodemailer');
const { formatLongDate } = require('./dashboardHelpers');
const { signAppointmentAction } = require('./appointmentActionTokens');
const { escapeHtml } = require('./emailHtmlPages');

function getFrontendBaseUrl() {
  const raw = process.env.FRONTEND_URL || 'http://localhost:3000';
  return raw.split(',')[0].trim().replace(/\/$/, '');
}

function getApiBaseUrl() {
  const raw =
    process.env.API_BASE_URL ||
    process.env.BACKEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  return raw.replace(/\/$/, '');
}

function getRescheduleUrl() {
  return `${getFrontendBaseUrl()}/pages/Appointment`;
}

function getAdminEmail() {
  return (
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_USER ||
    ''
  ).trim();
}

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

let transporter = null;

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  if (!transport) {
    console.warn(
      '[email] SMTP not configured — skipping email to',
      to,
      `(${subject})`
    );
    return { sent: false, skipped: true };
  }

  const from =
    process.env.EMAIL_FROM ||
    `"Atlas Dental Center" <${process.env.SMTP_USER}>`;

  await transport.sendMail({ from, to, subject, html, text });
  return { sent: true };
}

function appointmentDetailsBlock(appt) {
  const dateLabel = formatLongDate(appt.appointmentDate);
  const phone = appt.phone ? `<p><strong>Phone:</strong> ${escapeHtml(appt.phone)}</p>` : '';
  const email = appt.email ? `<p><strong>Email:</strong> ${escapeHtml(appt.email)}</p>` : '';
  const notes = appt.notes
    ? `<p><strong>Notes:</strong> ${escapeHtml(appt.notes)}</p>`
    : '';
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;background:#faf8f5;border-radius:10px;border:1px solid #e8ddd4;">
      <tr><td style="padding:18px 20px;font-size:14px;line-height:1.7;color:#591727;">
        <p style="margin:0 0 8px;"><strong>Patient:</strong> ${escapeHtml(appt.patientName)}</p>
        ${email}
        ${phone}
        <p style="margin:8px 0;"><strong>Service:</strong> ${escapeHtml(appt.specialty)}</p>
        <p style="margin:8px 0;"><strong>Date:</strong> ${escapeHtml(dateLabel)}</p>
        <p style="margin:8px 0 0;"><strong>Time:</strong> ${escapeHtml(appt.appointmentTime)}</p>
        ${notes}
      </td></tr>
    </table>
  `;
}

function buildAdminActionUrls(appointmentId) {
  const base = `${getApiBaseUrl()}/api/statistics/appointments/actions`;
  const confirmToken = signAppointmentAction(appointmentId, 'confirm');
  const cancelToken = signAppointmentAction(appointmentId, 'cancel');
  return {
    confirmUrl: `${base}/confirm?token=${encodeURIComponent(confirmToken)}`,
    cancelUrl: `${base}/cancel?token=${encodeURIComponent(cancelToken)}`,
  };
}

async function sendAdminNewAppointmentEmail(appt) {
  const adminTo = getAdminEmail();
  if (!adminTo) {
    console.warn('[email] ADMIN_EMAIL / SMTP_USER not set — skipping admin notification');
    return { sent: false, skipped: true };
  }

  const { confirmUrl, cancelUrl } = buildAdminActionUrls(appt._id.toString());
  const dashboardUrl = `${getFrontendBaseUrl()}/dashboard/Appointments`;
  const subject = `New appointment request — ${appt.patientName}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f4eee1;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4eee1;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8ddd4;box-shadow:0 8px 32px rgba(89,23,39,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,#591727 0%,#711C31 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.75);">Atlas Dental Center</p>
            <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;">New appointment request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 20px;">
            <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#591727;">
              A patient has submitted a new appointment request. Please review the details below and take action.
            </p>
            ${appointmentDetailsBlock(appt)}
            <p style="margin:20px 0 0;font-size:13px;color:#7A6040;line-height:1.5;">
              Confirming will notify the patient by email. Cancelling will notify the patient that the appointment was not approved.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px;text-align:center;">
            <table role="presentation" cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td style="padding:0 8px;">
                  <a href="${confirmUrl}" style="display:inline-block;padding:14px 28px;background:#3DAA7A;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.02em;">
                    Confirm Appointment
                  </a>
                </td>
                <td style="padding:0 8px;">
                  <a href="${cancelUrl}" style="display:inline-block;padding:14px 28px;background:#ffffff;color:#8B1A2E;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;border:2px solid #8B1A2E;letter-spacing:0.02em;">
                    Cancel Appointment
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:#7A6040;">
              Or manage all requests in the
              <a href="${dashboardUrl}" style="color:#591727;font-weight:600;">admin dashboard</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#faf8f5;padding:16px 32px;text-align:center;border-top:1px solid #e8ddd4;">
            <p style="margin:0;font-size:11px;color:#9a8a82;">This link expires in 7 days. Do not forward this email.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `New appointment request\n\nPatient: ${appt.patientName}\nEmail: ${appt.email}\nPhone: ${appt.phone}\nService: ${appt.specialty}\nDate: ${formatLongDate(appt.appointmentDate)}\nTime: ${appt.appointmentTime}\n\nConfirm: ${confirmUrl}\nCancel: ${cancelUrl}`;

  return sendEmail({ to: adminTo, subject, html, text });
}

async function sendAppointmentConfirmationEmail(appt) {
  const rescheduleUrl = getRescheduleUrl();
  const subject = 'Your appointment is confirmed — Atlas Dental Center';
  const html = `
    <div style="font-family: Georgia, serif; color: #591727; max-width: 560px;">
      <h2 style="color: #591727;">Appointment confirmed</h2>
      <p>Dear ${escapeHtml(appt.patientName)},</p>
      <p>Your appointment at Atlas Dental Center has been <strong>confirmed</strong>.</p>
      ${appointmentDetailsBlock(appt)}
      <p>If you need to make changes, you may book a new time here:</p>
      <p><a href="${rescheduleUrl}" style="color: #591727;">Reschedule or book online</a></p>
      <p>We look forward to seeing you.</p>
      <p>Atlas Dental Center</p>
    </div>
  `;
  const text = `Dear ${appt.patientName},\n\nYour appointment is confirmed.\nService: ${appt.specialty}\nDate: ${formatLongDate(appt.appointmentDate)}\nTime: ${appt.appointmentTime}\n\nReschedule: ${rescheduleUrl}\n\nAtlas Dental Center`;

  return sendEmail({ to: appt.email, subject, html, text });
}

async function sendAppointmentCancellationEmail(appt, cancellationReason) {
  const rescheduleUrl = getRescheduleUrl();
  const reason =
    cancellationReason?.trim() ||
    'Your appointment was cancelled by the clinic.';
  const subject = 'Appointment cancelled — Atlas Dental Center';
  const html = `
    <div style="font-family: Georgia, serif; color: #591727; max-width: 560px;">
      <h2 style="color: #591727;">Appointment cancelled</h2>
      <p>Dear ${escapeHtml(appt.patientName)},</p>
      <p>We regret to inform you that your appointment has been <strong>cancelled</strong>.</p>
      <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
      ${appointmentDetailsBlock(appt)}
      <p>You can book a new appointment at any time using the link below:</p>
      <p><a href="${rescheduleUrl}" style="display: inline-block; padding: 10px 18px; background: #591727; color: #fff; text-decoration: none; border-radius: 8px;">Book a new appointment</a></p>
      <p>Or copy this link: ${rescheduleUrl}</p>
      <p>If you have questions, please contact us by phone.</p>
      <p>Atlas Dental Center</p>
    </div>
  `;
  const text = `Dear ${appt.patientName},\n\nYour appointment was cancelled.\nReason: ${reason}\n\nOriginal appointment:\nService: ${appt.specialty}\nDate: ${formatLongDate(appt.appointmentDate)}\nTime: ${appt.appointmentTime}\n\nBook again: ${rescheduleUrl}\n\nAtlas Dental Center`;

  return sendEmail({ to: appt.email, subject, html, text });
}

module.exports = {
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail,
  sendAdminNewAppointmentEmail,
  getAdminEmail,
  isEmailConfigured,
};

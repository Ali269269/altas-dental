const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { formatLongDate } = require('./dashboardHelpers');
const { signAppointmentAction } = require('./appointmentActionTokens');
const { escapeHtml } = require('./emailHtmlPages');
const { clinicalScanDownloadUrl } = require('./clinicalScanUrls');
const { clinicalRoot } = require('../middleware/clinicalScanUpload');
const { BRAND, FONT, contentCard } = require('./emailBrand');
const {
  getTemplateByKey,
  getTemplateById,
  renderTemplateString,
  buildFollowUpBox,
  buildTemplateVars,
  buildContactTemplateVars,
} = require('./emailTemplateEngine');

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
  return (process.env.SMTP_USER || process.env.ADMIN_EMAIL || '').trim();
}

function getFromAddress() {
  const user = (process.env.SMTP_USER || '').trim();
  if (!user) return '';
  return process.env.EMAIL_FROM || `"Atlas Dental Center" <${user}>`;
}

function isEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

let transporter = null;

function createSmtpTransport() {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = createSmtpTransport();
  }
  return transporter;
}

function resetTransporter() {
  transporter = null;
}

async function verifySmtpConnection() {
  if (!isEmailConfigured()) {
    console.warn('[email] SMTP not configured — appointment emails will be skipped');
    console.warn('[email] Set SMTP_HOST, SMTP_USER, and SMTP_PASS in backend/.env');
    return { ok: false, configured: false };
  }

  try {
    const transport = createSmtpTransport();
    await transport.verify();
    transporter = transport;
    return { ok: true, configured: true };
  } catch (error) {
    transporter = null;
    console.error('[email] SMTP verification failed:', error.message);
    return { ok: false, configured: true, error: error.message };
  }
}

async function sendEmail({ to, subject, html, text, attachments = [] }) {
  const from = getFromAddress();
  if (!from) {
    console.warn('[email] SMTP_USER not set — skipping email to', to, `(${subject})`);
    return { sent: false, skipped: true, reason: 'no_smtp_user' };
  }

  const transport = getTransporter();
  if (!transport) {
    console.warn('[email] SMTP not configured — skipping email to', to, `(${subject})`);
    return { sent: false, skipped: true, reason: 'not_configured' };
  }

  try {
    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
      text,
      attachments,
    });
    console.log(`[email] Sent "${subject}" → ${to} (messageId: ${info.messageId || 'n/a'})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    resetTransporter();
    console.error(`[email] Failed to send "${subject}" → ${to}:`, error.message);
    throw error;
  }
}

function buildClinicalScanEmailAssets(appt) {
  const id = appt._id?.toString() || String(appt.id || '');
  const scans = appt.checkup?.scans || [];
  const attachments = [];
  const imagingHtmlParts = [];
  const textLines = [];

  scans.forEach((scan) => {
    const storedName = scan.storedName || scan.filename;
    if (!storedName || !id) return;
    const filePath = path.join(clinicalRoot, id, storedName);
    if (!fs.existsSync(filePath)) return;

    const filename = scan.originalName || storedName;
    const mime = scan.mimeType || 'application/octet-stream';
    const isImage = /^image\//i.test(mime);
    const downloadUrl = clinicalScanDownloadUrl(id, storedName);

    attachments.push({
      filename,
      path: filePath,
      contentType: mime,
      contentDisposition: 'attachment',
    });

    textLines.push(`- ${filename}: ${downloadUrl}`);

    const typeHint = isImage
      ? `<span style="color:${BRAND.muted};font-size:12px;"> — image file</span>`
      : '';

    imagingHtmlParts.push(`
      <li style="margin:0 0 10px;">
        <a href="${escapeHtml(downloadUrl)}" style="color:${BRAND.maroon};font-size:14px;font-weight:600;text-decoration:underline;">
          Download ${escapeHtml(filename)}
        </a>${typeHint}
      </li>
    `);
  });

  const imagingSectionHtml = imagingHtmlParts.length
    ? `<div style="margin:16px 0 0;padding:16px;background:${BRAND.grayCard};border-radius:10px;border:1px solid ${BRAND.grayBorder};">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:${BRAND.maroon};letter-spacing:0.06em;text-transform:uppercase;">Diagnostics &amp; imaging</p>
        <p style="margin:0 0 12px;font-size:13px;color:${BRAND.muted};line-height:1.5;">
          Use the links below to download each file and view your images. The same files are also attached to this email.
        </p>
        <ul style="margin:0;padding-left:20px;color:${BRAND.maroon};">
          ${imagingHtmlParts.join('')}
        </ul>
      </div>`
    : '';

  return { attachments, imagingSectionHtml, textLines };
}

function appointmentDetailsBlock(appt) {
  const dateLabel = formatLongDate(appt.appointmentDate);
  const phone = appt.phone ? `<p style="margin:8px 0;"><strong>Phone:</strong> ${escapeHtml(appt.phone)}</p>` : '';
  const email = appt.email ? `<p style="margin:8px 0;"><strong>Email:</strong> ${escapeHtml(appt.email)}</p>` : '';
  const notes = appt.notes
    ? `<p style="margin:8px 0 0;"><strong>Notes:</strong> ${escapeHtml(appt.notes)}</p>`
    : '';
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${contentCard()}">
      <tr><td style="padding:18px 20px;font-size:14px;line-height:1.7;color:${BRAND.maroon};">
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

function patientAppointmentSummaryBlock(appt) {
  const dateLabel = formatLongDate(appt.appointmentDate);
  const notes = appt.notes
    ? `<tr>
        <td style="padding:12px 16px;border-top:1px solid ${BRAND.grayBorder};">
          <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Your notes</p>
          <p style="margin:0;font-size:14px;color:${BRAND.maroon};">${escapeHtml(appt.notes)}</p>
        </td>
      </tr>`
    : '';

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;background:${BRAND.white};border-radius:12px;border:1px solid ${BRAND.grayBorder};overflow:hidden;">
      <tr>
        <td style="padding:14px 16px;background:${BRAND.maroon};">
          <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Appointment summary</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px;background:${BRAND.grayCard};">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="50%" style="padding:0 8px 12px 0;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Service</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.maroon};">${escapeHtml(appt.specialty)}</p>
              </td>
              <td width="50%" style="padding:0 0 12px 8px;vertical-align:top;">
                <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Time</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.maroon};">${escapeHtml(appt.appointmentTime)}</p>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 0 0;border-top:1px solid ${BRAND.grayBorder};">
                <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.muted};">Date</p>
                <p style="margin:0;font-size:15px;font-weight:600;color:${BRAND.maroon};">${escapeHtml(dateLabel)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${notes}
    </table>
  `;
}

function buildPatientEmailLayout({
  headerTitle,
  headerSubtitle,
  accentColor,
  statusLabel,
  statusBg,
  statusTextColor,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  ctaBg,
  footerNote,
}) {
  const buttonBg = ctaBg || BRAND.maroon;
  const badgeBg = statusBg || BRAND.badgeBg;
  const badgeColor = statusTextColor || BRAND.maroon;

  const ctaBlock = ctaUrl
    ? `
        <tr>
          <td style="padding:8px 32px 28px;text-align:center;">
            <a href="${ctaUrl}" style="display:inline-block;padding:14px 32px;background:${buttonBg};color:${BRAND.white};text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.02em;">
              ${ctaLabel}
            </a>
          </td>
        </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${escapeHtml(headerTitle)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.grayPage};font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.grayPage};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.grayBorder};box-shadow:0 8px 32px rgba(89,23,39,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.maroon} 0%,${BRAND.maroonDark} 100%);padding:32px 32px 28px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.8);">Atlas Dental Center</p>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:600;color:${BRAND.white};line-height:1.3;">${escapeHtml(headerTitle)}</h1>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.92);line-height:1.5;">${escapeHtml(headerSubtitle)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;background:${BRAND.white};">
              <span style="display:inline-block;padding:8px 18px;background:${badgeBg};color:${badgeColor};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;border-radius:20px;border:1px solid ${BRAND.grayBorder};">
                ${escapeHtml(statusLabel)}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 12px;font-size:15px;line-height:1.65;color:${BRAND.maroon};background:${BRAND.white};">
              ${bodyHtml}
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="background:${BRAND.grayFooter};padding:20px 32px;text-align:center;border-top:1px solid ${BRAND.grayBorder};">
              <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:${BRAND.maroon};">Atlas Dental Center</p>
              <p style="margin:0;font-size:11px;color:${BRAND.muted};line-height:1.5;">${footerNote}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
<body style="margin:0;padding:0;background:${BRAND.grayPage};font-family:${FONT};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.grayPage};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.grayBorder};box-shadow:0 8px 32px rgba(89,23,39,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND.maroon} 0%,${BRAND.maroonDark} 100%);padding:28px 32px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.8);">Atlas Dental Center</p>
            <h1 style="margin:0;font-size:22px;font-weight:600;color:${BRAND.white};">New appointment request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 20px;background:${BRAND.white};">
            <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:${BRAND.maroon};">
              A patient has submitted a new appointment request. Please review the details below and take action.
            </p>
            ${appointmentDetailsBlock(appt)}
            <p style="margin:20px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.5;">
              Confirming will notify the patient by email. Cancelling will notify the patient that the appointment was not approved.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px;text-align:center;background:${BRAND.white};">
            <table role="presentation" cellpadding="0" cellspacing="0" align="center">
              <tr>
                <td style="padding:0 8px;">
                  <a href="${confirmUrl}" style="display:inline-block;padding:14px 28px;background:${BRAND.maroon};color:${BRAND.white};text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.02em;">
                    Confirm Appointment
                  </a>
                </td>
                <td style="padding:0 8px;">
                  <a href="${cancelUrl}" style="display:inline-block;padding:14px 28px;background:${BRAND.white};color:${BRAND.maroon};text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;border:2px solid ${BRAND.maroon};letter-spacing:0.02em;">
                    Cancel Appointment
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:12px;color:${BRAND.muted};">
              Or manage all requests in the
              <a href="${dashboardUrl}" style="color:${BRAND.maroon};font-weight:600;text-decoration:underline;">admin dashboard</a>.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:${BRAND.grayFooter};padding:16px 32px;text-align:center;border-top:1px solid ${BRAND.grayBorder};">
            <p style="margin:0;font-size:11px;color:${BRAND.muted};">This link expires in 7 days. Do not forward this email.</p>
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
  const dateLabel = formatLongDate(appt.appointmentDate);

  const bodyHtml = `
    <p style="margin:0 0 16px;">Dear <strong>${escapeHtml(appt.patientName)}</strong>,</p>
    <p style="margin:0 0 16px;">
      Great news — your appointment request has been reviewed and <strong>confirmed</strong> by our team.
      Please arrive a few minutes early and bring any relevant medical documents if applicable.
    </p>
    ${patientAppointmentSummaryBlock(appt)}
    <p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">
      If you need to change your visit, you can request a new time using the button below.
      We look forward to welcoming you.
    </p>
  `;

  const html = buildPatientEmailLayout({
    headerTitle: 'Appointment Confirmed',
    headerSubtitle: 'Your visit is scheduled with Atlas Dental Center',
    accentColor: BRAND.maroon,
    statusLabel: 'Confirmed',
    statusBg: BRAND.badgeBg,
    statusTextColor: BRAND.maroon,
    bodyHtml,
    ctaLabel: 'View or reschedule online',
    ctaUrl: rescheduleUrl,
    ctaBg: BRAND.maroon,
    footerNote: 'Thank you for choosing Atlas Dental Center. This is an automated message — please do not reply directly to this email.',
  });

  const text = `Dear ${appt.patientName},\n\nYour appointment is confirmed.\n\nService: ${appt.specialty}\nDate: ${dateLabel}\nTime: ${appt.appointmentTime}\n\nReschedule or book: ${rescheduleUrl}\n\nWe look forward to seeing you.\nAtlas Dental Center`;

  return sendEmail({ to: appt.email, subject, html, text });
}

async function sendAppointmentCancellationEmail(appt, cancellationReason) {
  const rescheduleUrl = getRescheduleUrl();
  const reason =
    cancellationReason?.trim() ||
    'Your appointment was cancelled by the clinic.';
  const subject = 'Appointment cancelled — Atlas Dental Center';
  const dateLabel = formatLongDate(appt.appointmentDate);

  const bodyHtml = `
    <p style="margin:0 0 16px;">Dear <strong>${escapeHtml(appt.patientName)}</strong>,</p>
    <p style="margin:0 0 16px;">
      We regret to inform you that your appointment at Atlas Dental Center could not be kept
      and has been <strong>cancelled</strong>.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;background:${BRAND.grayCard};border-radius:10px;border:1px solid ${BRAND.grayBorder};">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${BRAND.maroonLight};">Reason for cancellation</p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.maroon};">${escapeHtml(reason)}</p>
        </td>
      </tr>
    </table>
    ${patientAppointmentSummaryBlock(appt)}
    <p style="margin:16px 0 0;font-size:14px;color:${BRAND.muted};line-height:1.5;">
      You are welcome to book a new appointment at any time. If you have questions, please contact our clinic.
    </p>
  `;

  const html = buildPatientEmailLayout({
    headerTitle: 'Appointment Cancelled',
    headerSubtitle: 'We were unable to confirm your requested visit',
    accentColor: BRAND.maroon,
    statusLabel: 'Cancelled',
    statusBg: BRAND.badgeBg,
    statusTextColor: BRAND.maroonLight,
    bodyHtml,
    ctaLabel: 'Book a new appointment',
    ctaUrl: rescheduleUrl,
    ctaBg: BRAND.maroon,
    footerNote: 'We apologize for any inconvenience. This is an automated message — please contact the clinic for assistance.',
  });

  const text = `Dear ${appt.patientName},\n\nYour appointment was cancelled.\nReason: ${reason}\n\nService: ${appt.specialty}\nDate: ${dateLabel}\nTime: ${appt.appointmentTime}\n\nBook again: ${rescheduleUrl}\n\nAtlas Dental Center`;

  return sendEmail({ to: appt.email, subject, html, text });
}

async function sendPatientEmailByTemplateKey(appt, templateKey) {
  const template = await getTemplateByKey(templateKey);
  if (!template) {
    throw new Error(`Email template not found: ${templateKey}`);
  }

  const rescheduleUrl = getRescheduleUrl();
  const vars = buildTemplateVars(appt);
  const { attachments, imagingSectionHtml, textLines } = buildClinicalScanEmailAssets(appt);

  let statusLabel = template.statusLabel || 'Scheduled';
  if (
    templateKey === 'reminder' &&
    String(appt.status || '').toUpperCase() === 'CONFIRMED'
  ) {
    statusLabel = 'Confirmed';
  }

  const bodyHtml = renderTemplateString(template.body, {
    ...vars,
    appointmentSummary: patientAppointmentSummaryBlock(appt),
    followUpBox: buildFollowUpBox(appt),
    clinicalRecord: clinicalRecordBlock(appt, imagingSectionHtml),
  });

  const html = buildPatientEmailLayout({
    headerTitle: template.headerTitle,
    headerSubtitle: template.headerSubtitle,
    accentColor: BRAND.maroon,
    statusLabel,
    statusBg: BRAND.badgeBg,
    statusTextColor: BRAND.maroon,
    bodyHtml,
    ctaLabel: template.ctaLabel || 'Book or manage appointments',
    ctaUrl: rescheduleUrl,
    ctaBg: templateKey === 'reminder' ? '#591727' : BRAND.maroon,
    footerNote: template.footerNote,
  });

  const downloadsText =
    textLines.length > 0
      ? `\n\nDiagnostics & imaging (download links):\n${textLines.join('\n')}`
      : '';
  const text = `Dear ${appt.patientName},\n\n${template.headerTitle} from Atlas Dental Center.\n\nService: ${appt.specialty}\nDate: ${formatLongDate(appt.appointmentDate)}\nTime: ${appt.appointmentTime}${downloadsText}`;

  return sendEmail({
    to: appt.email,
    subject: template.subject,
    html,
    text,
    attachments,
  });
}

async function sendPatientEmailByType(appt, type) {
  const { PATIENT_EMAIL_TYPE_TO_KEY } = require('./systemEmailTemplates');
  const key = PATIENT_EMAIL_TYPE_TO_KEY[String(type || 'reminder').toLowerCase()] || 'reminder';
  return sendPatientEmailByTemplateKey(appt, key);
}

async function sendAppointmentReminderEmail(appt) {
  return sendPatientEmailByTemplateKey(appt, 'reminder');
}

function clinicalRecordBlock(appt, imagingSectionHtml = '') {
  const c = appt.checkup || {};
  const hasCheckup =
    Boolean(c.complaint?.trim()) ||
    Boolean(c.clinicalObs?.trim()) ||
    Boolean(c.primaryDiagnosis?.trim()) ||
    (Array.isArray(c.diagnostics) && c.diagnostics.length > 0) ||
    (Array.isArray(c.treatment) && c.treatment.length > 0) ||
    Boolean(c.prescriptions?.trim()) ||
    Boolean(c.followUp?.trim()) ||
    Boolean(c.additionalNotes?.trim()) ||
    (Array.isArray(c.postOpInstructions) && c.postOpInstructions.length > 0) ||
    (Array.isArray(c.scans) && c.scans.length > 0);

  if (!hasCheckup) {
    return `<p style="margin:0;font-size:14px;color:${BRAND.muted};">No clinical record is on file for this visit yet.</p>`;
  }

  const tagDiagnostics = (c.diagnostics || [])
    .filter((d) => typeof d === 'object' && d.tag)
    .map((d) => `<span style="display:inline-block;margin:2px 4px 2px 0;padding:4px 10px;background:${BRAND.maroonDeep};color:${BRAND.white};border-radius:12px;font-size:11px;">${escapeHtml(d.label)}</span>`)
    .join('');

  const treatment = (c.treatment || [])
    .map((t) => `<li style="margin:4px 0;">${escapeHtml(String(t))}</li>`)
    .join('');

  const postOp = (c.postOpInstructions || [])
    .map((line) => `<li style="margin:4px 0;">${escapeHtml(String(line))}</li>`)
    .join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${contentCard()}">
      <tr><td style="padding:18px 20px;font-size:14px;line-height:1.7;color:${BRAND.maroon};">
        ${c.complaint?.trim() ? `<p style="margin:0 0 10px;"><strong>Chief complaint:</strong><br/>${escapeHtml(c.complaint).replace(/\n/g, '<br/>')}</p>` : ''}
        ${c.clinicalObs?.trim() ? `<p style="margin:0 0 10px;"><strong>Clinical observations:</strong><br/>${escapeHtml(c.clinicalObs).replace(/\n/g, '<br/>')}</p>` : ''}
        ${c.primaryDiagnosis?.trim() ? `<p style="margin:0 0 10px;"><strong>Primary diagnosis:</strong> ${escapeHtml(c.primaryDiagnosis)}</p>` : ''}
        ${tagDiagnostics ? `<p style="margin:0 0 10px;"><strong>Diagnostic tags:</strong><br/>${tagDiagnostics}</p>` : ''}
        ${treatment ? `<p style="margin:0 0 6px;"><strong>Treatment &amp; procedures:</strong></p><ul style="margin:0 0 10px;padding-left:20px;">${treatment}</ul>` : ''}
        ${c.prescriptions?.trim() ? `<p style="margin:0 0 10px;"><strong>Prescriptions:</strong><br/>${escapeHtml(c.prescriptions).replace(/\n/g, '<br/>')}</p>` : ''}
        ${c.followUp?.trim() ? `<p style="margin:0 0 10px;"><strong>Follow-up:</strong> ${escapeHtml(c.followUp)}</p>` : ''}
        ${postOp ? `<p style="margin:0 0 6px;"><strong>Post-op instructions:</strong></p><ul style="margin:0 0 10px;padding-left:20px;">${postOp}</ul>` : ''}
        ${c.additionalNotes?.trim() ? `<p style="margin:0 0 10px;"><strong>Additional notes:</strong><br/>${escapeHtml(c.additionalNotes).replace(/\n/g, '<br/>')}</p>` : ''}
        ${imagingSectionHtml}
      </td></tr>
    </table>
  `;
}

function sendPatientEmailWithClinicalRecord(appt, { subject, headerTitle, headerSubtitle, accentColor, statusLabel, statusBg, statusTextColor, ctaLabel, ctaBg, introHtml, footerNote }) {
  const rescheduleUrl = getRescheduleUrl();
  const { attachments, imagingSectionHtml, textLines } = buildClinicalScanEmailAssets(appt);
  const bodyHtml = `
    ${introHtml}
    ${patientAppointmentSummaryBlock(appt)}
    ${clinicalRecordBlock(appt, imagingSectionHtml)}
  `;
  const html = buildPatientEmailLayout({
    headerTitle,
    headerSubtitle,
    accentColor,
    statusLabel,
    statusBg,
    statusTextColor,
    bodyHtml,
    ctaLabel: ctaLabel || 'Book or manage appointments',
    ctaUrl: rescheduleUrl,
    ctaBg: ctaBg || BRAND.maroon,
    footerNote,
  });
  const downloadsText =
    textLines.length > 0
      ? `\n\nDiagnostics & imaging (download links):\n${textLines.join('\n')}`
      : '';
  const text = `Dear ${appt.patientName},\n\n${headerTitle} from Atlas Dental Center.\n\nService: ${appt.specialty}\nDate: ${formatLongDate(appt.appointmentDate)}\nTime: ${appt.appointmentTime}${downloadsText}`;
  return sendEmail({ to: appt.email, subject, html, text, attachments });
}

async function sendPatientFollowUpEmail(appt) {
  return sendPatientEmailByTemplateKey(appt, 'follow_up');
}

async function sendPatientTreatmentSummaryEmail(appt) {
  return sendPatientEmailByTemplateKey(appt, 'clinical_summary');
}

async function sendSubscriberEmail({ to, subject, body, templateId, recipientName }) {
  if (templateId) {
    const template = await getTemplateById(templateId);
    if (template?.headerTitle) {
      const rescheduleUrl = getRescheduleUrl();
      const vars = buildContactTemplateVars(recipientName || to.split('@')[0], to);
      const bodyHtml = renderTemplateString(template.body, {
        ...vars,
        appointmentSummary: '',
        followUpBox: '',
        clinicalRecord: `<p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.maroon};">${escapeHtml(body || template.body).replace(/\n/g, '<br/>')}</p>`,
      });

      const html = buildPatientEmailLayout({
        headerTitle: template.headerTitle,
        headerSubtitle: template.headerSubtitle,
        accentColor: BRAND.maroon,
        statusLabel: template.statusLabel || 'Message',
        statusBg: BRAND.badgeBg,
        statusTextColor: BRAND.maroon,
        bodyHtml,
        ctaLabel: template.ctaLabel || 'Visit our website',
        ctaUrl: rescheduleUrl,
        ctaBg: BRAND.maroon,
        footerNote: template.footerNote,
      });

      return sendEmail({
        to,
        subject: subject || template.subject,
        html,
        text: body || template.body,
      });
    }
  }

  const safeBody = escapeHtml(body).replace(/\n/g, '<br/>');
  const html = `
    <div style="font-family:${FONT};max-width:560px;margin:0 auto;padding:24px;color:${BRAND.maroon};">
      <h2 style="margin:0 0 16px;color:${BRAND.maroon};">${escapeHtml(subject)}</h2>
      <p style="margin:0;line-height:1.6;font-size:15px;">${safeBody}</p>
      <p style="margin:24px 0 0;font-size:12px;color:${BRAND.muted};">Atlas Dental Center</p>
    </div>
  `;
  return sendEmail({ to, subject, html, text: body });
}

async function sendAdminPasswordResetEmail({
  to,
  firstName = '',
  tempPassword,
  loginUrl,
  canChangePassword = false,
}) {
  const safeName = escapeHtml(firstName || 'Admin');
  const safePassword = escapeHtml(tempPassword);
  const safeLoginUrl = escapeHtml(loginUrl);

  const subject = 'Atlas Dental Center — Password Reset';
  const html = `
    <div style="font-family:${FONT};max-width:560px;margin:0 auto;padding:24px;color:${BRAND.maroon};line-height:1.6;">
      <h2 style="margin:0 0 16px;color:${BRAND.maroon};">Password Reset</h2>
      <p>Hello ${safeName},</p>
      <p>Your password reset request has been processed by the Super Admin.</p>
      <p><strong>Temporary password:</strong> ${safePassword}</p>
      <p>Please sign in here: <a href="${safeLoginUrl}" style="color:${BRAND.maroon};">${safeLoginUrl}</a></p>
      <p>Select your assigned role during login.</p>
      ${
        canChangePassword
          ? '<p>You may update your password later from Settings if permitted.</p>'
          : '<p>Please contact the Super Admin if you need further assistance.</p>'
      }
      <p style="margin:24px 0 0;font-size:12px;color:${BRAND.muted};">Atlas Dental Center</p>
    </div>
  `;
  const text = `Your temporary password is: ${tempPassword}. Sign in at ${loginUrl}`;

  return sendEmail({ to, subject, html, text });
}

module.exports = {
  sendEmail,
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail,
  sendAppointmentReminderEmail,
  sendPatientFollowUpEmail,
  sendPatientTreatmentSummaryEmail,
  sendAdminNewAppointmentEmail,
  sendAdminPasswordResetEmail,
  sendPatientEmailByTemplateKey,
  sendPatientEmailByType,
  sendSubscriberEmail,
  getAdminEmail,
  getFromAddress,
  isEmailConfigured,
  verifySmtpConnection,
};

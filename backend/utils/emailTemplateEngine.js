const EmailTemplate = require('../models/EmailTemplate');
const { SYSTEM_EMAIL_TEMPLATES } = require('./systemEmailTemplates');
const { formatLongDate } = require('./dashboardHelpers');
const { escapeHtml } = require('./emailHtmlPages');
const { BRAND } = require('./emailBrand');

function renderTemplateString(template, vars) {
  let output = String(template || '');
  Object.entries(vars).forEach(([key, value]) => {
    output = output.split(`{{${key}}}`).join(value ?? '');
  });
  return output;
}

async function getTemplateByKey(key) {
  if (!key) return null;
  const doc = await EmailTemplate.findOne({ key }).lean();
  if (doc) return doc;
  return SYSTEM_EMAIL_TEMPLATES.find((t) => t.key === key) || null;
}

async function getTemplateById(id) {
  if (!id) return null;
  return EmailTemplate.findById(id).lean();
}

function buildFollowUpBox(appt) {
  const followUpText =
    appt.checkup?.followUp?.trim() ||
    'Please contact our clinic if you have questions about your recent visit.';
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;background:${BRAND.grayCard};border-radius:10px;border:1px solid ${BRAND.grayBorder};">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:${BRAND.maroon};">${escapeHtml(followUpText)}</p>
      </td></tr>
    </table>`;
}

function buildTemplateVars(appt, extras = {}) {
  return {
    patientName: escapeHtml(appt.patientName || 'Patient'),
    email: escapeHtml(appt.email || ''),
    specialty: escapeHtml(appt.specialty || ''),
    dateLabel: escapeHtml(formatLongDate(appt.appointmentDate)),
    appointmentTime: escapeHtml(appt.appointmentTime || ''),
    ...extras,
  };
}

function buildContactTemplateVars(name, email) {
  return {
    patientName: escapeHtml(name || 'Patient'),
    email: escapeHtml(email || ''),
    specialty: 'General dentistry',
    dateLabel: '—',
    appointmentTime: '—',
  };
}

module.exports = {
  getTemplateByKey,
  getTemplateById,
  renderTemplateString,
  buildFollowUpBox,
  buildTemplateVars,
  buildContactTemplateVars,
};
